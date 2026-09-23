import { Request } from 'typescript-http-client'
import { once } from 'helpful-decorators'
import { FileType, UUID } from '@taktik/ozone-type'
import { OzoneClient } from '../ozoneClient/ozoneClient'
import { returnNullOn404 } from '../utility/utility'
import { FileTypeCache, FileTypeClient } from './filetypeClient'

export class FiletypeCacheImpl implements FileTypeCache {
	constructor(private _filetypeClient: FileTypeClient, public fileTypes: FileType[]) {
	}
	findByIdentifier(identifier: string): FileType | undefined {
		return this.fileTypes.find(fileType => fileType.identifier === identifier)
	}

	findById(id: string): FileType | undefined {
		return this.fileTypes.find(fileType => fileType.id === id)
	}

	async refreshCache(): Promise<FileTypeCache> {
		this.fileTypes = await this._filetypeClient.findAll()
		return this
	}
}

export class FiletypeClientImpl implements FileTypeClient {

	constructor(private client: OzoneClient, private baseUrl: string) {
	}

	findById(id: string): Promise<FileType | null> {
		const request = new Request(`${this.baseUrl}/rest/v3/filetype/${id}`)
			.setMethod('GET')
		return this.client.call<FileType>(request).catch(returnNullOn404)
	}

	findByIdentifier(identifier: string): Promise<FileType | null> {
		const request = new Request(`${this.baseUrl}/rest/v3/filetype/identifier/${identifier}`)
			.setMethod('GET')
		return this.client.call<FileType>(request).catch(returnNullOn404)
	}

	save(type: FileType): Promise<FileType> {
		const request = new Request(`${this.baseUrl}/rest/v3/filetype`)
			.setMethod('POST')
			.setBody(type)
		return this.client.call<FileType>(request)
	}

	async findAll(): Promise<FileType[]> {
		const request = new Request(`${this.baseUrl}/rest/v3/filetype`)
			.setMethod('GET')
		return this.client.call<FileType[]>(request)

	}

	async delete(id: UUID): Promise<UUID | null> {
		const request = new Request(`${this.baseUrl}/rest/v3/filetype/${id}`)
			.setMethod('DELETE')
		return this.client.call<UUID>(request).catch(returnNullOn404)
	}

	@once
	async getFileTypeCache (): Promise<FileTypeCache> {
		const filesTypes = await this.findAll()
		return new FiletypeCacheImpl(this, filesTypes)
	}
}
