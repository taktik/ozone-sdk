import { DeviceMessage } from './DeviceMessage'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('device.message.keypress')
export class DeviceMessageKeypress extends DeviceMessage {
	eventName: string
	key?: string

	constructor(src: DeviceMessageKeypress) {
		super(src)
		this.eventName = src.eventName
		this.key = src.key
	}
}
