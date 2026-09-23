import { Instant, Item, OzoneType, UUID } from './Item'
import { isLocationZone, LocationZone } from './LocationZone'
import { PersistedFlowrWarningOperator } from './FlowrWarningOperator'
import { isLocationSite, LocationSite } from './LocationSite'

export enum LOG_ACTION {
	LOGIN = 'LOGIN',
	LOGOUT = 'LOGOUT',
	SWITCH_SITE = 'SWITCH_SITE',
	WARNING_ON = 'WARNING_ON',
	WARNING_OFF = 'WARNING_OFF',
	TEST_ON = 'TEST_ON',
	TEST_OFF = 'TEST_OFF'
}

class BareFlowrWarningLog extends Item {
	date: Instant
	action: LOG_ACTION
	targetType?: string

	constructor(src: BareFlowrWarningLog) {
		super(src)
		this.date = src.date
		this.action = src.action
		this.targetType = src.targetType
	}
}

@OzoneType('flowr.warning.log')
export class FlowrWarningLog extends BareFlowrWarningLog {
	operator: UUID
	target?: UUID

	constructor(src: FlowrWarningLog) {
		super(src)
		this.operator = src.operator
		this.target = src.target
	}
}

export class HydratedFlowrWarningLog extends BareFlowrWarningLog {
	id: UUID
	operator: PersistedFlowrWarningOperator
	target?: LocationZone | LocationSite

	constructor(src: any) {
		super(src)
		this.id = src.id
		this.operator = src.operator
		this.target = src.target
		this.type = src.type
	}

	getTargetToString(): string | undefined {
		if (!this.target) return
		if (isLocationSite(this.target)) return this.target.name
		if (isLocationZone(this.target)) return this.target.buttonText
	}
}

export const isFlowrWarningLog = (object: any): object is FlowrWarningLog => {
	return object.type === 'flowr.warning.log'
}

export const isHydratedFlowrWarningLog = (object: any): object is HydratedFlowrWarningLog => {
	return !!(object.type === 'flowr.warning.log' &&
		object.id &&
		(!object.target || isLocationZone(object.target) || isLocationSite(object.target)))
}
