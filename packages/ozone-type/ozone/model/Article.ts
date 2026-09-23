import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('article')
export class Article extends Item {
	category?: UUID
	description?: { [key: string]: string; }
	index?: number
	localizedName?: { [key: string]: string; }
	logo?: UUID
	price?: number

	constructor(src: Article) {
		super(src)
		this.category = src.category
		this.description = src.description
		this.index = src.index
		this.localizedName = src.localizedName
		this.logo = src.logo
		this.price = src.price
	}
}
