import { DeviceMessageReply } from './DeviceMessageReply'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('device.message.capturedomreply')
export class DeviceMessageCapturedomreply extends DeviceMessageReply {
	domId?: string
	doms?: string[]
	url: string

	constructor(src: DeviceMessageCapturedomreply) {
		super(src)
		this.domId = src.domId
		this.doms = src.doms
		this.url = src.url
	}
}
