import { Blob, UUID } from '@taktik/ozone-type'
import { BlobClient, UploadParams } from './blobClient'
import { OzoneClient } from '../ozoneClient/ozoneClient'
import { Request } from 'typescript-http-client'

export class BlobClientImpl implements BlobClient {
	constructor(private client: OzoneClient, private baseUrl: string) {}

	async create(data: any, uploadParams?: UploadParams): Promise<Blob> {
		const request = new Request(`${this.baseUrl}/rest/v3/blob`)
			.setMethod('PUT')
			.setBody(data)
		if (uploadParams?.timeout) {
			request.timeout = uploadParams.timeout
		}
		if (uploadParams?.onprogress) {
			request.upload.onprogress = uploadParams.onprogress
		}
		if (uploadParams?.onloadstart) {
			request.upload.onloadstart = uploadParams.onloadstart
		}
		request.contentType = 'application/octet-stream'
		return this.client.call<Blob>(request)
	}
	async getById(uuid: string): Promise<Blob> {
		const request = new Request(`${this.baseUrl}/rest/v3/blob/${uuid}`)
			.setMethod('GET')
		return this.client.call<Blob>(request)
	}

	async getDownloadableUrl(id: UUID, fileName: string): Promise<string> {
		return `${this.baseUrl}/rest/v3/blob/${id}/${encodeURIComponent(fileName)}`
	}
}
