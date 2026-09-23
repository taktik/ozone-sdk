import { Item, OzoneType } from './Item'
import { LocationZone } from './LocationZone'
import { FlowrWarningParsable } from './FlowrWarningParsable'

@OzoneType('flowr.location.site')
export class LocationSite extends Item implements FlowrWarningParsable {
	shortName: string
	locationZones?: LocationZone[]
	constructor(src: LocationSite) {
		super(src)
		this.shortName = src.shortName
		this.locationZones = src.locationZones
	}
}

export class PersistedLocationSite extends LocationSite {
	id: string
	constructor(src: PersistedLocationSite) {
		super(src)
		this.id = src.id
	}
}

export const isLocationSite = (object: any): object is LocationSite => {
	return object.type === 'flowr.location.site'
}
