import { DeviceMessage } from './DeviceMessage'
import { OzoneType, UUID } from './Item'

export enum WARNING_STATES {
	OFF = 'OFF',
	ON = 'ON',
	TEST = 'TEST'
}

@OzoneType('device.message.warning')
export class DeviceMessageWarning extends DeviceMessage {
	state: WARNING_STATES
	locationZone: UUID
	wakeUpDevice?: boolean

	constructor(src: DeviceMessageWarning) {
		super(src)
		this.state = src.state
		this.locationZone = src.locationZone
		this.wakeUpDevice = src.wakeUpDevice
	}
}
