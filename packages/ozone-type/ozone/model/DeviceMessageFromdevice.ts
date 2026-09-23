import { DeviceMessage } from './DeviceMessage'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('device.message.fromdevice')
export class DeviceMessageFromdevice extends DeviceMessage {
	sender: UUID

	constructor(src: DeviceMessageFromdevice) {
		super(src)
		this.sender = src.sender
	}
}
