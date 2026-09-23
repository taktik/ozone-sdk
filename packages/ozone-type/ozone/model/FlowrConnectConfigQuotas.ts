import { Item, OzoneType } from './Item'

@OzoneType('flowr.connect.config.quotas')
export class FlowrConnectConfigQuotas extends Item {
	byReceiverMB: number
    byUploaderMB: number

	constructor(src: FlowrConnectConfigQuotas) {
		super(src)
		this.byReceiverMB = src.byReceiverMB
		this.byUploaderMB = src.byUploaderMB
	}
}
