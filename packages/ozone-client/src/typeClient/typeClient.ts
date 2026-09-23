import { TypeDescriptor, UUID } from '@taktik/ozone-type'
import { TypeCache } from './typeCache'

export interface TypeClient {

	/**
	 * Update or create a new type
	 * @param type
	 */
	save(type: TypeDescriptor): Promise<TypeDescriptor>

	/**
	 * get a type
	 * @param identifier
	 */
	findByIdentifier(identifier: string): Promise<TypeDescriptor | null>

	/**
	 * get all types
	 */
	findAll(): Promise<TypeDescriptor[]>

	/**
	 * delete a type
	 * @param identifier
	 */
	delete(identifier: string): Promise<UUID | null>

	/**
	 *
	 */
	getTypeCache(): Promise<TypeCache>
}
