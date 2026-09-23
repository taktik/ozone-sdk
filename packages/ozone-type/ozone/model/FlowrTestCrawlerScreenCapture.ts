import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('flowr.test.crawler.screenCapture')
export class FlowrTestCrawlerScreenCapture extends Item {
	activeLayer?: string
	crawl?: UUID
	domCaptureBlob?: UUID
	flowrUrl?: string
	screenCaptureBlob?: UUID

	constructor(src: FlowrTestCrawlerScreenCapture) {
		super(src)
		this.activeLayer = src.activeLayer
		this.crawl = src.crawl
		this.domCaptureBlob = src.domCaptureBlob
		this.flowrUrl = src.flowrUrl
		this.screenCaptureBlob = src.screenCaptureBlob
	}
}
