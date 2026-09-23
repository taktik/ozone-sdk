import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('survey')
export class Survey extends Item {
	category?: UUID
	index?: number
	question?: { [key: string]: string; }

	constructor(src: Survey) {
		super(src)
		this.category = src.category
		this.index = src.index
		this.question = src.question
	}
}
