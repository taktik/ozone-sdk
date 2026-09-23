import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('network')
export class Network extends Item {
	address: string
	dns?: UUID
	netmask: string
	websocketUrl?: string

	constructor(src: Network) {
		super(src)
		this.address = src.address
		this.dns = src.dns
		this.netmask = src.netmask
		this.websocketUrl = src.websocketUrl
	}
}
