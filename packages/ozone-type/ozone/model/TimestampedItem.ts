import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('timestampedItem')
export class TimestampedItem extends Item {
	date: Instant

	constructor(src: TimestampedItem) {
		super(src)
		this.date = src.date
	}
}
