import { DeviceMessageFromdevice } from './DeviceMessageFromdevice'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('device.message.capturedom')
export class DeviceMessageCapturedom extends DeviceMessageFromdevice {
	domId?: string
	selector?: string

	constructor(src: DeviceMessageCapturedom) {
		super(src)
		this.domId = src.domId
		this.selector = src.selector
	}
}
