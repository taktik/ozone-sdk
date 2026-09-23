import { DeviceMessage } from './DeviceMessage'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('device.message.notice')
export class DeviceMessageNotice extends DeviceMessage {
	duration?: number
	message: string

	constructor(src: DeviceMessageNotice) {
		super(src)
		this.duration = src.duration
		this.message = src.message
	}
}
