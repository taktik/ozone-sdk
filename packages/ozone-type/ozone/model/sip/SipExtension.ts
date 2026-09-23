import { Item } from '../Item'

export class SipExtension extends Item {
	deviceId: string
	serverId: string
	username: string
	password: string

	constructor(src: SipExtension) {
		super(src)
		this.deviceId = src.deviceId
		this.serverId = src.serverId
		this.username = src.username
		this.password = src.password
	}
}
