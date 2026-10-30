import { assert } from 'chai'
import { fakeServer, FakeServer, FakeXMLHttpRequest } from 'nise'
import { Request, Response } from 'typescript-http-client'

import { OzoneClient } from '../../src/index'

const { FakeSockJS, sockets } = vi.hoisted(() => {
	const created: Socket[] = []

	// Just enough of SockJS for the client to open a connection and see the server close it
	class Socket {
		static readonly CONNECTING = 0
		static readonly OPEN = 1
		static readonly CLOSED = 3

		readyState: number = Socket.CONNECTING
		readonly closeCodes: number[] = []
		onopen: (() => void) | null = null
		onclose: ((event: { code: number }) => void) | null = null

		constructor(readonly url: string) {
			created.push(this)
		}

		send(): void {}

		close(code: number): void {
			this.closeCodes.push(code)
			this.readyState = Socket.CLOSED
		}

		open(): void {
			this.readyState = Socket.OPEN
			this.onopen?.()
		}

		closedByServer(code: number): void {
			this.readyState = Socket.CLOSED
			this.onclose?.({ code })
		}
	}

	return { FakeSockJS: Socket, sockets: created }
})

vi.mock('sockjs-client', () => ({ default: FakeSockJS }))

const ozoneURL = 'http://my.ozone.domain/ozone'

// Logins the test answers by hand, so that it can put calls in flight around them
class ManualCredentials implements OzoneClient.OzoneCredentials {
	private readonly pending: {
		resolve: (authInfo: OzoneClient.AuthInfo) => void
		reject: (e: unknown) => void
	}[] = []

	get logins(): number {
		return this.pending.length
	}

	authenticate(): Promise<OzoneClient.AuthInfo> {
		return new Promise((resolve, reject) => this.pending.push({ resolve, reject }))
	}

	succeed(sessionId: string): void {
		this.pending[this.pending.length - 1].resolve({
			sessionId,
			principalId: 'device',
			principalType: 'device',
		})
	}

	fail(e: unknown): void {
		this.pending[this.pending.length - 1].reject(e)
	}

	refuse(): void {
		this.fail(new Response(new Request(ozoneURL), 401, 'Unauthorized', {}, null))
	}
}

interface Outcome<T> {
	settled: boolean
	value?: T
	error?: Response<unknown>
}

function track<T>(promise: Promise<T>): Outcome<T> {
	const outcome: Outcome<T> = { settled: false }
	promise.then(
		(value) => Object.assign(outcome, { settled: true, value }),
		(error) => Object.assign(outcome, { settled: true, error }),
	)
	return outcome
}

// Lets the responses travel back through the filters
const settle = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('OzoneClient session refresh', () => {
	let server: FakeServer
	let credentials: ManualCredentials
	let client: OzoneClient.OzoneClient

	async function startClient(config: Partial<OzoneClient.ClientConfiguration> = {}) {
		credentials = new ManualCredentials()
		client = OzoneClient.newOzoneClient({ ozoneURL, ozoneCredentials: credentials, ...config })
		const started = client.start()
		credentials.succeed('session-1')
		await started
	}

	async function stopClient() {
		const stopped = client.stop()
		// The logout
		server.requests[server.requests.length - 1].respond(200, {}, '')
		await stopped
	}

	beforeEach(async () => {
		server = fakeServer.create()
		await startClient()
	})

	afterEach(async () => {
		// Stopped, a client leaves no re-auth or keep-alive timer running after the test
		if (client.state !== OzoneClient.states.STOPPED) {
			await stopClient()
		}
		server.restore()
		sockets.length = 0
	})

	const get = (id: string) =>
		track(client.call<{ id: string }>(new Request(`${ozoneURL}/rest/v3/items/item/${id}`)))

	const sentFor = (id: string): FakeXMLHttpRequest[] =>
		server.requests.filter((request) => request.url.endsWith(`/item/${id}`))

	const sessionOf = (request: FakeXMLHttpRequest): string | undefined =>
		(request.requestHeaders as Record<string, string>)['Ozone-Session-Id']

	const refuse = (request: FakeXMLHttpRequest, status: number) => request.respond(status, {}, '')

	const serve = (request: FakeXMLHttpRequest, id: string) =>
		request.respond(200, { 'Content-Type': 'application/json' }, JSON.stringify({ id }))

	it('replays a call refused during a login once that login is done, without logging in again', async () => {
		const first = get('first')
		const second = get('second')
		await settle()

		refuse(sentFor('first')[0], 401)
		await settle()
		assert.equal(credentials.logins, 2)

		refuse(sentFor('second')[0], 403)
		await settle()
		assert.isFalse(second.settled)

		credentials.succeed('session-2')
		await settle()
		assert.equal(credentials.logins, 2)
		assert.lengthOf(sentFor('first'), 2)
		assert.lengthOf(sentFor('second'), 2)
		assert.equal(sessionOf(sentFor('first')[1]), 'session-2')
		assert.equal(sessionOf(sentFor('second')[1]), 'session-2')

		serve(sentFor('first')[1], 'first')
		serve(sentFor('second')[1], 'second')
		await settle()
		assert.deepEqual(first.value, { id: 'first' })
		assert.deepEqual(second.value, { id: 'second' })
	})

	it('replays a call refused for a session that has since been replaced, without logging in again', async () => {
		const first = get('first')
		const second = get('second')
		await settle()
		refuse(sentFor('first')[0], 401)
		await settle()
		credentials.succeed('session-2')
		await settle()
		serve(sentFor('first')[1], 'first')
		await settle()
		assert.deepEqual(first.value, { id: 'first' })

		// Sent with session-1, before the login, and refused only now
		assert.equal(sessionOf(sentFor('second')[0]), 'session-1')
		refuse(sentFor('second')[0], 401)
		await settle()

		assert.equal(credentials.logins, 2)
		assert.equal(client.state, OzoneClient.states.AUTHENTICATED)
		assert.lengthOf(sentFor('second'), 2)
		assert.equal(sessionOf(sentFor('second')[1]), 'session-2')
		serve(sentFor('second')[1], 'second')
		await settle()
		assert.deepEqual(second.value, { id: 'second' })
	})

	it('replays a call refused for a session a login has renewed under the same id, without logging in again', async () => {
		const first = get('first')
		const second = get('second')
		await settle()
		refuse(sentFor('first')[0], 401)
		await settle()
		// As SessionCredentials can, when the session behind the cookie is still valid
		credentials.succeed('session-1')
		await settle()
		serve(sentFor('first')[1], 'first')
		await settle()
		assert.deepEqual(first.value, { id: 'first' })

		refuse(sentFor('second')[0], 401)
		await settle()

		assert.equal(credentials.logins, 2)
		assert.lengthOf(sentFor('second'), 2)
		serve(sentFor('second')[1], 'second')
		await settle()
		assert.deepEqual(second.value, { id: 'second' })
	})

	it('replays a call sent without a session once a login has given the client one, without logging in again', async () => {
		get('first')
		await settle()
		refuse(sentFor('first')[0], 401)
		await settle()
		credentials.refuse()
		await settle()
		assert.equal(client.state, OzoneClient.states.AUTHENTICATION_ERROR)

		const anonymous = get('anonymous')
		await settle()
		assert.isUndefined(sessionOf(sentFor('anonymous')[0]))
		client.updateCredentials(credentials)
		credentials.succeed('session-2')
		await settle()

		refuse(sentFor('anonymous')[0], 401)
		await settle()
		assert.equal(credentials.logins, 3)
		assert.lengthOf(sentFor('anonymous'), 2)
		assert.equal(sessionOf(sentFor('anonymous')[1]), 'session-2')
		serve(sentFor('anonymous')[1], 'anonymous')
		await settle()
		assert.deepEqual(anonymous.value, { id: 'anonymous' })
	})

	it('neither replays nor logs in again for a refusal that names the principal: the session is valid', async () => {
		const forbidden = get('forbidden')
		await settle()

		sentFor('forbidden')[0].respond(403, { 'ozone-principal-id': 'device' }, '')
		await settle()

		assert.equal(forbidden.error?.status, 403)
		assert.equal(credentials.logins, 1)
		assert.lengthOf(sentFor('forbidden'), 1)
	})

	it('holds the calls made during a login until it is done, and sends them with the new session', async () => {
		get('first')
		await settle()
		refuse(sentFor('first')[0], 401)
		await settle()

		const during = get('during')
		await settle()
		assert.isEmpty(sentFor('during'))

		credentials.succeed('session-2')
		await settle()
		assert.lengthOf(sentFor('during'), 1)
		assert.equal(sessionOf(sentFor('during')[0]), 'session-2')
		serve(sentFor('during')[0], 'during')
		await settle()
		assert.deepEqual(during.value, { id: 'during' })
	})

	it('keeps the WebSocket of the new session when a call refused for the old one comes back late', async () => {
		// A client that also connects the WebSocket, in place of the default one
		await startClient({ webSocketsURL: 'http://my.ozone.domain/ws' })
		sockets[0].open()
		const first = get('first')
		await settle()

		// The session expires: the server closes the WebSocket, and the client logs in again
		sockets[0].closedByServer(4001)
		assert.equal(credentials.logins, 2)
		const during = get('during')
		await settle()
		assert.isEmpty(sentFor('during'))

		credentials.succeed('session-2')
		await settle()
		assert.lengthOf(sockets, 2)
		assert.include(sockets[1].url, 'ozoneSessionId=session-2')
		sockets[1].open()
		assert.equal(sessionOf(sentFor('during')[0]), 'session-2')
		serve(sentFor('during')[0], 'during')

		// Sent with session-1, before the login, and refused only now
		refuse(sentFor('first')[0], 401)
		await settle()

		assert.equal(credentials.logins, 2)
		assert.isEmpty(sockets[1].closeCodes)
		assert.isTrue(client.isConnected)
		assert.equal(sessionOf(sentFor('first')[1]), 'session-2')
		serve(sentFor('first')[1], 'first')
		await settle()
		assert.deepEqual(first.value, { id: 'first' })
		assert.deepEqual(during.value, { id: 'during' })
	})

	describe('when the login fails', () => {
		const failures: [string, OzoneClient.ClientState, () => void | Promise<void>][] = [
			[
				'the credentials are refused',
				OzoneClient.states.AUTHENTICATION_ERROR,
				() => credentials.refuse(),
			],
			[
				'the server cannot be reached',
				OzoneClient.states.NETWORK_OR_SERVER_ERROR,
				() => credentials.fail(new Error('Network error')),
			],
			['the client is stopped', OzoneClient.states.STOPPED, () => stopClient()],
		]

		it.each(failures)(
			'fails the calls waiting for it with their own response, without replaying them, when %s',
			async (_, endState, failLogin) => {
				const first = get('first')
				const second = get('second')
				await settle()
				refuse(sentFor('first')[0], 401)
				await settle()
				refuse(sentFor('second')[0], 403)
				await settle()

				await failLogin()
				await settle()

				assert.equal(client.state, endState)
				assert.lengthOf(sentFor('first'), 1)
				assert.lengthOf(sentFor('second'), 1)
				assert.equal(first.error?.status, 401)
				assert.equal(second.error?.status, 403)
			},
		)

		it('sends the calls it held without a session, as the client sends any call once in error', async () => {
			get('first')
			await settle()
			refuse(sentFor('first')[0], 401)
			await settle()
			const during = get('during')
			await settle()

			credentials.refuse()
			await settle()

			assert.lengthOf(sentFor('during'), 1)
			assert.isUndefined(sessionOf(sentFor('during')[0]))
			refuse(sentFor('during')[0], 403)
			await settle()
			assert.equal(during.error?.status, 403)
			assert.equal(credentials.logins, 2)
		})
	})
})
