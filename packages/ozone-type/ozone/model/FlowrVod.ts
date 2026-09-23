import { Item, UUID, Instant, OzoneType } from './Item'

export interface FlowrVod {
	actors?: string
	editors?: string
	episodeNumber?: number
	genre?: string
	groupingId?: string
	highlight?: boolean
	language?: string
	parentalGuidance?: number
	presentators?: string
	realisators?: string
	seasonNumber?: number
	subTitle?: { [key: string]: string; }
	vodType?: string
	year?: number
}
