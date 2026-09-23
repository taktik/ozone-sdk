import { DeviceMessage } from './DeviceMessage'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('device.message.email')
export class DeviceMessageEmail extends DeviceMessage {
	from?: string
	message: string
	subject?: string

	constructor(src: DeviceMessageEmail) {
		super(src)
		this.from = src.from
		this.message = src.message
		this.subject = src.subject
	}
}
