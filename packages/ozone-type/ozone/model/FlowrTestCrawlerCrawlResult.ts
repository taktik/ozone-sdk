import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('flowr.test.crawler.crawlResult')
export class FlowrTestCrawlerCrawlResult extends Item {
	comparaisonScore?: number
	referenceCrawl?: UUID
	testCrawl?: UUID

	constructor(src: FlowrTestCrawlerCrawlResult) {
		super(src)
		this.comparaisonScore = src.comparaisonScore
		this.referenceCrawl = src.referenceCrawl
		this.testCrawl = src.testCrawl
	}
}
