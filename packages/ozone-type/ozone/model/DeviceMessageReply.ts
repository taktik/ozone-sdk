import { DeviceMessageFromdevice } from './DeviceMessageFromdevice'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('device.message.reply')
export class DeviceMessageReply extends DeviceMessageFromdevice {
	originalMessage: UUID

	constructor(src: DeviceMessageReply) {
		super(src)
		this.originalMessage = src.originalMessage
	}
}
