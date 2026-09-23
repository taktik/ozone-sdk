import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('flowr.test.crawler.captureDiffResult')
export class FlowrTestCrawlerCaptureDiffResult extends Item {
	crawlResult?: UUID
	diffCapture?: UUID
	screenCapture?: UUID

	constructor(src: FlowrTestCrawlerCaptureDiffResult) {
		super(src)
		this.crawlResult = src.crawlResult
		this.diffCapture = src.diffCapture
		this.screenCapture = src.screenCapture
	}
}
