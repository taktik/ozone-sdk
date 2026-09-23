import { ChannelInput } from './ChannelInput'
import { ChannelOutput } from './ChannelOutput'
import { FlowrLogoitem } from './FlowrLogoitem'
import { FlowrPackageable } from './FlowrPackageable'
import { FlowrTransient } from './FlowrTransient'
import { RestrictedContent } from './RestrictedContent'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('channel')
export class Channel extends Item implements RestrictedContent, FlowrLogoitem, FlowrPackageable, FlowrTransient {
	aliases?: string[]
	bufferDuration?: number
	cbUrl?: string
	channelType?: string
	channelUuid?: UUID
	defaultPackages?: string[]
	highlightLogo?: UUID
	horizontalRes?: number
	input?: ChannelInput
	isEncrypted?: boolean
	keywords?: string[]
	languageIndexes?: string[]
	languages?: string[]
	logo?: UUID
	multicastUrl?: string
	ottUrl?: string
	output?: ChannelOutput
	packages?: UUID[]
	restricted?: boolean
	/**
	 * @deprecated use scenesList instead
	 */
	scenes?: string[]
	scenesList?: UUID[]
	storage?: string
	transcoderEnabled?: boolean
	tvGuideNames?: string[]
	validFrom?: Instant
	validUntil?: Instant
	verticalRes?: number

	constructor(src: Channel) {
		super(src)
		this.aliases = src.aliases
		this.bufferDuration = src.bufferDuration
		this.cbUrl = src.cbUrl
		this.channelType = src.channelType
		this.channelUuid = src.channelUuid
		this.defaultPackages = src.defaultPackages
		this.highlightLogo = src.highlightLogo
		this.horizontalRes = src.horizontalRes
		this.input = src.input
		this.keywords = src.keywords
		this.languageIndexes = src.languageIndexes
		this.languages = src.languages
		this.logo = src.logo
		this.multicastUrl = src.multicastUrl
		this.ottUrl = src.ottUrl
		this.output = src.output
		this.packages = src.packages
		this.restricted = src.restricted
		this.scenes = src.scenes
		this.scenesList = src.scenesList
		this.storage = src.storage
		this.transcoderEnabled = src.transcoderEnabled
		this.isEncrypted = src.isEncrypted
		this.tvGuideNames = src.tvGuideNames
		this.validFrom = src.validFrom
		this.validUntil = src.validUntil
		this.verticalRes = src.verticalRes
	}
}
