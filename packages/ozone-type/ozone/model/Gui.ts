import { FlowrPackageable } from './FlowrPackageable'
import { RestrictedContent } from './RestrictedContent'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('gui')
export class Gui extends Item implements RestrictedContent, FlowrPackageable {
	guiUuid?: UUID
	i18n?: string
	indexHi?: number
	indexLow?: number
	inheritedFrom?: UUID
	onlyShowIfAssetsAvailable?: boolean
	packages?: UUID[]
	parent?: UUID
	restricted?: boolean
	tags?: string[]
	cannotBreakInheritance?: boolean

	constructor(src: Gui) {
		super(src)
		this.guiUuid = src.guiUuid
		this.i18n = src.i18n
		this.indexHi = src.indexHi
		this.indexLow = src.indexLow
		this.inheritedFrom = src.inheritedFrom
		this.onlyShowIfAssetsAvailable = src.onlyShowIfAssetsAvailable
		this.packages = src.packages
		this.parent = src.parent
		this.restricted = src.restricted
		this.tags = src.tags
		this.cannotBreakInheritance = src.cannotBreakInheritance
	}
}
