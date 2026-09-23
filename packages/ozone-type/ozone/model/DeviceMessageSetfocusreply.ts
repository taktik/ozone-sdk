import { DeviceMessageReply } from './DeviceMessageReply'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('device.message.setfocusreply')
export class DeviceMessageSetfocusreply extends DeviceMessageReply {
	focusId?: string
	result: boolean

	constructor(src: DeviceMessageSetfocusreply) {
		super(src)
		this.focusId = src.focusId
		this.result = src.result
	}
}
