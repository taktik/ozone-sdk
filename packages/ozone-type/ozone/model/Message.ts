import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('message')
export class Message extends Item {
	attachments?: string
	body?: string
	creationDate?: number
	date?: number
	externalId?: number
	fidelioId?: number
	from?: string
	internalLink?: string
	messageType?: string
	priority?: number
	read?: number
	subject?: string
	time?: number
	toDeviceId?: UUID
	toReservationNumber?: number
	toRoomNumber?: string

	constructor(src: Message) {
		super(src)
		this.attachments = src.attachments
		this.body = src.body
		this.creationDate = src.creationDate
		this.date = src.date
		this.externalId = src.externalId
		this.fidelioId = src.fidelioId
		this.from = src.from
		this.internalLink = src.internalLink
		this.messageType = src.messageType
		this.priority = src.priority
		this.read = src.read
		this.subject = src.subject
		this.time = src.time
		this.toDeviceId = src.toDeviceId
		this.toReservationNumber = src.toReservationNumber
		this.toRoomNumber = src.toRoomNumber
	}
}
