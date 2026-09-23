import { Item, UUID } from './Item'

export enum CallDirection {
	INCOMING = 'INCOMING',
	OUTGOING = 'OUTGOING'
}

export enum CallResponse {
	ACCEPTED = 'ACCEPTED',
	REFUSED = 'REFUSED',
	IGNORED = 'IGNORED', // The call will continue ringing
	TERMINATED = 'TERMINATED' // The call has been terminated before it was answered
}

export class Call extends Item {
	from: string
	direction?: CallDirection
	response?: CallResponse
	wakeUpDevice?: boolean

	constructor(src: Call) {
		super(src)
		this.from = src.from
		this.direction = src.direction
		this.response = src.response
		this.wakeUpDevice = src.wakeUpDevice
	}
}

export class SipCall extends Call {
	receptionDate: string
	sipExtensionId: UUID

	constructor(src: SipCall) {
		super(src)
		this.receptionDate = src.receptionDate
		this.sipExtensionId = src.sipExtensionId
	}
}

export class VideoCall extends Call {
	callerId: UUID

	constructor(src: VideoCall) {
		super(src)
		this.callerId = src.callerId
	}
}

export const isSipCall = (call: Call): call is SipCall => call.type === 'sip.call'
export const isVideoCall = (call: Call): call is VideoCall => call.type === 'video.call'
