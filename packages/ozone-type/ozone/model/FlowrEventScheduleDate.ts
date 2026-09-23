import { FlowrEventSchedule } from './FlowrEventSchedule'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('flowr.event.schedule.date')
export class FlowrEventScheduleDate extends FlowrEventSchedule {
	start: Instant

	constructor(src: FlowrEventScheduleDate) {
		super(src)
		this.start = src.start
	}
}
