import { UUID, FieldsPermissionUtility } from '@taktik/ozone-type'

export interface PermissionClient {

	/**
	 * request given fields permission for several items
	 * @param fieldsIdentifiers array of fields identifiers
	 * @param itemIds array of item id
	 */
	bulkGetPermissions(fieldsIdentifiers: string[], itemIds: UUID[]): Promise<Map<string, FieldsPermissionUtility>>
	/**
	 * request given fields permission for one item
	 * @param fieldsIdentifiers
	 * @param itemId
	 */
	getPermissions(fieldsIdentifiers: string[], itemId: UUID): Promise<FieldsPermissionUtility | undefined>
}
