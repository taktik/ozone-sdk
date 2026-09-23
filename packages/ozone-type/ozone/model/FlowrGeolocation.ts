import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('flowr.geolocation')
export class FlowrGeolocation extends Item {
	address?: string
	latitude?: number
	longitude?: number

	constructor(src: FlowrGeolocation) {
		super(src)
		this.address = src.address
		this.latitude = src.latitude
		this.longitude = src.longitude
	}
}
