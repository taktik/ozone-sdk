import { Item } from '../Item'
import { Principal } from '../Principal'

export class SipServer extends Item implements Principal {
	ipAddress: string
	secret: string
	plainSecret: string
	port: number
	extensionsPrefix?: string
	roles?: any[]
	trunk?: SipTrunk | null

	constructor(src: SipServer) {
		super(src)
		this.secret = src.secret
		this.ipAddress = src.ipAddress
		this.plainSecret = src.plainSecret
		this.port = src.port
		this.extensionsPrefix = src.extensionsPrefix
		this.trunk = src.trunk
		this.roles = src.roles
	}
}

export enum SipTrunkDirection {
	INCOMING = 'INCOMING',
	OUTGOING = 'OUTGOING'
}

export interface SipTrunk {
	direction: SipTrunkDirection
	domain: string
	port: number
	authUsername?: string
	authPassword?: string
}
