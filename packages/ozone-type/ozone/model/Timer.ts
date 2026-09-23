import { Metric } from './Metric'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('timer')
export class Timer extends Metric {
	count: number
	max: number
	mean: number
	totalTime: number

	constructor(src: Timer) {
		super(src)
		this.count = src.count
		this.max = src.max
		this.mean = src.mean
		this.totalTime = src.totalTime
	}
}
