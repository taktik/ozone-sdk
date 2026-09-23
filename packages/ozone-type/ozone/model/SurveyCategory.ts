import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('survey.category')
export class SurveyCategory extends Item {
	description?: { [key: string]: string; }
	localizedName?: { [key: string]: string; }

	constructor(src: SurveyCategory) {
		super(src)
		this.description = src.description
		this.localizedName = src.localizedName
	}
}
