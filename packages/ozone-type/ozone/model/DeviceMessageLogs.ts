import { DeviceMessage } from './DeviceMessage'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('device.message.logs')
export class DeviceMessageLogs extends DeviceMessage {
	activate?: boolean

	constructor(src: DeviceMessageLogs) {
		super(src)
		this.activate = src.activate
	}
}
