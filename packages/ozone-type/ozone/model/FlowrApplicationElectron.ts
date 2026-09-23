import { FlowrApplication } from './FlowrApplication'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('flowr.application.electron')
export class FlowrApplicationElectron extends FlowrApplication {
	restrictions?: { [key: string]:string; }[]

	constructor(src: FlowrApplicationElectron) {
		super(src)
		this.restrictions = src.restrictions
	}
}
