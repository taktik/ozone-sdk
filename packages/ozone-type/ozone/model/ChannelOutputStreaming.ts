import { ChannelOutput } from './ChannelOutput'
import { ChannelTranscoding } from './ChannelTranscoding'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('channel.output.streaming')
export class ChannelOutputStreaming extends ChannelOutput {
	bitrate?: number
	bufferSize?: number
	transcoding?: ChannelTranscoding
	url: string

	constructor(src: ChannelOutputStreaming) {
		super(src)
		this.bitrate = src.bitrate
		this.bufferSize = src.bufferSize
		this.transcoding = src.transcoding
		this.url = src.url
	}
}
