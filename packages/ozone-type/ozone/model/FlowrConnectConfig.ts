import { FlowrConnectConfigQuotas } from './FlowrConnectConfigQuotas'
import { FlowrConnectFeatures } from './FlowrConnectFeatures'
import { Item, OzoneType } from './Item'

@OzoneType('flowr.connect.config')
export class FlowrConnectConfig extends Item {
	videoConfHost?: string
	storageUnit: string
	inputChannels: string[]
	quotas: FlowrConnectConfigQuotas
	tvUserExpirationDelayAfterLastActivityDays: number
	features: FlowrConnectFeatures

	constructor(src: FlowrConnectConfig) {
		super(src)
		this.videoConfHost = src.videoConfHost
		this.storageUnit = src.storageUnit
		this.inputChannels = src.inputChannels
		this.quotas = src.quotas
		this.tvUserExpirationDelayAfterLastActivityDays = src.tvUserExpirationDelayAfterLastActivityDays
		this.features = src.features
	}
}
