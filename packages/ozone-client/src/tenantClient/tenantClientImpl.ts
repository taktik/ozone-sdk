import { Tenant, TenantNode, UUID } from '@taktik/ozone-type'
import { Request } from 'typescript-http-client'
import { TenantClient } from './tenantClient'
import { OzoneClient } from '../ozoneClient/ozoneClient'
import { returnNullOn404 } from '../utility/utility'

export class TenantClientImpl implements TenantClient {
	constructor(private client: OzoneClient, private baseUrl: string) {}

	save(tenant: Tenant): Promise<Tenant> {
		const request = new Request(`${this.baseUrl}/rest/v3/tenant`)
			.setMethod('POST')
			.setBody(tenant)
		return this.client.call<Tenant>(request)
	}

	findOne(id: UUID): Promise<Tenant | null> {
		const request = new Request(`${this.baseUrl}/rest/v3/tenant/${id}`)
			.setMethod('GET')
		return this.client.call<Tenant | null>(request).catch(returnNullOn404)
	}

	findByIdentifier(identifier: string): Promise<Tenant | null> {
		const request = new Request(`${this.baseUrl}/rest/v3/tenant/identifier/${identifier}`)
			.setMethod('GET')
		return this.client.call<Tenant | null>(request).catch(returnNullOn404)
	}

	findAll(ids?: UUID[]): Promise<Tenant[]> {
		if (ids) {
			if (ids.length === 0) {
				return Promise.resolve([])
			}
			const request = new Request(`${this.baseUrl}/rest/v3/tenant/bulkGet`)
				.setMethod('POST')
				.setBody(ids)
			return this.client.call<Tenant[]>(request)
		}
		const request = new Request(`${this.baseUrl}/rest/v3/tenant`)
			.setMethod('GET')
		return this.client.call<Tenant[]>(request)
	}

	hierarchy(rootId: UUID): Promise<TenantNode | null> {
		const request = new Request(`${this.baseUrl}/rest/v3/tenant/hierarchy/${rootId}`)
			.setMethod('GET')
		return this.client.call<TenantNode | null>(request).catch(returnNullOn404)
	}

	ancestors(id: UUID, upTo?: UUID): Promise<UUID[]> {
		const path = upTo
			? `/rest/v3/tenant/ancestors/${id}/${upTo}`
			: `/rest/v3/tenant/ancestors/${id}`
		const request = new Request(`${this.baseUrl}${path}`)
			.setMethod('GET')
		return this.client.call<UUID[]>(request)
	}

	delete(id: UUID): Promise<UUID | null> {
		const request = new Request(`${this.baseUrl}/rest/v3/tenant/${id}`)
			.setMethod('DELETE')
		return this.client.call<UUID>(request).catch(returnNullOn404)
	}
}
