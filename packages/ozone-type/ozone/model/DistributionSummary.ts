import { Metric } from './Metric'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('distributionSummary')
export class DistributionSummary extends Metric {
	count: number
	max: number
	mean: number
	totalAmount: number

	constructor(src: DistributionSummary) {
		super(src)
		this.count = src.count
		this.max = src.max
		this.mean = src.mean
		this.totalAmount = src.totalAmount
	}
}
