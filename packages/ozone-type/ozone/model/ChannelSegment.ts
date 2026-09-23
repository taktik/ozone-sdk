import { File } from './File'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('channel.segment')
export class ChannelSegment extends File {
	channelId: UUID
	md5: string
	outputId: number
	start: Instant
	stop: Instant

	constructor(src: ChannelSegment) {
		super(src)
		this.channelId = src.channelId
		this.md5 = src.md5
		this.outputId = src.outputId
		this.start = src.start
		this.stop = src.stop
	}
}
