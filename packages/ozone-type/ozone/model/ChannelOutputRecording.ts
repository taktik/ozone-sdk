import { ChannelOutput } from './ChannelOutput'
import { ChannelTranscoding } from './ChannelTranscoding'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('channel.output.recording')
export class ChannelOutputRecording extends ChannelOutput {
	autostart?: boolean
	bufferDuration?: number
	bufferStorage?: string
	segmentDuration?: number
	storage?: string
	transcodings?: ChannelTranscoding[]

	constructor(src: ChannelOutputRecording) {
		super(src)
		this.autostart = src.autostart
		this.bufferDuration = src.bufferDuration
		this.bufferStorage = src.bufferStorage
		this.segmentDuration = src.segmentDuration
		this.storage = src.storage
		this.transcodings = src.transcodings
	}
}
