import { DeviceMessage } from './DeviceMessage'
import { OzoneType } from './Item'

@OzoneType('device.message.displaydeviceinfo')
export class DeviceMessageDisplayDeviceInfo extends DeviceMessage {
	activate: boolean

	constructor(params: DeviceMessageDisplayDeviceInfo) {
		super(params)
		this.activate = params.activate
	}
}
