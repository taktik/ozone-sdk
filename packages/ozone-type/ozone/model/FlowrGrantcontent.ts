import { SubscriptionAction } from './SubscriptionAction'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('flowr.grantcontent')
export class FlowrGrantcontent extends SubscriptionAction {
	actionRoles?: string[]
	packages?: UUID[]
	tags?: string[]
	unlimitedRights?: boolean

	constructor(src: FlowrGrantcontent) {
		super(src)
		this.actionRoles = src.actionRoles
		this.packages = src.packages
		this.tags = src.tags
		this.unlimitedRights = src.unlimitedRights
	}
}
