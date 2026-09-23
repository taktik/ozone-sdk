import { DeviceMessageReply } from './DeviceMessageReply'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('device.message.takescreenshotreply')
export class DeviceMessageTakescreenshotreply extends DeviceMessageReply {
	screenshotId?: string
	screenshots?: UUID[]
	url: string

	constructor(src: DeviceMessageTakescreenshotreply) {
		super(src)
		this.screenshotId = src.screenshotId
		this.screenshots = src.screenshots
		this.url = src.url
	}
}
