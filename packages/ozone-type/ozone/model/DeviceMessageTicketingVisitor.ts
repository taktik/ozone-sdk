import { DeviceMessage } from './DeviceMessage'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('device.message.ticketing.visitor')
export class DeviceMessageTicketingVisitor extends DeviceMessage {
	firstName?: string
	lastName?: string

	constructor(src: DeviceMessageTicketingVisitor) {
		super(src)
		this.firstName = src.firstName
		this.lastName = src.lastName
	}
}
