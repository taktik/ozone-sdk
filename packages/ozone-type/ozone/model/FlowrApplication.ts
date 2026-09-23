import { FlowrApplicationAuthor } from './FlowrApplicationAuthor'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('flowr.application')
export class FlowrApplication extends Item {
	applicationVersion?: string
	author?: FlowrApplicationAuthor
	capabilities?: { [key: string]:string; }[]
	config?: { [key: string]:string; }
	description?: string
	script?: UUID

	constructor(src: FlowrApplication) {
		super(src)
		this.applicationVersion = src.applicationVersion
		this.author = src.author
		this.capabilities = src.capabilities
		this.config = src.config
		this.description = src.description
		this.script = src.script
	}
}
