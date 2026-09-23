import { FlowrApplicationCapability } from './FlowrApplicationCapability'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('flowr.application.capability.restriction')
export class FlowrApplicationCapabilityRestriction extends Item {
	capability: FlowrApplicationCapability

	constructor(src: FlowrApplicationCapabilityRestriction) {
		super(src)
		this.capability = src.capability
	}
}
