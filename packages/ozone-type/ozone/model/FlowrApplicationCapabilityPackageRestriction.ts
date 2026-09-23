import { FlowrApplicationCapabilityRestriction } from './FlowrApplicationCapabilityRestriction'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('flowr.application.capability.package.restriction')
export class FlowrApplicationCapabilityPackageRestriction extends FlowrApplicationCapabilityRestriction {
	packages?: UUID[]

	constructor(src: FlowrApplicationCapabilityPackageRestriction) {
		super(src)
		this.packages = src.packages
	}
}
