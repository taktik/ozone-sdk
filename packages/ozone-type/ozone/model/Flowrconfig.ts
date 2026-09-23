import { FlowrConnectConfig } from './FlowrConnectConfig'
import { Item, UUID, OzoneType } from './Item'

@OzoneType('flowrconfig')
export class Flowrconfig extends Item {
	backendVersion?: number
	rootFolder?: UUID
	flowrConnectConfig?: FlowrConnectConfig

	constructor(src: Flowrconfig) {
		super(src)
		this.backendVersion = src.backendVersion
		this.rootFolder = src.rootFolder
	}
}
