import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('eshop.order')
export class EshopOrder extends Item {
	body: string
	creationDate: Instant
	device: UUID

	constructor(src: EshopOrder) {
		super(src)
		this.body = src.body
		this.creationDate = src.creationDate
		this.device = src.device
	}
}
