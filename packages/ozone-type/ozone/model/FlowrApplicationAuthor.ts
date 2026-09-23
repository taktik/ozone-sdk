import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('flowr.application.author')
export class FlowrApplicationAuthor extends Item {
	email?: string

	constructor(src: FlowrApplicationAuthor) {
		super(src)
		this.email = src.email
	}
}
