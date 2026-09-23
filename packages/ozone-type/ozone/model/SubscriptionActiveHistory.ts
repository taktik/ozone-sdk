import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('subscription.active.history')
export class SubscriptionActiveHistory extends Item {
	subscriptionUuid?: UUID
	deviceUuid?: UUID
	startDate?: Instant
	endDate?: Instant
	isActive?: Boolean

	constructor(src: SubscriptionActiveHistory) {
		super(src)
		this.subscriptionUuid = src.subscriptionUuid
		this.deviceUuid = src.deviceUuid
		this.startDate = src.startDate
		this.endDate = src.endDate
		this.isActive = src.isActive
	}
}
