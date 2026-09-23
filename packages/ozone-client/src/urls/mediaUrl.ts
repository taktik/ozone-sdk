/**
 * Created by hubert on 21/06/17.
 */
import { UUID } from '@taktik/ozone-type'
import { FlowrImageEnum, FlowrVideoEnum } from './formats'
import { OzoneClient } from '../ozoneClient/ozoneClient'
import { Request } from 'typescript-http-client'

export type SizeEnum = number

export class OzonePreviewSize {
	static Small: SizeEnum = 250
	static Medium: SizeEnum = 500
	static Large: SizeEnum = 1500
}

/**
 * class to convert media ID to URL
 */
export class OzoneMediaUrl {

	id: UUID
	constructor(id: UUID, private ozoneHost: string) {
		this.id = id
	}

	/**
	 * Convert uuid to ozone v2 numeric id
	 * @return {number}
	 */
	static convertToNumericID(id: UUID): number {
		return parseInt(id.split('-')[4], 16)
	}

	getNumericId(): number {
		return OzoneMediaUrl.convertToNumericID(this.id)
	}

	private static _buildBaseUrl(ozoneHost: string, ...action: Array<string | number>): string {
		return `${ozoneHost}${action.join('/')}`
	}
	private _buildViewUrl(action: Array<string | number>): string {
		return `${this.ozoneHost}/view/${action.join('/')}`
	}

	/**
	 * get url to jpg preview
	 * @param {SizeEnum} size
	 * @return {string}
	 */
	getPreviewUrlJpg(size: SizeEnum): string {
		const preview = FlowrImageEnum.jpg.replace('{SIZE}', size.toString())
		return this
			._buildViewUrl([this.getNumericId(), preview])

	}

	/**
	 * return url to original content
	 * @return {string}
	 */
	getOriginalFormat(): string {
		return this.getVideoUrl(FlowrVideoEnum.original)
	}

	/**
	 * return url where to upload the media.
	 * @return {Promise<string>}
	 */
	static async getMediaUploadUrl(
		ids: Array<UUID>, client: OzoneClient
	): Promise<string> {
		const ozoneHost = client.config.ozoneURL
		const numericIds: Array<number> = ids.map(OzoneMediaUrl.convertToNumericID)
		const url = OzoneMediaUrl._buildBaseUrl(ozoneHost, '/rest/v2/media/download/request')
		const body = {
			fileAssignedToBatch: false,
			fileTypeIdentifiers: ['org.taktik.filetype.original'],
			mediaSet: {
				includedMediaIds: numericIds,
				includedMediaQueries: [],
				simpleSelection: true,
				singletonSelection: true
			},
			metadata: false
		}

		const request = new Request(url, { method: 'POST', body })
		const response = await client.call<{downloadUrl: string}>(request)

		return OzoneMediaUrl._buildBaseUrl(ozoneHost, '', response.downloadUrl)
	}
	/**
	 * return url to png preview
	 * @param {SizeEnum} size
	 * @return {string}
	 */
	getPreviewUrlPng(size: SizeEnum): string {
		const preview = FlowrImageEnum.png.replace('{SIZE}', size.toString())
		return this
			._buildViewUrl([this.getNumericId(), preview])

	}

	/**
	 * return url to image preview
	 * @param {SizeEnum} size
	 * @return {string}
	 */
	async getPreviewUrl(size: SizeEnum): Promise<string> {
		// TODO default is png
		return this.getPreviewUrlJpg(size)
	}

	/**
	 * get url where to load the HLS video.
	 * @return {Promise<string>}
	 */
	getVideoUrl(formatName?: FlowrVideoEnum): string {
		const format = formatName || FlowrVideoEnum.flowr
		return this
			._buildViewUrl([this.getNumericId(),
				format,
				'index.m3u8'])
	}

	/**
	 * retun unt to the mp4 file
	 * @return {string}
	 */
	getVideoUrlMp4(): string {
		const format = FlowrVideoEnum.mp4
		return this
			._buildViewUrl([this.getNumericId(),
				format])
	}
}
