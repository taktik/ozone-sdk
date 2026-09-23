import { Blob, UUID } from '@taktik/ozone-type'
export type UploadParams = {
	onprogress?: {
		(event: Event): void;
	};
	onloadstart?: {
		(event: Event): void;
	};
	timeout?: number
}
export interface BlobClient {
	create(data: any, uploadParams?: UploadParams): Promise<Blob>

	getById(id: UUID): Promise<Blob>

	getDownloadableUrl(id: UUID, fileName: string): Promise<string>
}
