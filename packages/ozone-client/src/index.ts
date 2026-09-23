import * as clientState from './ozoneClient/clientState'
import * as ozoneCredentialsImpl from './ozoneCredentials/ozoneCredentialsImpl'
import * as itemClient from './itemClient/itemClient'
import * as blobClient from './blobClient/blobClient'
import * as roleClient from './roleClient/roleClient'
import * as ozoneClient from './ozoneClient/ozoneClient'
import * as permissionClient from './permissionClient/permissionClient'
import * as typeClient from './typeClient/typeClient'
import * as typeCache from './typeClient/typeCache'
import * as taskClient from './taskClient/taskClient'
import * as importExportClient from './importExportClient/importExportClient'
import * as fileTypeClient from './filetypeClient/filetypeClient'
import * as tenantClient from './tenantClient/tenantClient'
import { OzoneClientImpl } from './ozoneClient/ozoneClientImpl'
import { Item } from '@taktik/ozone-type'

/*
	Re-exports are split by what they actually are. Interfaces go through
	`export type`; classes and enums need both a `const` and a `type`, because
	callers use them as values (`new UserCredentials(...)`) and as types
	(`credentials: UserCredentials`) and declaration merging gives them both
	under one name.

	This used to be `export import X = mod.X` throughout. It type-checks, but it
	is a TypeScript-only construct that erases to nothing for half of these
	symbols, and bundlers that do not run the type checker -- esbuild, and so
	tsup -- read it as a value import of something that does not exist.
*/
export namespace OzoneClient {

	export const ClientState = clientState.ClientState
	export type ClientState = clientState.ClientState

	export const states = clientState.states

	export type OzoneClient = ozoneClient.OzoneClient

	export type SearchResults<T extends Item> = itemClient.SearchResults<T>

	export type ItemClient<T extends Item> = itemClient.ItemClient<T>

	export type BlobClient = blobClient.BlobClient

	export type SearchIterator<T extends Item> = itemClient.SearchIterator<T>

	export type PermissionClient = permissionClient.PermissionClient

	export type RoleClient = roleClient.RoleClient

	export type TypeClient = typeClient.TypeClient

	export type TypeCache = typeCache.TypeCache

	export type TaskClient = taskClient.TaskClient

	export type TaskHandler<T = any> = taskClient.TaskHandler<T>

	export type TaskHandlerOption = taskClient.TaskHandlerOption

	export type ImportExportClient = importExportClient.ImportExportClient

	export type FileTypeClient = fileTypeClient.FileTypeClient

	export type FileTypeCache = fileTypeClient.FileTypeCache

	export type TenantClient = tenantClient.TenantClient

	/*
		Factory method
	*/
	export function newOzoneClient(config: ClientConfiguration): OzoneClient {
		return new OzoneClientImpl(config)
	}

	export type AuthInfo = ozoneClient.AuthInfo

	export type OzoneCredentials = ozoneClient.OzoneCredentials

	export const SessionCredentials = ozoneCredentialsImpl.SessionCredentials
	export type SessionCredentials = ozoneCredentialsImpl.SessionCredentials

	export const UserCredentials = ozoneCredentialsImpl.UserCredentials
	export type UserCredentials = ozoneCredentialsImpl.UserCredentials

	export const TokenCredentials = ozoneCredentialsImpl.TokenCredentials
	export type TokenCredentials = ozoneCredentialsImpl.TokenCredentials

	export const ItemCredentials = ozoneCredentialsImpl.ItemCredentials
	export type ItemCredentials = ozoneCredentialsImpl.ItemCredentials

	export const ItemByQueryCredentials = ozoneCredentialsImpl.ItemByQueryCredentials
	export type ItemByQueryCredentials = ozoneCredentialsImpl.ItemByQueryCredentials

	export type ClientConfiguration = ozoneClient.ClientConfiguration

	export const OzoneLoginCredentials = ozoneCredentialsImpl.OzoneLoginCredentials
	export type OzoneLoginCredentials = ozoneCredentialsImpl.OzoneLoginCredentials

	export const DEFAULT_FILTERS = ozoneClient.DEFAULT_FILTERS
	export type DEFAULT_FILTERS = ozoneClient.DEFAULT_FILTERS
}
