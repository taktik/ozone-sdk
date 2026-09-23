import { Recording } from './Recording'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('flowrecording')
export class Flowrecording extends Recording {
	description?: string
	deviceId: UUID
	summary?: string
	thumbnail?: string

	constructor(src: Flowrecording) {
		super(src)
		this.description = src.description
		this.deviceId = src.deviceId
		this.summary = src.summary
		this.thumbnail = src.thumbnail
	}
}
