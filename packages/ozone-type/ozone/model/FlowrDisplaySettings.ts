import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('flowr.display.settings')
export class FlowrDisplaySettings extends Item {
	sleepTimer?: number

	constructor(src: FlowrDisplaySettings) {
		super(src)
		this.sleepTimer = src.sleepTimer
	}
}
