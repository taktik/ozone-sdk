import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('flowr.event.schedule')
export class FlowrEventSchedule extends Item {
	description?: string
	event: UUID
	state: string

	constructor(src: FlowrEventSchedule) {
		super(src)
		this.description = src.description
		this.event = src.event
		this.state = src.state
	}
}
