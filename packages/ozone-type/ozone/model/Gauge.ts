import { Metric } from './Metric'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('gauge')
export class Gauge extends Metric {
	value: number

	constructor(src: Gauge) {
		super(src)
		this.value = src.value
	}
}
