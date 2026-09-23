import { DeviceMessageFromdevice } from './DeviceMessageFromdevice'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('device.message.takescreenshot')
export class DeviceMessageTakescreenshot extends DeviceMessageFromdevice {
	delay?: number[]
	screenshotId?: string

	constructor(src: DeviceMessageTakescreenshot) {
		super(src)
		this.delay = src.delay
		this.screenshotId = src.screenshotId
	}
}
