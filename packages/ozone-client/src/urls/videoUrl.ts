/**
 * Created by hubert on 13/03/20.
 */
import * as OzoneType from '@taktik/ozone-type'
import { OzoneFormat } from './formats'
import { OzoneClient } from '../ozoneClient/ozoneClient'
import { OzoneMediaUrl } from './mediaUrl'

/**
 * JavaScript class to convert media ID to URL
 */
export class OzoneVideoUrl extends OzoneMediaUrl {

	video: OzoneType.FromOzone<OzoneType.Video>
	private _client: OzoneClient

	constructor(video: OzoneType.FromOzone<OzoneType.Video>, client: OzoneClient) {
		super(video.id, client.config.ozoneURL)
		this.video = video
		this._client = client
	}

	private async _getVideoFileType(): Promise<Array<OzoneType.FileType>> {
		const fileTypeCache = await this._client.fileTypeClient().getFileTypeCache()
		const videoFormat = OzoneFormat.priority.video.map(key => OzoneFormat.type[key])
		return fileTypeCache.fileTypes.filter(ft => videoFormat.includes(ft.identifier))
	}

	private _preferredVideoFormat?: string

	async getPreferredVideoFormat(): Promise<string | undefined> {
		if (this._preferredVideoFormat) {
			return this._preferredVideoFormat
		}

		const video = this.video
		const availableResourceIds = []
		if (video.file) availableResourceIds.push(video.file)
		if (video.derivedFiles) availableResourceIds.push(...video.derivedFiles)

		const fileApi = this._client.itemClient<OzoneType.File>('file')
		const availableRessources = await fileApi.findAllByIds(availableResourceIds)

		const videoFileTypes = await this._getVideoFileType()

		for (let format of OzoneFormat.priority.video) {
			const ressourceToUse = availableRessources.find((ressource) => {

				const fileType = videoFileTypes.find((videoFileType) => {
					if (videoFileType && videoFileType.id) {
						return videoFileType.id === ressource.fileType
					}
					return false
				})
				const filetypeIdentifier: string = OzoneFormat.type[format]
				if (!fileType) return false
				return fileType.identifier === filetypeIdentifier
			})
			if (ressourceToUse) {
				const fileTypeToUse = videoFileTypes.find((videoFileType) => {
					return videoFileType.id === ressourceToUse.fileType
				})
				if (fileTypeToUse && fileTypeToUse.identifier) {
					this._preferredVideoFormat = fileTypeToUse.identifier
					return this._preferredVideoFormat
				}
			}
		}
	}
	/**
	 * get url where to load the HLS video.
	 * @return {Promise<string>}
	 */
	async getPreferredVideoUrl(): Promise<string> {
		const formatName = await this.getPreferredVideoFormat()
		if (formatName) {
			return this.getVideoUrl(formatName as any)
		} else {
			throw new Error('Video Format is undefined')
		}
	}

}
