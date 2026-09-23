import type { Logger } from 'generic-logger-typings'
import { AssumeStateIsNot, AssumeStateIs,AssumeStateIsNotIn, AssumeStateIsIn, StateMachineImpl, ListenerRegistration } from 'typescript-state-machine'
import {
	Response as HttpClientResponse,
	Request,
	InstalledFilter,
	HttpClient,
	newHttpClient,
	FilterCollection,
	Filter,
	FilterChain,
	setLogger
} from 'typescript-http-client'
import SockJS from 'sockjs-client'
import { DeviceMessage, Item, UUID } from '@taktik/ozone-type'
import { ClientState, states, validTransitions } from './clientState'
import { ItemClient } from '../itemClient/itemClient'
import { BlobClient } from '../blobClient/blobClient'
import { RoleClient } from '../roleClient/roleClient'
import { PermissionClient } from '../permissionClient/permissionClient'
import { TypeClient } from '../typeClient/typeClient'
import { ItemClientImpl } from '../itemClient/itemClientImpl'
import { BlobClientImpl } from '../blobClient/blobClientImpl'
import { RoleClientImpl } from '../roleClient/roleClientImpl'
import { PermissionClientImpl } from '../permissionClient/permissionClientImpl'
import { TypeClientImpl } from '../typeClient/typeClientImpl'
import { Cache } from '../cache/cache'
import {
	OzoneClient,
	OzoneCredentials,
	AuthInfo,
	ClientConfiguration,
	AuthenticatedPrincipal,
	DEFAULT_FILTERS
} from './ozoneClient'
import { TaskClient } from '../taskClient/taskClient'
import { TaskClientImpl } from '../taskClient/taskClientImpl'
import { ImportExportClient } from '../importExportClient/importExportClient'
import { ImportExportClientImpl } from '../importExportClient/importExportClientImpl'
import { FiletypeClientImpl } from '../filetypeClient/filetypeClientImpl'
import { FileTypeClient } from '../filetypeClient/filetypeClient'
import { TenantClient } from '../tenantClient/tenantClient'
import { TenantClientImpl } from '../tenantClient/tenantClientImpl'

const MAX_REAUTH_DELAY: number = 60000
const INITIAL_REAUTH_DELAY: number = 1000
const REAUTH_BACKOFF_FACTOR: number = 2

const MAX_WS_RECONNECT_DELAY: number = 120000
const INITIAL_WS_RECONNECT_DELAY: number = 2000
const WS_RECONNECT_BACKOFF_FACTOR: number = 3

const MAX_SESSION_CHECK_DELAY: number = 60000
const DEFAULT_TIMEOUT = 5000
const RETRY_JITTER_RATIO: number = 0.5

/*
	Spread a retry delay so that clients which failed simultaneously do not retry
	simultaneously. Applied to the timer only, never to the value the back-off progression is
	computed from, so the schedule stays exactly 2s / 6s / 18s / 54s / 120s while the actual
	firing time of each step is randomized around it.
*/
function withRetryJitter(delayMs: number): number {
	const spread: number = 1 - RETRY_JITTER_RATIO + 2 * RETRY_JITTER_RATIO * Math.random()
	return Math.round(delayMs * spread)
}

class Listener {
	active: boolean = true
}

class MessageListener extends Listener {
	constructor(
		readonly callBack: (message: DeviceMessage) => void,
		readonly messageType?: string
	) {
		super()
	}
}

interface MessageListeners {
	[messageType: string]: MessageListener[]
}

export interface OzoneClientInternals extends OzoneClient {
	/* Allow state change */
	setState(newState: ClientState): void
}

export class OzoneClientImpl extends StateMachineImpl<ClientState> implements OzoneClientInternals {
	private readonly _config: ClientConfiguration
	private _authInfo?: AuthInfo
	private _ws?: WebSocket
	private _lastFailedLogin?: HttpClientResponse<AuthInfo>
	private readonly _messageListeners: MessageListeners
	private _lastSessionCheck: number = 0
	private _httpClient: HttpClient
	private acknowledgedCache: Cache<UUID, boolean> = new Cache({ max: 100, maxAge: 60000 })
	readonly preFilters: InstalledFilter[] = []
	readonly postFilters: InstalledFilter[] = []
	protected static log?: Logger

	setLogger(logger: Logger): void {
		super.setLogger(logger)
		OzoneClientImpl.log = logger
		setLogger(logger)
	}

	constructor(configuration: ClientConfiguration) {
		super(Object.values(states), validTransitions, states.STOPPED)
		this._config = configuration
		this._messageListeners = {}
		this.setupTransitionListeners()
		this._httpClient = newHttpClient()
		// Setup client & filters
		this.setupFilters(configuration.defaultFilters)
		this._roleClient = new RoleClientImpl(this, this._config.ozoneURL)
		this._permissionClient = new PermissionClientImpl(this, this._config.ozoneURL)
		this._typeClient = new TypeClientImpl(this, this._config.ozoneURL)
		this._taskClient = new TaskClientImpl(this, this._config.ozoneURL)
		this._importExportClient = new ImportExportClientImpl(this, this._config.ozoneURL)
		this._filetypeClient = new FiletypeClientImpl(this, this._config.ozoneURL)
		this._tenantClient = new TenantClientImpl(this, this._config.ozoneURL)
	}

	get config(): ClientConfiguration {
		return this._config
	}

	get authInfo(): AuthInfo | undefined {
		return this._authInfo
	}

	get lastFailedLogin(): HttpClientResponse<AuthInfo> | undefined {
		return this._lastFailedLogin
	}

	get isAuthenticated(): boolean {
		return this.inOneOfStates([states.WS_CONNECTED, states.WS_CONNECTING, states.WS_CONNECTION_ERROR, states.AUTHENTICATED])
	}

	get isConnected(): boolean {
		return this.inState(states.WS_CONNECTED)
	}

	onMessage<M extends DeviceMessage>(messageType: string, callBack: (message: M) => void): ListenerRegistration {
		return this.addMessageListener(message => callBack(message as M), messageType)
	}

	onAnyMessage(callBack: (message: any) => void): ListenerRegistration {
		return this.addMessageListener(callBack, undefined)
	}

	send(message: DeviceMessage): void {
		this.checkInState(states.WS_CONNECTED, 'Cannot send message : Not connected')
		this._ws!.send(JSON.stringify(message))
	}

	async start(): Promise<void> {
		this.checkInState(states.STOPPED, 'Client already started')
		this.setState(states.STARTED)
		if (this.config.ozoneCredentials) {
			await this.waitUntilEnteredOneOf([states.AUTHENTICATION_ERROR, states.AUTHENTICATED, states.NETWORK_OR_SERVER_ERROR])
		}
	}

	updateWSURL(url: string): void {
		if (this._config.webSocketsURL !== url) {
			this._config.webSocketsURL = url
			// If we are authenticated but not connected to WS, try to connect
			if (this.canGoToState(states.WS_CONNECTING)) {
				this.connectIfPossible()
			} else if (this.inOneOfStates([states.WS_CONNECTED, states.WS_CONNECTING])) {
				OzoneClientImpl.terminateWSConnectionForcefully(this._ws!)
			}
		}
	}

	updateWSParams(params: { [key: string]: string }): void {
		const merged = { ...this._config.webSocketsParams, ...params }
		if (JSON.stringify(merged) === JSON.stringify(this._config.webSocketsParams)) {
			return
		}
		this._config.webSocketsParams = merged
		// If we are authenticated but not connected to WS, try to connect
		if (this.canGoToState(states.WS_CONNECTING)) {
			this.connectIfPossible()
		} else if (this.inOneOfStates([states.WS_CONNECTED, states.WS_CONNECTING])) {
			OzoneClientImpl.terminateWSConnectionForcefully(this._ws!)
		}
	}

	private buildWebSocketUrl(): string {
		const params: { [key: string]: string | undefined } = {
			ozoneSessionId: this.authInfo!.sessionId,
			...this._config.webSocketsParams
		}
		const query = Object.keys(params)
			.filter(key => !!params[key])
			.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key]!)}`)
			.join('&')
		const base = this._config.webSocketsURL!
		return `${base}${base.indexOf('?') === -1 ? '?' : '&'}${query}`
	}

	updateCredentials(credentials: OzoneCredentials): void {
		this._config.ozoneCredentials = credentials
		if (this.canGoToState(states.AUTHENTICATING)) {
			this.loginIfPossible()
		} else if (this.inOneOfStates([states.WS_CONNECTED, states.WS_CONNECTING])) {
			OzoneClientImpl.terminateWSConnectionForcefully(this._ws!)
		}
	}

	currentPrincipal(): Promise<AuthenticatedPrincipal> {
		if (!this.isAuthenticated) {
			throw Error('Cannot retrieve principal: client is not authenticated.')
		}
		const request = new Request(`${this.config.ozoneURL}/rest/v3/authentication/current/principal`)
			.set({
				method: 'GET',
				withCredentials: true
			})
		return this.call(request)
	}

	async stop(): Promise<void> {
		this.setState(states.STOPPING)
		await this.waitUntilEnteredOneOf([states.STOPPED, states.NETWORK_OR_SERVER_ERROR])
	}

	async call<T>(call: Request): Promise<T> {
		return this._httpClient.call<T>(call)
	}

	async callForResponse<T>(call: Request): Promise<HttpClientResponse<T>> {
		return this._httpClient.callForResponse<T>(call)
	}

	private onWsMessage(message: MessageEvent) {
		if (message.data === 'ping') {
			this._ws && this._ws.send('pong')
		} else if (message.data === 'pong') {
			this.handlePong()
		} else {
			const parsedJSONMessage = OzoneClientImpl.parseMessage(message)

			if (parsedJSONMessage) {
				if (this.acknowledgeMessage(parsedJSONMessage.postingId, parsedJSONMessage.ttl)) {
					this.dispatchMessage(parsedJSONMessage)
				}
			}
		}
	}

	private acknowledgeMessage(postingId?: UUID, ttl?: number): boolean {
		let shouldProcess = true

		try {
			if (postingId) {
				shouldProcess = !this.acknowledgedCache.has(postingId)
				this.acknowledgedCache.set(postingId, true, ttl)
				this._ws && this._ws.send(JSON.stringify({ '$type': 'Ack', postingId }))
			}
		} catch (err) {
			this.log?.warn(err, 'error in WS message acknowledge')
		}

		return shouldProcess
	}

	private static parseMessage(message: MessageEvent): DeviceMessage | null {
		try {
			return JSON.parse(message.data) as DeviceMessage
		} catch (e) {
			OzoneClientImpl.log?.error('Unable to parse websocket message:', message, '// Error:', e)
			return null
		}
	}

	@AssumeStateIs(states.WS_CONNECTED)
	private handlePong() {
		this._lastReceivedPong = Date.now()
	}

	// Attempt a single Ozone login
	@AssumeStateIs(states.AUTHENTICATING)
	private async login() {
		// Destroy any existing WS
		this.destroyWs()
		try {
			this._authInfo = undefined
			this.log?.debug('Authenticating')
			this.log?.debug(`this.config.ozoneURL ${this.config.ozoneURL}`)
			this._authInfo = await this.config.ozoneCredentials!.authenticate(this.config.ozoneURL)
			this.log?.debug(`Authenticated with authInfo : ${JSON.stringify(this._authInfo)}`)
			this._lastFailedLogin = undefined
			this._lastSessionCheck = Date.now()
			this.setState(states.AUTHENTICATED)
		} catch (e) {
			if (e instanceof HttpClientResponse) {
				this.log?.debug(`Authentication error : code ${e.status}`)
				this._lastFailedLogin = e
				if (e.status >= 400 && e.status < 500) {
					// Invalid credentials
					this.setState(states.AUTHENTICATION_ERROR)
				} else {
					this.setState(states.NETWORK_OR_SERVER_ERROR)
				}
			} else {
				this.log?.warn('Authentication error', e)
				this.setState(states.NETWORK_OR_SERVER_ERROR)
			}
		}
	}
	// Attempt a single Ozone logout
	@AssumeStateIs(states.STOPPING)
	private async logout() {
		this.log?.debug('stopping')
		// Destroy any existing WS
		this.destroyWs()
		try {
			const httpClient = newHttpClient()
			const request = new Request(`${this.config.ozoneURL}/rest/v3/authentication/logout`)
				.set({
					method: 'GET',
					withCredentials: true
				})
			await (httpClient.call<void>(request))
			this._authInfo = undefined
			this.setState(states.STOPPED)
		} catch (e) {
			if (e instanceof HttpClientResponse) {
				this.log?.debug(`Logout error : code ${e.status}`)
				this._lastFailedLogin = e
				if (e.status >= 400 && e.status < 500) {
					// Invalid credentials
					this.setState(states.STOPPED)
				} else {
					this.setState(states.NETWORK_OR_SERVER_ERROR)
				}
			} else {
				this.log?.warn('Logout error', e)
				this.setState(states.NETWORK_OR_SERVER_ERROR)
			}
		}
	}

	private static terminateWSConnectionForcefully(ws: WebSocket) {
		ws.close(4000)
		// Call onError explicitly, because close() doesn't call onClose immediately
		ws.onerror!(new Event('ForceClose'))
	}

	private destroyWs() {
		if (this._ws) {
			let socket = this._ws
			this._ws = undefined
			try {
				if (socket.readyState === socket.CONNECTING || socket.readyState === socket.OPEN) {
					socket.close(4000)
				}
			} catch (e) {
				// TODO AB DO something with e ?
			}
		}
	}

	// Attempt a single WebSocket connect
	@AssumeStateIs(states.WS_CONNECTING)
	connect(): Promise<void> {
		// Destroy any existing WS
		this.destroyWs()
		this.log?.info(`Connecting to ${this._config.webSocketsURL}`)
		return new Promise<void>((resolve, reject) => {
			/* FIXME AB Something is wrong here. The promise resolve or reject method should always be called but it is not the case */
			const ws = new SockJS(this.buildWebSocketUrl())
			this._ws = ws
			ws.onerror = ev => {
				if (this._ws === ws) {
					let mustReject = this._state === states.WS_CONNECTING
					try {
						if (this.state !== states.WS_CONNECTION_ERROR) {
							// Destroy the WS
							this.destroyWs()
							this.setState(states.WS_CONNECTION_ERROR)
						}
					} finally {
						if (mustReject) {
							reject(ev)
						}
					}
				}
			}
			ws.onclose = ev => {
				if (this._ws === ws) {
					let mustReject = this._state === states.WS_CONNECTING
					try {
						if (this.state !== states.WS_CONNECTION_ERROR) {
							// Destroy the WS
							this.destroyWs()
							if (ev.code === 4001) {
								this.setState(states.AUTHENTICATING)
							} else {
								this.setState(states.WS_CONNECTION_ERROR)
							}
						}
					} finally {
						if (mustReject) {
							reject(ev)
						}
					}
				}
			}
			ws.onopen = () => {
				let mustResolve = this._state === states.WS_CONNECTING
				try {
					this.log?.info(`Connected to ${this._config.webSocketsURL}`)
					this.setState(states.WS_CONNECTED)
				} catch (e) {
					mustResolve = false
					reject(e)
				}
				if (mustResolve) {
					resolve()
				}
			}
			ws.onmessage = (msg) => {
				if (this._ws === ws) {
					this.onWsMessage(msg)
				}
			}
		})
	}

	/*
        Login if we have credentials
    */
	private loginIfPossible() {
		if (this._config.ozoneCredentials) {
			this.setState(states.AUTHENTICATING)
		}
	}

	/*
        Connect if we have an URL, ignore errors
    */
	private connectIfPossible() {
		if (this._config.webSocketsURL) {
			this.setState(states.WS_CONNECTING)
		}
	}

	private addMessageListener(callBack: (message: DeviceMessage) => void, messageType?: string) {
		const messageTypeLabel = messageType || '*'
		if (!this._messageListeners[messageTypeLabel]) {
			this._messageListeners[messageTypeLabel] = []
		}
		const listenersForMessageType = this._messageListeners[messageTypeLabel]
		const messageListener = new MessageListener(callBack, messageType)
		listenersForMessageType.push(messageListener)
		return {
			cancel(): void {
				messageListener.active = false
			}
		}
	}

	// Auto Re-auth to Ozone

	private _lastReAuthDelay: number = 0
	private _reAuthTimeout: number = 0

	/*
		Exponential back-off, derived from the previous SCHEDULED delay, like the WS one below.
		It used to be derived from the measured wall time between two attempts, which folds the
		jitter into the progression and makes it drift instead of following a defined schedule.
	*/
	private nextReAuthRetryInterval(): number {
		if (this._lastReAuthDelay === 0) {
			return INITIAL_REAUTH_DELAY
		}
		return Math.min(REAUTH_BACKOFF_FACTOR * this._lastReAuthDelay, MAX_REAUTH_DELAY)
	}

	@AssumeStateIsIn([states.NETWORK_OR_SERVER_ERROR, states.AUTHENTICATION_ERROR])
	private createAutoReAuthTimer() {
		const retryInterval = this.nextReAuthRetryInterval()
		this._lastReAuthDelay = retryInterval
		this._reAuthTimeout = window.setTimeout(() =>
			(async () => {
				try {
					if (this.canGoToState(states.AUTHENTICATING)) {
						this.setState(states.AUTHENTICATING)
					}
				} catch (e) {
					this.log?.info('login failed : ' + e)
				}
			})(), withRetryJitter(retryInterval))
	}

	@AssumeStateIsNotIn([states.NETWORK_OR_SERVER_ERROR, states.AUTHENTICATION_ERROR])
	private clearAutoReAuthTimer() {
		window.clearTimeout(this._reAuthTimeout)
		this._reAuthTimeout = 0
	}

	private clearAutoReAuthRetryTimestamps() {
		this._lastReAuthDelay = 0
	}

	// WS KeepAlive

	private _wsKeepAliveTimer?: number
	private _lastReceivedPong: number = 0
	private _lastSentPing: number = 0

	private installWSPingKeepAlive() {
		if (this._wsKeepAliveTimer) {
			// should not happen
			this.log?.warn('wsKeepAliveTimer defined when it should not be')
			clearTimeout(this._wsKeepAliveTimer)
		}
		this._lastReceivedPong = Date.now()
		this._wsKeepAliveTimer = window.setInterval(() => this.wsKeepAlive(), 10000)
	}

	private destroyWSPingKeepAlive() {
		this._lastSentPing = 0
		this._lastReceivedPong = 0
		if (this._wsKeepAliveTimer) {
			clearTimeout(this._wsKeepAliveTimer)
			this._wsKeepAliveTimer = undefined
		}
	}

	@AssumeStateIs(states.WS_CONNECTED)
	private wsKeepAlive() {
		if (!this._ws) {
			return
		}
		// We have at least sent one ping and no pong received for more than 30s since last ping
		// --> Problem. We close the socket and trigger onClose()
		if (this._lastSentPing !== 0 && (this._lastSentPing - this._lastReceivedPong) > 20000) {
			if (this._ws.readyState === this._ws.CONNECTING || this._ws.readyState === this._ws.OPEN) {
				this.log?.warn('Ping timeout, closing connection')
				OzoneClientImpl.terminateWSConnectionForcefully(this._ws)
			}
		} else {
			const now = Date.now()
			this._lastSentPing = now
			let message: string = 'ping'
			if (now - this._lastSessionCheck > MAX_SESSION_CHECK_DELAY) {
				this._lastSessionCheck = now
				/*
                                            It has been a while since we last checked the session validity,
                                            so ask the WS server to check it. The server will close the connection
                                            if the session is expired
                                     */
				message += '!'
			}
			this._ws.send(message)
		}
	}

	// WS Auto-reconnect

	private _lastWSRetryDelay: number = 0
	private _wsReconnectTimeout: number = 0

	/*
		Exponential back-off, derived from the previous SCHEDULED delay.

		It used to be derived from the measured wall time between two attempts
		(`now - _lastWSReconnect`), which also contained the duration of the failed attempt
		and, since jitter was added, the jitter itself. The progression therefore drifted
		with network conditions instead of following a defined schedule. Tracking the
		scheduled value keeps the sequence exactly 2s, 6s, 18s, 54s, 120s, 120s, ...
	*/
	private nextWSRetryInterval(): number {
		if (this._lastWSRetryDelay === 0) {
			return INITIAL_WS_RECONNECT_DELAY
		}
		return Math.min(WS_RECONNECT_BACKOFF_FACTOR * this._lastWSRetryDelay, MAX_WS_RECONNECT_DELAY)
	}

	@AssumeStateIs(states.WS_CONNECTION_ERROR)
	private createAutoReconnectWSTimer() {
		const retryInterval = this.nextWSRetryInterval()
		this._lastWSRetryDelay = retryInterval
		this._wsReconnectTimeout = window.setTimeout(() => (async () => {
			if (this.canGoToState(states.WS_CONNECTING)) {
				this.setState(states.WS_CONNECTING)
			}
		})(), withRetryJitter(retryInterval))
	}

	@AssumeStateIsNot(states.WS_CONNECTION_ERROR)
	private clearAutoReconnectWSTimer() {
		window.clearTimeout(this._wsReconnectTimeout)
		this._wsReconnectTimeout = 0
	}

	private _clearWSRetryTimestampsTimeout: number = 0

	@AssumeStateIs(states.WS_CONNECTED)
	private scheduleClearAutoReconnectWSRetryTimestamps() {
		this._clearWSRetryTimestampsTimeout = window.setTimeout(() => {
			this._lastWSRetryDelay = 0
		}, 30000)
	}

	@AssumeStateIsNot(states.WS_CONNECTED)
	private cancelClearAutoReconnectWSRetryTimestamps() {
		window.clearTimeout(this._clearWSRetryTimestampsTimeout)
		this._clearWSRetryTimestampsTimeout = 0
	}

	private static invokeMessageListeners(message: DeviceMessage, listeners?: MessageListener[]) {
		if (listeners) {
			for (let index = 0; index < listeners.length; index++) {
				let listener = listeners[index]
				if (listener.active) {
					try {
						listener.callBack(message)
					} catch (e) {
						OzoneClientImpl.log?.warn('Uncaught error in message listener :' + e)
					}
				} else {
					// Remove inactive listener
					listeners.splice(index, 1)
					index--
				}
			}
		}
	}

	private dispatchMessage(message: DeviceMessage) {
		if (message.type) {
			OzoneClientImpl.invokeMessageListeners(message, this._messageListeners[message.type])
		}
		OzoneClientImpl.invokeMessageListeners(message, this._messageListeners['*'])
	}

	private setupTransitionListeners() {
		// Initiate login when started if possible
		this.onEnterState(states.STARTED, () => this.loginIfPossible())
		// Perform login when entering state "AUTHENTICATING"
		this.onEnterState(states.AUTHENTICATING, () => this.login())
		// Auto re-authenticate to Ozone in case of error
		this.onEnterState(states.NETWORK_OR_SERVER_ERROR, () => this.createAutoReAuthTimer())
		this.onLeaveState(states.NETWORK_OR_SERVER_ERROR, () => this.clearAutoReAuthTimer())
		this.onEnterState(states.AUTHENTICATED, () => this.clearAutoReAuthRetryTimestamps())
		this.onEnterState(states.AUTHENTICATION_ERROR, () => this.createAutoReAuthTimer())
		this.onLeaveState(states.AUTHENTICATION_ERROR, () => this.clearAutoReAuthTimer())
		// Auto-connect WebSocket when authenticated to Ozone
		this.onEnterState(states.AUTHENTICATED, () => this.connectIfPossible())
		// Connect to message server when entering state "CONNECTING"
		this.onEnterState(states.WS_CONNECTING, () => this.connect())
		// WS Ping KeepAlive
		this.onEnterState(states.WS_CONNECTED, () => this.installWSPingKeepAlive())
		this.onLeaveState(states.WS_CONNECTED, () => this.destroyWSPingKeepAlive())
		// Auto-reconnect WS in case of error
		this.onEnterState(states.WS_CONNECTION_ERROR, () => this.createAutoReconnectWSTimer())
		this.onLeaveState(states.WS_CONNECTION_ERROR, () => this.clearAutoReconnectWSTimer())
		this.onEnterState(states.WS_CONNECTED, () => this.scheduleClearAutoReconnectWSRetryTimestamps())
		this.onLeaveState(states.WS_CONNECTED, () => this.cancelClearAutoReconnectWSRetryTimestamps())
		this.onEnterState(states.STOPPING, () => this.logout())
	}

	private setupFilters(defaultFilters = Object.values(DEFAULT_FILTERS)) {
		if (defaultFilters.includes(DEFAULT_FILTERS.PRE_FILTERS)) {
			// Add pre-filters
			this._httpClient.addFilter(new FilterCollection(this.preFilters), DEFAULT_FILTERS.PRE_FILTERS)
		}
		if (defaultFilters.includes(DEFAULT_FILTERS.SESSION_REFRESH)) {
			// Try to auto-refresh the session if expired
			this._httpClient.addFilter(new SessionRefreshFilter(this, lastCheck => this._lastSessionCheck = lastCheck), DEFAULT_FILTERS.SESSION_REFRESH)
		}
		if (defaultFilters.includes(DEFAULT_FILTERS.SESSION_FILTER)) {
			// Add Ozone session header to all requests
			this._httpClient.addFilter(new SessionFilter(() => this._authInfo), DEFAULT_FILTERS.SESSION_FILTER)
		}
		if (defaultFilters.includes(DEFAULT_FILTERS.DEFAULT_OPTIONS)) {
			// Set some sensible default to all requests
			this._httpClient.addFilter(new DefaultsOptions(this._config.defaultTimeout || DEFAULT_TIMEOUT), DEFAULT_FILTERS.DEFAULT_OPTIONS)
		}
		if (defaultFilters.includes(DEFAULT_FILTERS.POST_FILTERS)) {
			// Add post-filters
			this._httpClient.addFilter(new FilterCollection(this.postFilters), DEFAULT_FILTERS.POST_FILTERS)
		}

	}

	itemClient<T extends Item>(typeIdentifier: string): ItemClient<T> {
		const client = this
		const baseURL = this._config.ozoneURL
		return new ItemClientImpl(client, baseURL, typeIdentifier)
	}

	blobClient(): BlobClient {
		const client = this
		const baseURL = this._config.ozoneURL
		return new BlobClientImpl(client, baseURL)
	}

	private _roleClient: RoleClient
	roleClient(): RoleClient {
		return this._roleClient
	}

	private _permissionClient: PermissionClient
	permissionClient(): PermissionClient {
		return this._permissionClient
	}

	private _typeClient: TypeClient
	typeClient(): TypeClient {
		return this._typeClient
	}

	private _taskClient: TaskClient
	taskClient(): TaskClient {
		return this._taskClient
	}

	private _importExportClient: ImportExportClient
	importExportClient(): ImportExportClient {
		return this._importExportClient
	}
	private _filetypeClient: FileTypeClient
	fileTypeClient(): FileTypeClient {
		return this._filetypeClient
	}

	private _tenantClient: TenantClient
	tenantClient(): TenantClient {
		return this._tenantClient
	}

	insertSessionIdInURL(url: string): string {
		if (!url.startsWith(this.config.ozoneURL)) {
			throw new Error(`insertSessionIdInURL : Given url should start with base url ${this.config.ozoneURL}`)
		}
		if (!this.authInfo) {
			throw new Error(`insertSessionIdInURL : There is no valid session`)
		}
		return `${this.config.ozoneURL}/dsid=${this.authInfo.sessionId}${url.substring(this.config.ozoneURL.length)}`
	}

	addCustomFilter(filter: Filter<any, any>, name: string): void {
		this._httpClient.addFilter(filter, name)
	}
}

/*
    Add sensible defaults to requests
*/
class DefaultsOptions implements Filter<any, any> {
	private readonly defaultTimeout: number

	constructor(defaultTimeout: number) {
		this.defaultTimeout = defaultTimeout
	}

	async doFilter(request: Request, filterChain: FilterChain<any>): Promise<HttpClientResponse<any>> {
		if (!request.timeout) {
			request.timeout = this.defaultTimeout
		}
		return filterChain.doFilter(request)
	}
}

/*
		Try to transparently re-authenticate and retry the call if we received a 403 or 401.
		Also, update the last session check
	*/
class SessionRefreshFilter implements Filter<any, any> {
	constructor(readonly client: OzoneClientInternals, readonly sessionCheckCallBack: (lastCheck: number) => void) {}

	async doFilter(call: Request, filterChain: FilterChain<any>): Promise<HttpClientResponse<any>> {
		try {
			const response = await filterChain.doFilter(call)
			const principalId = response.headers['ozone-principal-id']
			if (principalId && this.client.authInfo && principalId === this.client.authInfo.principalId) {
				this.sessionCheckCallBack(Date.now())
			}
			return response
		} catch (e) {
			const response = e as HttpClientResponse<any>
			// Try to detect if the session needs to be refreshed
			if (
				// Only try to re-authenticate if we receive a 401 or 403 status code
				(response.status === 403 || response.status === 401)
				// If we receive a principal id, it means we are still authenticated with a valid session, so there is no need
				// to try to re-authenticate
				&& !response.headers['ozone-principal-id']
				// Only try to re-authenticate if we are already authenticated
				&& this.client.isAuthenticated) {
				try {
					// TODO AB Protect this call to avoid multiple login in //
					// TODO AB Destroy WebSocket ( don't wait connecting state)
					// This will trigger a login
					this.client.setState(states.AUTHENTICATING)
					// await result of login
					await this.client.waitUntilLeft(states.AUTHENTICATING)
					// Retry the call
					return await filterChain.doFilter(call)
				} catch (e) {
					// TODO AB Maybe : set state to authentication error in case of login error?
					throw e
				}
			} else {
				throw e
			}
		}
	}
}

/*
    Add "Ozone-Session-Id" Header
*/
class SessionFilter implements Filter<any, any> {
	constructor(readonly authProvider: () => AuthInfo | undefined) {}

	async doFilter(call: Request, filterChain: FilterChain<any>): Promise<HttpClientResponse<any>> {
		const authInfo = this.authProvider()
		if (authInfo) {
			call.addHeader('Ozone-Session-Id', authInfo.sessionId)
		}
		return filterChain.doFilter(call)
	}
}
