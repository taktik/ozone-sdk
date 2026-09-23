import { Item, OzoneType, UUID } from './Item'
import { FlowrWarningParsable } from './FlowrWarningParsable'
import { WARNING_STATES } from './DeviceMessageWarning'
import { DeviceInfo } from './DeviceInfo'

@OzoneType('flowr.location.building')
export class LocationZone extends Item implements FlowrWarningParsable {
	position: number = 0
	locationSite: UUID
	buttonText: string
	warningState?: WARNING_STATES = WARNING_STATES.OFF
	devices?: DeviceInfo[]

	constructor(src: LocationZone) {
		super(src)
		this.position = src.position
		this.buttonText = src.buttonText
		this.locationSite = src.locationSite
		this.warningState = src.warningState
	}
}

export class PersistedLocationZone extends LocationZone {
	id: string
	constructor(src: PersistedLocationZone) {
		super(src)
		this.id = src.id
	}
}

export const isLocationZone = (object: any): object is LocationZone => {
	return object.type === 'flowr.location.zone'
}
