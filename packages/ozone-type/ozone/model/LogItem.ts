import { ServiceInfo } from './ServiceInfo'
import { TimestampedItem } from './TimestampedItem'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('logItem')
export class LogItem extends TimestampedItem implements ServiceInfo {
	category: string
	instanceId: string
	message: string
	properties?: { [key: string]:string; }
	replicaId: string
	serviceName: string
	severity: string
	stackTrace: string
	thread: string

	constructor(src: LogItem) {
		super(src)
		this.category = src.category
		this.instanceId = src.instanceId
		this.message = src.message
		this.properties = src.properties
		this.replicaId = src.replicaId
		this.serviceName = src.serviceName
		this.severity = src.severity
		this.stackTrace = src.stackTrace
		this.thread = src.thread
	}
}
