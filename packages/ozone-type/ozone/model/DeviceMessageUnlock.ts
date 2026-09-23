import { DeviceMessage } from './DeviceMessage'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('device.message.unlock')
export class DeviceMessageUnlock extends DeviceMessage {
	code: string

	constructor(src: DeviceMessageUnlock) {
		super(src)
		this.code = src.code
	}
}
