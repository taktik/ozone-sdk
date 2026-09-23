import { TypeDescriptor, FieldDescriptor, Item } from '@taktik/ozone-type'

export type TypeDescriptorCollection = Map<string, Promise<TypeDescriptor>>

export interface TypeCache {

	/**
	 * Get all fields for a type, including inherited fields from parents and traits.
	 * @param identifier - Type identifier
	 * @param withEmbeddedFields - If true, also includes fields from embedded types.
	 * Embedded field identifiers use the format "parentField/embeddedField" (e.g. "address/street").
	 */
	getAllFields(identifier: string, withEmbeddedFields?: boolean): FieldDescriptor[]

	/**
	 * verify if the is an instance of an other type
	 * @param identifier
	 * @param instance
	 */
	isTypeInstanceOf(identifier: string, instance: string): boolean

	/**
	 * return data if the is an instance the given type otherwise return undefined
	 * @param data
	 * @param instance
	 */
	asInstanceOf<T extends Item>(data: Item, instance: string): T | null

	/**
	 *
	 * @param identifier
	 */
	get(identifier: string): TypeDescriptor | undefined

	/**
	 *
	 * @param identifier
	 */
	has(identifier: string): boolean

	/**
	 * Force a refresh of the cache
	 */
	refresh(): Promise<TypeCache>

	getAllCachedTypeIdentifiers(): string[]
}
