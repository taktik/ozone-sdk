/*
    Main interface for the Ozone Client
    This class manage connection and communication to ozone
*/
import type { Logger } from 'generic-logger-typings'
import { StateMachine, ListenerRegistration } from 'typescript-state-machine'
import type { Filter, InstalledFilter, Request, Response } from 'typescript-http-client'
import { DeviceMessage, Item, Principal, User, UUID } from '@taktik/ozone-type'
import { ClientState } from './clientState'
import { ItemClient } from '../itemClient/itemClient'
import { BlobClient } from '../blobClient/blobClient'
import { RoleClient } from '../roleClient/roleClient'
import { PermissionClient } from '../permissionClient/permissionClient'
import { TypeClient } from '../typeClient/typeClient'
import { TaskClient } from '../taskClient/taskClient'
import { ImportExportClient } from '../importExportClient/importExportClient'
import { FileTypeClient } from '../filetypeClient/filetypeClient'
import { TenantClient } from '../tenantClient/tenantClient'

export enum DEFAULT_FILTERS {
	PRE_FILTERS= 'pre-filters',
	SESSION_REFRESH = 'session-refresh',
	SESSION_FILTER = 'session-filter',
	DEFAULT_OPTIONS = 'default-options',
	POST_FILTERS = 'post-filters'
}

export interface AuthInfo {
	sessionId: string,
	principalId: string,
	principalType: string,
}

export interface ClientConfiguration {
	ozoneURL: string
	ozoneInstanceId?: string
	ozoneCredentials?: OzoneCredentials
	webSocketsURL?: string
	/* Extra query params appended to the WS URL (e.g. device identifiers, surfaced in access logs) */
	webSocketsParams?: { [key: string]: string }
	defaultTimeout?: number
	defaultFilters?: DEFAULT_FILTERS[] // If not defined, we add all defaults filters
}

export interface OzoneCredentials {
	authenticate(ozoneURL: string): Promise<AuthInfo>
}

export type AuthenticatedPrincipal = ((User & { tenantId: UUID }) | (Principal & { tenant: UUID })) & { id: UUID }

export interface OzoneClient extends StateMachine<ClientState> {

	/* Get the client config */
	readonly config: ClientConfiguration

	/* Get the current Authentication if available */
	readonly authInfo?: AuthInfo

	/* Get the last failed login call if any */
	readonly lastFailedLogin?: Response<AuthInfo>

	/*
        Convenience props for getting the status of the client.
    */
	readonly isAuthenticated: boolean
	readonly isConnected: boolean

	/*
        Start the client. To be called once
    */
	start(): Promise<void>

	/*
        The array of filters to apply to all HTTP calls
        BEFORE this OzoneClient's own internal filters.
        This array can be modified at any time to add/remove filters
     */
	readonly preFilters: InstalledFilter[]

	/*
        The array of filters to apply to all HTTP calls
        AFTER this OzoneClient's own internal filters.
        This array can be modified at any time to add/remove filters
     */
	readonly postFilters: InstalledFilter[]

	/*
        Update the WS URL.
        The client will attempt to connect automatically to the new URL.
    */
	updateWSURL(url: string): void

	/*
        Merge extra query params into the WS URL.
        The client will reconnect if already connected and the params changed.
    */
	updateWSParams(params: { [key: string]: string }): void

	/*
        Update the Ozone credentials.
        The client will attempt to login automatically.
    */
	updateCredentials(ozoneCredentials: OzoneCredentials): void

	/**
	 * Retrieve the principal this client has authenticated with
	 * @throws if client is not authenticated
	 */
	currentPrincipal(): Promise<AuthenticatedPrincipal>

	/*
        Stop the client. To be called once
    */
	stop(): Promise<void>

	/*
        Perform a low-level call
        All calls towards Ozone or other Microservices secured by Ozone should use those calls
    */
	callForResponse<T>(request: Request): Promise<Response<T>>

	call<T>(request: Request): Promise<T>

	/*
        Register a message listener.

        @param messageType The type of message to register for
        @param callBack The callBack that will be called
    */
	onMessage<M extends DeviceMessage>(messageType: string, callBack: (message: M) => void): ListenerRegistration

	onAnyMessage(callBack: (message: DeviceMessage) => void): ListenerRegistration

	/*
        Send a message
    */
	send(message: DeviceMessage): void

	// BEGIN HIGH LEVEL CALLS

	/*
        Get a client for working with items of the given type
    */
	itemClient<T extends Item>(typeIdentifier: string): ItemClient<T>
	/*
        Get a ``lob`` for working with blob
    */
	blobClient(): BlobClient

	/*
    	Get a client for working with role
	*/
	roleClient(): RoleClient

	/**
	 * get client to work with type
	 */
	typeClient(): TypeClient

	/**
	 * get task client to wait manage task
	 */
	taskClient(): TaskClient

	/**
	 * get client to work with permission
	 */
	permissionClient(): PermissionClient

	/**
	 * get client to work with permission
	 */
	importExportClient(): ImportExportClient

	/**
	 *  file file type client
	 */
	fileTypeClient(): FileTypeClient

	/**
	 * get client to work with tenants (organization hierarchy, ancestors, ...)
	 */
	tenantClient(): TenantClient

	/*
        Insert the current Ozone session ID in the given URL ("/dsid=...).
        This call
        Throws an error if there is no session available.
        The given string may or may not contain the host part.
        Example input strings :
        "/rest/v3/blob"
        "https://taktik.io/rest/v2/media/view/org.taktik.filetype.original/123"
    */
	insertSessionIdInURL(url: string): string

	/**
	 * Add a custom filter
	 * @param filter to add
	 */
	addCustomFilter(filter: Filter<any, any>, name: string): void

	/**
	 * Provide external logger to client
	 * @param logger The logger to use
	 */
	setLogger(logger: Logger): void
}
