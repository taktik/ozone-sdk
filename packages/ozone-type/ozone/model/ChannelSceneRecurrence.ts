import { Item, OzoneType } from './Item'
import { FlowrColor } from './Color'

@OzoneType('flowr.channel.scene.recurrence')
export class ChannelSceneRecurrence extends Item {
	mode?: string
	weekDays?: Array<number>
	months?: Array<number>
	days?: Array<number>
	color?: FlowrColor

	constructor(src: ChannelSceneRecurrence) {
		super(src)
		this.mode = src.mode
		this.weekDays = src.weekDays
		this.months = src.months
		this.days = src.days
		this.color = src.color
	}
}
