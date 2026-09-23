import { Item, UUID, Instant, OzoneType } from './Item'

export interface FlowrTransient {
	validFrom?: Instant
	validUntil?: Instant
}
