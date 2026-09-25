/*
	Type-checks the BUILT package the way a consumer sees it: through the package
	name, so the exports map and typesVersions are exercised too, and with
	skipLibCheck off.

	`yarn typecheck` reads src/, where a declaration bug introduced by the build
	cannot appear. One did: the namespace aliases collapsed into
	`type ItemClient<T> = ItemClient<T>` and shipped to the registry that way. It
	stayed invisible until a consumer annotated one with a type argument, which is
	what the generic aliases below do. Adding a public export to the namespace
	means adding it here.
*/
import { OzoneClient } from '@taktik/ozone-client'
import { SearchQuery } from '@taktik/ozone-client/search'
import { OzoneMediaUrl } from '@taktik/ozone-client/urls'
import { getDefaultClient } from '@taktik/ozone-client/default'
import { OzoneApiUploadV3 } from '@taktik/ozone-client/upload'
import { Item } from '@taktik/ozone-type'

export type ItemClientOf<T extends Item> = OzoneClient.ItemClient<T>
export type SearchResultsOf<T extends Item> = OzoneClient.SearchResults<T>
export type SearchIteratorOf<T extends Item> = OzoneClient.SearchIterator<T>
export type TaskHandlerOf<T> = OzoneClient.TaskHandler<T>

export type Client = OzoneClient.OzoneClient
export type Config = OzoneClient.ClientConfiguration
export type Auth = OzoneClient.AuthInfo
export type Blobs = OzoneClient.BlobClient
export type Roles = OzoneClient.RoleClient
export type Permissions = OzoneClient.PermissionClient
export type Types = OzoneClient.TypeClient
export type TypeCacheOf = OzoneClient.TypeCache
export type Tasks = OzoneClient.TaskClient
export type TaskOptions = OzoneClient.TaskHandlerOption
export type ImportExport = OzoneClient.ImportExportClient
export type FileTypes = OzoneClient.FileTypeClient
export type FileTypeCacheOf = OzoneClient.FileTypeCache
export type Tenants = OzoneClient.TenantClient

export const credentials: OzoneClient.OzoneCredentials = new OzoneClient.UserCredentials(
	'user',
	'password',
)
export const state: OzoneClient.ClientState = OzoneClient.states.STOPPED
export const filter: OzoneClient.DEFAULT_FILTERS = OzoneClient.DEFAULT_FILTERS.PRE_FILTERS

export const client: Client = OzoneClient.newOzoneClient({
	ozoneURL: 'https://ozone.invalid/ozone',
	ozoneCredentials: credentials,
})

export const subpathEntryPoints = { SearchQuery, OzoneMediaUrl, getDefaultClient, OzoneApiUploadV3 }
