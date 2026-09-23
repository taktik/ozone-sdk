import { Role, UUID, Grants } from '@taktik/ozone-type'
import { Request } from 'typescript-http-client'
import { RoleClient } from './roleClient'
import { OzoneClient } from '../ozoneClient/ozoneClient'
import { returnNullOn404 } from '../utility/utility'

export class RoleClientImpl implements RoleClient {
	constructor(private client: OzoneClient, private baseUrl: string) {}

	getAll(): Promise<Role[]> {
		const request = new Request(`${this.baseUrl}/rest/v3/role`)
			.setMethod('GET')
		return this.client.call<Role[]>(request)
	}

	save(role: Role): Promise<Role> {
		const request = new Request(`${this.baseUrl}/rest/v3/role`)
			.setMethod('POST')
			.setBody(role)
		return this.client.call<Role>(request)
	}

	getPermissions(roleIds: UUID[]): Promise<Grants[]> {
		const request = new Request(`${this.baseUrl}/rest/v3/role/permissions`)
			.setMethod('POST')
			.setBody(roleIds)
		return this.client.call<Grants[]>(request)
	}

	getByName(roleName: string): Promise<Role | null> {
		const request = new Request(`${this.baseUrl}/rest/v3/role/name/${roleName}`)
			.setMethod('GET')
		return this.client.call<Role | null>(request).catch(returnNullOn404)
	}

	getById(roleId: UUID): Promise<Role | null> {
		const request = new Request(`${this.baseUrl}/rest/v3/role/${roleId}`)
			.setMethod('GET')
		return this.client.call<Role | null>(request).catch(returnNullOn404)
	}

	deleteById(id: UUID): Promise<UUID | null> {
		const request = new Request(`${this.baseUrl}/rest/v3/role/${id}`)
			.setMethod('DELETE')
		return this.client.call<UUID>(request).catch(returnNullOn404)
	}
}
