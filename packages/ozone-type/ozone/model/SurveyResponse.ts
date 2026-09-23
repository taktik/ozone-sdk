import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('survey.response')
export class SurveyResponse extends Item {
	creationDate: Instant
	device: UUID
	lang: string
	response: string
	submitId: UUID
	survey: UUID

	constructor(src: SurveyResponse) {
		super(src)
		this.creationDate = src.creationDate
		this.device = src.device
		this.lang = src.lang
		this.response = src.response
		this.submitId = src.submitId
		this.survey = src.survey
	}
}
