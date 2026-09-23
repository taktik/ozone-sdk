import { DeviceMessage } from './DeviceMessage'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('device.message.alert')
export class DeviceMessageAlert extends DeviceMessage {
	message: string

	constructor(src: DeviceMessageAlert) {
		super(src)
		this.message = src.message
	}
}
