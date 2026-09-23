import { Item, OzoneType } from './Item'

@OzoneType('flowr.connect.app.user')
export class FlowrConnectAppUser extends Item {
	tvUsers?: string[]

	constructor(src: FlowrConnectAppUser) {
		super(src)
		this.tvUsers = src.tvUsers
	}
}
