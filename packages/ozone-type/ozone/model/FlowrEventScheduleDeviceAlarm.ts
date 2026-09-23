import { FlowrEventScheduleCron } from './FlowrEventScheduleCron'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('flowr.event.schedule.device.alarm')
export class FlowrEventScheduleDeviceAlarm extends FlowrEventScheduleCron {
	deviceId: UUID

	constructor(src: FlowrEventScheduleDeviceAlarm) {
		super(src)
		this.deviceId = src.deviceId
	}
}
