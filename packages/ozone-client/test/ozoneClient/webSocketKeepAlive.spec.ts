import { assert } from 'chai'
import { fakeServer } from 'nise'
import type SockJS from 'sockjs-client'

import { OzoneClient } from '../../src/index'

const { FakeSockJS, sockets } = vi.hoisted(() => {
	const created: Socket[] = []

	// Shaped like the real SockJS: the ready states are on the class, not on its instances
	class Socket {
		static readonly CONNECTING = 0
		static readonly OPEN = 1
		static readonly CLOSING = 2
		static readonly CLOSED = 3

		readyState: number = Socket.CONNECTING
		readonly closeCodes: number[] = []
		onopen: (() => void) | null = null
		onmessage: ((event: { data: string }) => void) | null = null
		onerror: ((event: Event) => void) | null = null
		onclose: ((event: { code: number }) => void) | null = null

		constructor(readonly url: string) {
			created.push(this)
		}

		send(): void {}

		// Like the real one, reports the close later, after the client has moved on
		close(code: number): void {
			this.closeCodes.push(code)
			this.readyState = Socket.CLOSING
			setTimeout(() => this.fireClose(code), 0)
		}

		open(): void {
			this.readyState = Socket.OPEN
			this.onopen?.()
		}

		receive(data: string): void {
			this.onmessage?.({ data })
		}

		closedByServer(code: number): void {
			this.fireClose(code)
		}

		private fireClose(code: number): void {
			this.readyState = Socket.CLOSED
			this.onclose?.({ code })
		}
	}

	return { FakeSockJS: Socket, sockets: created }
})

vi.mock('sockjs-client', () => ({ default: FakeSockJS }))

const lastSocket = () => sockets[sockets.length - 1]

const credentials: OzoneClient.OzoneCredentials = {
	authenticate: () =>
		Promise.resolve({ sessionId: 'session', principalId: 'device', principalType: 'device' }),
}

async function connectedClient() {
	const client = OzoneClient.newOzoneClient({
		ozoneURL: 'http://my.ozone.domain/ozone',
		webSocketsURL: 'http://my.ozone.domain/ws',
		ozoneCredentials: credentials,
	})
	await client.start()
	vi.useFakeTimers()
	lastSocket().open()
	return { client, socket: lastSocket() }
}

describe('OzoneClient WebSocket keep-alive', () => {
	afterEach(() => {
		vi.useRealTimers()
		vi.restoreAllMocks()
		sockets.length = 0
	})

	it('runs against a fake shaped like the real SockJS', async () => {
		const { default: RealSockJS } = await vi.importActual<{ default: typeof SockJS }>(
			'sockjs-client',
		)
		assert.equal(RealSockJS.OPEN, FakeSockJS.OPEN)
		assert.equal(RealSockJS.CONNECTING, FakeSockJS.CONNECTING)
		assert.notProperty(RealSockJS.prototype, 'OPEN')
		assert.notProperty(FakeSockJS.prototype, 'OPEN')
	})

	it('closes a connection that gets no pong for a minute, though the socket still looks open', async () => {
		const { client, socket } = await connectedClient()

		vi.advanceTimersByTime(50000)
		assert.isEmpty(socket.closeCodes)
		assert.isTrue(client.isConnected)

		vi.advanceTimersByTime(20000)
		assert.deepEqual(socket.closeCodes, [4000])
		assert.equal(client.state, OzoneClient.states.WS_CONNECTION_ERROR)
	})

	it('keeps a connection whose pongs come back late but within the minute', async () => {
		const { client, socket } = await connectedClient()

		for (let i = 0; i < 3; i++) {
			vi.advanceTimersByTime(50000)
			socket.receive('pong')
		}

		assert.isEmpty(socket.closeCodes)
		assert.isTrue(client.isConnected)
	})

	it('keeps a connection that was fine when the device went to standby', async () => {
		const { client, socket } = await connectedClient()
		vi.advanceTimersByTime(20000)
		socket.receive('pong')

		// No timer runs in standby, while the clock moves on
		vi.setSystemTime(Date.now() + 3600000)
		vi.advanceTimersByTime(10000)

		assert.isEmpty(socket.closeCodes)
		assert.isTrue(client.isConnected)
	})

	it('still closes a connection without pong after the clock was set back', async () => {
		const { socket } = await connectedClient()

		vi.setSystemTime(Date.now() - 3600000)
		vi.advanceTimersByTime(70000)

		assert.deepEqual(socket.closeCodes, [4000])
	})

	it('waits at least 9 s before reconnecting after a ping timeout', async () => {
		// The shortest delay the jitter allows
		vi.spyOn(Math, 'random').mockReturnValue(0)
		await connectedClient()

		vi.advanceTimersByTime(70000)
		vi.advanceTimersByTime(8999)
		assert.lengthOf(sockets, 1)

		vi.advanceTimersByTime(1)
		assert.lengthOf(sockets, 2)
	})

	it('reconnects after 1 s when the server closes the connection', async () => {
		vi.spyOn(Math, 'random').mockReturnValue(0)
		const { socket } = await connectedClient()

		socket.closedByServer(1006)
		vi.advanceTimersByTime(999)
		assert.lengthOf(sockets, 1)

		vi.advanceTimersByTime(1)
		assert.lengthOf(sockets, 2)
	})

	it('goes back to the usual reconnect delay once reconnected after a ping timeout', async () => {
		vi.spyOn(Math, 'random').mockReturnValue(0)
		await connectedClient()
		vi.advanceTimersByTime(70000 + 9000)
		lastSocket().open()

		vi.advanceTimersByTime(30000)
		lastSocket().closedByServer(1006)
		vi.advanceTimersByTime(1000)

		assert.lengthOf(sockets, 3)
	})

	it('closes the socket before logging in again', async () => {
		const { client, socket } = await connectedClient()

		client.updateCredentials(credentials)

		assert.deepEqual(socket.closeCodes, [4000])
	})

	it('closes the socket when the client stops', async () => {
		const server = fakeServer.create({ respondImmediately: true })
		server.respondWith('GET', 'http://my.ozone.domain/ozone/rest/v3/authentication/logout', [
			200,
			{},
			'',
		])
		try {
			const { client, socket } = await connectedClient()
			vi.useRealTimers()

			await client.stop()

			assert.deepEqual(socket.closeCodes, [4000])
			assert.equal(client.state, OzoneClient.states.STOPPED)
		} finally {
			server.restore()
		}
	})
})
