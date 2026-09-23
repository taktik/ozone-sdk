import { ChannelInput } from './ChannelInput'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('channel.input.screencast')
export class ChannelInputScreencast extends ChannelInput {
	timeZone?: string
	url: string

	constructor(src: ChannelInputScreencast) {
		super(src)
		this.timeZone = src.timeZone
		this.url = src.url
	}
}
