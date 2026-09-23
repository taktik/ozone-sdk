import { Principal } from './Principal'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('flowr.agent')
export class FlowrAgent extends Item implements Principal {
	lastLoginDate?: Instant
	lastLoginIpAddress?: string
	network: UUID
	networks: UUID[]
	principalName?: string
	roles?: UUID[]
	secret?: string
	websocketUrl?: string

	constructor(src: FlowrAgent) {
		super(src)
		this.lastLoginDate = src.lastLoginDate
		this.lastLoginIpAddress = src.lastLoginIpAddress
		this.network = src.network
		this.networks = src.networks
		this.principalName = src.principalName
		this.roles = src.roles
		this.secret = src.secret
		this.websocketUrl = src.websocketUrl
	}
}
