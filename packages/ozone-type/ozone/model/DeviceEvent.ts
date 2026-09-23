import { Event } from './Event'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('device.event')
export class DeviceEvent extends Event {
	devices?: UUID[]
	network?: UUID
	shouldBeAcknowledged?: boolean
	shouldWakeUpDevice?: boolean
	ttl?: number

	constructor(src: DeviceEvent) {
		super(src)
		this.devices = src.devices
		this.network = src.network
		this.shouldBeAcknowledged = src.shouldBeAcknowledged
		this.shouldWakeUpDevice = src.shouldWakeUpDevice
		this.ttl = src.ttl
	}
}
