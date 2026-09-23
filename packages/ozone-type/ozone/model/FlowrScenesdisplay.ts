import { ServiceInfo } from './ServiceInfo'
import { TimestampedItem } from './TimestampedItem'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('flowr.scenesdisplay')
export class FlowrScenesdisplay extends TimestampedItem implements ServiceInfo {
	description?: string
	displayId?: UUID
	duration?: number
	instanceId: string
	itemId?: UUID
	properties?: { [key: string]:string; }
	replicaId: string
	serviceName: string
	userAgent?: string

	constructor(src: FlowrScenesdisplay) {
		super(src)
		this.description = src.description
		this.displayId = src.displayId
		this.duration = src.duration
		this.instanceId = src.instanceId
		this.itemId = src.itemId
		this.properties = src.properties
		this.replicaId = src.replicaId
		this.serviceName = src.serviceName
		this.userAgent = src.userAgent
	}
}
