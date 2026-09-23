import { DeviceMessage } from './DeviceMessage'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('device.message.lock')
export class DeviceMessageLock extends DeviceMessage {
	code: string

	constructor(src: DeviceMessageLock) {
		super(src)
		this.code = src.code
	}
}
