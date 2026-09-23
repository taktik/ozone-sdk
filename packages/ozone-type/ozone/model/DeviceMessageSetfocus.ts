import { DeviceMessageFromdevice } from './DeviceMessageFromdevice'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('device.message.setfocus')
export class DeviceMessageSetfocus extends DeviceMessageFromdevice {
	focusId?: string
	layerId: UUID

	constructor(src: DeviceMessageSetfocus) {
		super(src)
		this.focusId = src.focusId
		this.layerId = src.layerId
	}
}
