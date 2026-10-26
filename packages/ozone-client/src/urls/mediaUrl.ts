/**
 * Created by hubert on 21/06/17.
 */
import { UUID } from '@taktik/ozone-type'
import { FlowrImageEnum, FlowrVideoEnum, OzoneFormat } from './formats'

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
	constructor(
		id: UUID,
		private ozoneHost: string,
	) {
		this.id = id
	}

	private _buildViewUrl(action: Array<string>): string {
		return `${this.ozoneHost}/view/${action.join('/')}`
	}

	/**
	 * get url to jpg preview
	 * @param {SizeEnum} size
	 * @return {string}
	 */
	getPreviewUrlJpg(size: SizeEnum): string {
		const preview = FlowrImageEnum.jpg.replace('{SIZE}', size.toString())
		return this._buildViewUrl([this.id, preview])
	}

	/**
	 * return url to original content
	 * @return {string}
	 */
	getOriginalFormat(): string {
		return this.getVideoUrl(FlowrVideoEnum.original)
	}

	/**
	 * build the form posting a download of the original files of the medias. The ids go in the body: a url
	 * listing a large selection would exceed what a server or proxy accepts.
	 * @return {HTMLFormElement}
	 */
	static createMediaDownloadForm(ids: Array<UUID>, ozoneHost: string): HTMLFormElement {
		const form = document.createElement('form')
		form.method = 'POST'
		form.action = `${ozoneHost.replace(/\/$/, '')}/media`
		form.style.display = 'none'
		const parameters: { [name: string]: string } = {
			medias: ids.join(','),
			types: OzoneFormat.type.original,
		}
		for (const name of Object.keys(parameters)) {
			const input = document.createElement('input')
			input.type = 'hidden'
			input.name = name
			input.value = parameters[name]
			form.appendChild(input)
		}
		return form
	}

	/**
	 * download the original files of the medias. The form posts into a hidden frame: the attachment downloads from
	 * there, and an error page would land there rather than replace the page.
	 */
	static downloadMedias(ids: Array<UUID>, ozoneHost: string): void {
		if (ids.length === 0) {
			return
		}
		const frameName = 'ozone-media-download'
		if (!document.querySelector(`iframe[name="${frameName}"]`)) {
			const frame = document.createElement('iframe')
			frame.name = frameName
			frame.style.display = 'none'
			document.body.appendChild(frame)
		}
		const form = OzoneMediaUrl.createMediaDownloadForm(ids, ozoneHost)
		form.target = frameName
		document.body.appendChild(form)
		form.submit()
		document.body.removeChild(form)
	}

	/**
	 * return url to png preview
	 * @param {SizeEnum} size
	 * @return {string}
	 */
	getPreviewUrlPng(size: SizeEnum): string {
		const preview = FlowrImageEnum.png.replace('{SIZE}', size.toString())
		return this._buildViewUrl([this.id, preview])
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
		return this._buildViewUrl([this.id, format, 'index.m3u8'])
	}

	/**
	 * retun unt to the mp4 file
	 * @return {string}
	 */
	getVideoUrlMp4(): string {
		const format = FlowrVideoEnum.mp4
		return this._buildViewUrl([this.id, format])
	}
}
