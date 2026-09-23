import { Media } from './Media'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('basket')
export class Basket extends Media {
	basketItems?: UUID[]

	constructor(src: Basket) {
		super(src)
		this.basketItems = src.basketItems
	}
}
