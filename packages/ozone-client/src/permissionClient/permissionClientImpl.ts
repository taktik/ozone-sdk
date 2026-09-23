import { Grants, UUID,
	FieldsPermissionUtility } from '@taktik/ozone-type'
import { Request } from 'typescript-http-client'
import { OzoneClient } from '../ozoneClient/ozoneClient'
import { PermissionClient } from './permissionClient'

export class PermissionClientImpl implements PermissionClient {

	constructor(private client: OzoneClient, private baseUrl: string) {}

	async bulkGetPermissions(fieldsIdentifiers: string[], itemIds: UUID[]): Promise<Map<string, FieldsPermissionUtility>> {
		const fieldsId = fieldsIdentifiers
		const parameters = new URLSearchParams()
		parameters.append('fields', fieldsId.join(','))

		const request = new Request(`${this.baseUrl}/rest/v3/items/bulkGetPermissions?${parameters.toString()}`)
			.setMethod('POST')
			.setBody(itemIds)

		const grants = await this.client.call<Grants[]>(request)

		const result = new Map<string, FieldsPermissionUtility>()
		grants.forEach((grant) => {
			result.set(grant.id!, new FieldsPermissionUtility(grant))
		})
		return result
	}

	async getPermissions(fieldsIdentifiers: string[], itemId: UUID): Promise<FieldsPermissionUtility | undefined> {
		const permissions = await this.bulkGetPermissions(fieldsIdentifiers, [itemId])
		return permissions.get(itemId)
	}
}
