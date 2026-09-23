import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('flowr.epg')
export class FlowrEpg extends Item {
	timezone?: string
	url?: string
	xslt?: string

	constructor(src: FlowrEpg) {
		super(src)
		this.timezone = src.timezone
		this.url = src.url
		this.xslt = src.xslt
	}
}
