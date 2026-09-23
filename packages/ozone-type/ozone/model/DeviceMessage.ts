import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('device.message')
export class DeviceMessage extends Item {
	postingId?: UUID
	ttl?: number

	constructor(src: DeviceMessage) {
		super(src)
		this.postingId = src.postingId
		this.ttl = src.ttl
	}
}
