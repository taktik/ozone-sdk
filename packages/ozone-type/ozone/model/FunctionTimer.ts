import { Metric } from './Metric'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('functionTimer')
export class FunctionTimer extends Metric {
	count: number
	mean: number
	totalTime: number

	constructor(src: FunctionTimer) {
		super(src)
		this.count = src.count
		this.mean = src.mean
		this.totalTime = src.totalTime
	}
}
