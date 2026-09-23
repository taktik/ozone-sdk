import { DeviceMessage } from './DeviceMessage'

import { OzoneType } from './Item'
import { Call } from './Call'

@OzoneType('device.message.incomingcall')
export class DeviceMessageIncomingCall extends DeviceMessage {
	call: Call

	constructor(src: DeviceMessageIncomingCall) {
		super(src)
		this.call = src.call
	}
}
