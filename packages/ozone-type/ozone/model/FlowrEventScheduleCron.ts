import { FlowrEventSchedule } from './FlowrEventSchedule'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('flowr.event.schedule.cron')
export class FlowrEventScheduleCron extends FlowrEventSchedule {
	cronExpression: string
	end?: Instant
	start?: Instant

	constructor(src: FlowrEventScheduleCron) {
		super(src)
		this.cronExpression = src.cronExpression
		this.end = src.end
		this.start = src.start
	}
}
