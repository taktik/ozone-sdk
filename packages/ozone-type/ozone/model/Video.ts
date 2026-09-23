import { FlowrLogoitem } from './FlowrLogoitem'
import { FlowrVod } from './FlowrVod'
import { Media } from './Media'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('video')
export class Video extends Media implements FlowrLogoitem, FlowrVod {
	actors?: string
	editors?: string
	episodeNumber?: number
	genre?: string
	groupingId?: string
	highlight?: boolean
	highlightLogo?: UUID
	language?: string
	logo?: UUID
	parentalGuidance?: number
	presentators?: string
	realisators?: string
	seasonNumber?: number
	subTitle?: { [key: string]: string; }
	vodType?: string
	year?: number

	constructor(src: Video) {
		super(src)
		this.actors = src.actors
		this.editors = src.editors
		this.episodeNumber = src.episodeNumber
		this.genre = src.genre
		this.groupingId = src.groupingId
		this.highlight = src.highlight
		this.highlightLogo = src.highlightLogo
		this.language = src.language
		this.logo = src.logo
		this.parentalGuidance = src.parentalGuidance
		this.presentators = src.presentators
		this.realisators = src.realisators
		this.seasonNumber = src.seasonNumber
		this.subTitle = src.subTitle
		this.vodType = src.vodType
		this.year = src.year
	}
}
