import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('flowr.test.crawler.organizationCrawl')
export class FlowrTestCrawlerOrganizationCrawl extends Item {
	isReferenceCrawl?: boolean
	organizationInfo?: UUID

	constructor(src: FlowrTestCrawlerOrganizationCrawl) {
		super(src)
		this.isReferenceCrawl = src.isReferenceCrawl
		this.organizationInfo = src.organizationInfo
	}
}
