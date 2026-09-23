import { Item, UUID, Instant, OzoneType } from './Item'

export interface Principal {
	lastLoginDate?: Instant
	lastLoginIpAddress?: string
	roles?: UUID[]
	secret?: string
}
