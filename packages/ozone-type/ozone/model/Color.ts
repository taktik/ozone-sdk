import { Item, OzoneType } from './Item'

@OzoneType('flowr.color')
export class FlowrColor extends Item {
	name: string = '__customColorKey'
	value?: string

	constructor(src: FlowrColor) {
		super(src)
		this.name = src.name
		this.value = src.value
	}
}
