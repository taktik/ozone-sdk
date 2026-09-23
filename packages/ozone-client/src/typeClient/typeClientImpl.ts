import { Request } from 'typescript-http-client'
import { once } from 'helpful-decorators'
import { TypeDescriptor, FieldDescriptor, UUID } from '@taktik/ozone-type'
import { TypeClient } from './typeClient'
import { OzoneClient } from '../ozoneClient/ozoneClient'
import { TypeCacheImpl } from './typeCacheImpl'
import { returnNullOn404 } from '../utility/utility'
import { TypeCache } from './typeCache'
export type TypeDescriptorCollection = Map<string, Promise<TypeDescriptor>>

export class TypeClientImpl implements TypeClient {

	constructor(private client: OzoneClient, private baseUrl: string) {
	}

	save(type: TypeDescriptor): Promise<TypeDescriptor> {
		const request = new Request(`${this.baseUrl}/rest/v3/type`)
			.setMethod('POST')
			.setBody(type)
		return this.client.call<TypeDescriptor>(request)
	}

	findByIdentifier(identifier: string): Promise<TypeDescriptor | null> {
		const request = new Request(`${this.baseUrl}/rest/v3/type/${identifier}`)
				.setMethod('GET')
		return this.client.call<TypeDescriptor>(request).catch(returnNullOn404)
	}

	async findAll(): Promise<TypeDescriptor[]> {
		const request = new Request(`${this.baseUrl}/rest/v3/type`)
			.setMethod('GET')
		return this.client.call<TypeDescriptor[]>(request)

	}

	async delete(identifier: string): Promise<UUID | null> {
		const request = new Request(`${this.baseUrl}/rest/v3/type/${identifier}`)
			.setMethod('DELETE')
		return this.client.call<UUID>(request).catch(returnNullOn404)
	}

	async getFields(identifier: string): Promise<Array<FieldDescriptor>> {
		const typeDescriptor = await this.findByIdentifier(identifier)
		if (typeDescriptor) {
			return typeDescriptor.fields || []
		} else {
			return []
		}
	}

	@once
	async getTypeCache (): Promise<TypeCache> {
		const typeDescriptors = await this.findAll()
		return new TypeCacheImpl(this, typeDescriptors)
	}
}
