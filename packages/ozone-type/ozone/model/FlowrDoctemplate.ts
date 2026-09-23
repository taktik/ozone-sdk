import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('flowr.doctemplate')
export class FlowrDoctemplate extends Item {
	attachmentName?: string
	attachmentTemplate?: string
	bodyTemplate?: string
	destination?: string
	identifier?: string
	language?: string
	subjectTemplate?: string

	constructor(src: FlowrDoctemplate) {
		super(src)
		this.attachmentName = src.attachmentName
		this.attachmentTemplate = src.attachmentTemplate
		this.bodyTemplate = src.bodyTemplate
		this.destination = src.destination
		this.identifier = src.identifier
		this.language = src.language
		this.subjectTemplate = src.subjectTemplate
	}
}
