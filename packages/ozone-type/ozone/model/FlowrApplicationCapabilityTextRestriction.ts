import { FlowrApplicationCapabilityRestriction } from './FlowrApplicationCapabilityRestriction'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('flowr.application.capability.text.restriction')
export class FlowrApplicationCapabilityTextRestriction extends FlowrApplicationCapabilityRestriction {
	text?: string

	constructor(src: FlowrApplicationCapabilityTextRestriction) {
		super(src)
		this.text = src.text
	}
}
