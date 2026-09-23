import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('flowr.cec.settings')
export class FlowrCecSettings extends Item {
	enableRemoteControl?: boolean
	enableStandby?: boolean

	constructor(src: FlowrCecSettings) {
		super(src)
		this.enableRemoteControl = src.enableRemoteControl
		this.enableStandby = src.enableStandby
	}
}
