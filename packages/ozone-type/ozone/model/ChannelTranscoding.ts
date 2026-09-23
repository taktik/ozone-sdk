import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('channel.transcoding')
export class ChannelTranscoding extends Item {
	audioFormat?: string
	bitrate?: number
	bitrateVariation?: number
	copySubtitles?: boolean
	deinterlace?: boolean
	height?: number
	rotation?: string
	videoFormat?: string
	width?: number

	constructor(src: ChannelTranscoding) {
		super(src)
		this.audioFormat = src.audioFormat
		this.bitrate = src.bitrate
		this.bitrateVariation = src.bitrateVariation
		this.copySubtitles = src.copySubtitles
		this.deinterlace = src.deinterlace
		this.height = src.height
		this.rotation = src.rotation
		this.videoFormat = src.videoFormat
		this.width = src.width
	}
}
