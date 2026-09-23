import { Item, UUID, Instant, OzoneType } from './Item'

export interface FlowrMedia {
	localizedDescription?: { [key: string]: string; }
	localizedName?: { [key: string]: string; }
	localizedShortDescription?: { [key: string]: string; }
	localizedTitle?: { [key: string]: string; }
	mediaUuid?: UUID
	usage?: string
}
