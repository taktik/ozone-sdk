import { Item, OzoneType } from './Item'

@OzoneType('flowr.connect.config.features')
export class FlowrConnectFeatures extends Item {
	conference: boolean
    contentSharing: boolean

	constructor(src: FlowrConnectFeatures) {
		super(src)
		this.conference = src.conference
		this.contentSharing = src.contentSharing
	}
}
