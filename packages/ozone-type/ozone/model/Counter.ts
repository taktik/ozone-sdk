import { Metric } from './Metric'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('counter')
export class Counter extends Metric {
	count: number

	constructor(src: Counter) {
		super(src)
		this.count = src.count
	}
}
