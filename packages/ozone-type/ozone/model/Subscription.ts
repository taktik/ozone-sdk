import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('subscription')
export class Subscription extends Item {
	action?: UUID
	description?: string
	devices?: UUID[]
	endDate?: Instant
	isActive?: boolean
	startDate?: Instant

	constructor(src: Subscription) {
		super(src)
		this.action = src.action
		this.description = src.description
		this.devices = src.devices
		this.endDate = src.endDate
		this.isActive = src.isActive
		this.startDate = src.startDate
	}
}
