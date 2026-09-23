import { Item, OzoneType } from './Item'

@OzoneType('flowr.connect.tv.user')
export class FlowrConnectTvUser extends Item {
	code?: string
	lastActivityTimestampMs?: string
	linkedTV?: string

	constructor(src: FlowrConnectTvUser) {
		super(src)
		this.code = src.code
		this.lastActivityTimestampMs = src.lastActivityTimestampMs
		this.linkedTV = src.linkedTV
	}
}
