import * as clientState from './ozoneClient/clientState'
import * as ozoneCredentialsImpl from './ozoneCredentials/ozoneCredentialsImpl'
import * as itemClient from './itemClient/itemClient'
import * as blobClient from './blobClient/blobClient'
import * as roleClient from './roleClient/roleClient'
import * as ozoneClient from './ozoneClient/ozoneClient'
import * as permissionClient from './permissionClient/permissionClient'
import * as typeClient from './typeClient/typeClient'
import * as taskClient from './taskClient/taskClient'
import * as importExportClient from './importExportClient/importExportClient'
import * as fileTypeClient from './filetypeClient/filetypeClient'
import * as tenantClient from './tenantClient/tenantClient'
import { OzoneClientImpl } from './ozoneClient/ozoneClientImpl'

export namespace OzoneClient {

	export import ClientState = clientState.ClientState

	export const states = clientState.states

	export import OzoneClient = ozoneClient.OzoneClient

	export import SearchResults = itemClient.SearchResults

	export import ItemClient = itemClient.ItemClient

	export import BlobClient = blobClient.BlobClient

	export import SearchIterator = itemClient.SearchIterator

	export import PermissionClient = permissionClient.PermissionClient

	export import RoleClient = roleClient.RoleClient

	export import TypeClient = typeClient.TypeClient

	export import TaskClient = taskClient.TaskClient

	export import TaskHandler = taskClient.TaskHandler

	export import TaskHandlerOption = taskClient.TaskHandlerOption

	export import ImportExportClient = importExportClient.ImportExportClient

	export import FileTypeClient = fileTypeClient.FileTypeClient

	export import FileTypeCache = fileTypeClient.FileTypeCache

	export import TenantClient = tenantClient.TenantClient

	/*
		Factory method
	*/
	export function newOzoneClient(config: ClientConfiguration): OzoneClient {
		return new OzoneClientImpl(config)
	}

	export import AuthInfo = ozoneClient.AuthInfo

	export import OzoneCredentials = ozoneClient.OzoneCredentials

	export import SessionCredentials = ozoneCredentialsImpl.SessionCredentials

	export import UserCredentials = ozoneCredentialsImpl.UserCredentials

	export import TokenCredentials = ozoneCredentialsImpl.TokenCredentials

	export import ItemCredentials = ozoneCredentialsImpl.ItemCredentials

	export import ItemByQueryCredentials = ozoneCredentialsImpl.ItemByQueryCredentials

	export import ClientConfiguration = ozoneClient.ClientConfiguration

	export import OzoneLoginCredentials = ozoneCredentialsImpl.OzoneLoginCredentials

	export import DEFAULT_FILTERS = ozoneClient.DEFAULT_FILTERS
}
