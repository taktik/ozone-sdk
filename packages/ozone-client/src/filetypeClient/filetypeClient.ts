import { FileType, UUID, FromOzone } from '@taktik/ozone-type'

export interface FileTypeClient {

	/**
	 * Update or create a new type
	 * @param type
	 */
	save(type: FileType): Promise<FileType>

	/**
	 * get a type
	 * @param identifier
	 */
	findByIdentifier(identifier: string): Promise<FileType | null>
	/**
	 * get a type
	 * @param id
	 */
	findById(id: UUID): Promise<FileType | null>

	/**
	 * get all types
	 */
	findAll(): Promise<FileType[]>

	/**
	 * delete a type
	 * @param id
	 */
	delete(id: UUID): Promise<UUID | null>

	/**
	 *
	 */
	getFileTypeCache(): Promise<FileTypeCache>
}

export interface FileTypeCache {

	fileTypes: FileType[]

	/**
	 * get a type
	 * @param identifier
	 */
	findByIdentifier(identifier: string): FileType | undefined

	/**
	 * get a type
	 * @param id
	 */
	findById(id: UUID): FileType | undefined

	refreshCache(): Promise<FileTypeCache>
}
