import { FlowrCecSettings } from './FlowrCecSettings'
import { FlowrDisplaySettings } from './FlowrDisplaySettings'
import { FlowrGeolocation } from './FlowrGeolocation'
import { FlowrRemoteControlSettings } from './FlowrRemoteControlSettings'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('flowr.frontend.settings')
export class FlowrFrontendSettings extends Item {
	alarmPageId?: UUID
	audioLanguage?: string
	autoUpdate?: boolean
	bootPageId?: UUID
	flowrCecSettings?: FlowrCecSettings
	flowrDisplaySettings?: FlowrDisplaySettings
	flowrRemoteControlSettings?: FlowrRemoteControlSettings
	interfaceLanguage?: string
	lastChannelId?: UUID
	location?: FlowrGeolocation
	maxVolume?: number
	preferredContent?: UUID[]
	sipServer?: string
	startVolume?: number
	subtitlesLanguage?: string
	user?: UUID

	constructor(src: FlowrFrontendSettings) {
		super(src)
		this.alarmPageId = src.alarmPageId
		this.audioLanguage = src.audioLanguage
		this.autoUpdate = src.autoUpdate
		this.bootPageId = src.bootPageId
		this.flowrCecSettings = src.flowrCecSettings
		this.flowrDisplaySettings = src.flowrDisplaySettings
		this.flowrRemoteControlSettings = src.flowrRemoteControlSettings
		this.interfaceLanguage = src.interfaceLanguage
		this.lastChannelId = src.lastChannelId
		this.location = src.location
		this.maxVolume = src.maxVolume
		this.preferredContent = src.preferredContent
		this.sipServer = src.sipServer
		this.startVolume = src.startVolume
		this.subtitlesLanguage = src.subtitlesLanguage
		this.user = src.user
	}
}
