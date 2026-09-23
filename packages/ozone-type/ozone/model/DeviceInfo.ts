import { FlowrFrontendSettings } from './FlowrFrontendSettings'
import { Principal } from './Principal'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('device.info')
export class DeviceInfo extends Item implements Principal {
	activeMacAddress?: string
	connectionStatus?: string
	deviceType?: string
	deviceVersion?: string
	extraInformation?: string[]
	frontendSettings?: FlowrFrontendSettings
	frontendVersion?: string
	ipAddress?: string
	lastLoginDate?: Instant
	lastLoginIpAddress?: string
	lastSeenOnline?: Instant
	linkedUser?: UUID
	location?: string
	macAddress?: string
	model?: string
	network?: UUID
	packages?: UUID[]
	pmsPackages?: UUID[]
	principalName?: string
	roles?: UUID[]
	secret?: string
	serialNumber?: string
	status?: string
	subLocation?: string
	publicIpAddress?: string
	locationZone?: UUID
	flowrConnectTvUser?: UUID

	constructor(src: DeviceInfo) {
		super(src)
		this.activeMacAddress = src.activeMacAddress
		this.connectionStatus = src.connectionStatus
		this.deviceType = src.deviceType
		this.deviceVersion = src.deviceVersion
		this.extraInformation = src.extraInformation
		this.frontendSettings = src.frontendSettings
		this.frontendVersion = src.frontendVersion
		this.ipAddress = src.ipAddress
		this.lastLoginDate = src.lastLoginDate
		this.lastLoginIpAddress = src.lastLoginIpAddress
		this.lastSeenOnline = src.lastSeenOnline
		this.linkedUser = src.linkedUser
		this.location = src.location
		this.macAddress = src.macAddress
		this.model = src.model
		this.network = src.network
		this.packages = src.packages
		this.pmsPackages = src.pmsPackages
		this.principalName = src.principalName
		this.roles = src.roles
		this.secret = src.secret
		this.serialNumber = src.serialNumber
		this.status = src.status
		this.subLocation = src.subLocation
		this.publicIpAddress = src.publicIpAddress
		this.locationZone = src.locationZone
		this.flowrConnectTvUser = src.flowrConnectTvUser
	}
}
