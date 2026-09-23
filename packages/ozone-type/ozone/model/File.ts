import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('file')
export class File extends Item {
	blob?: UUID
	fileType?: UUID
	subFiles?: { [key: string]:UUID; }
	uti?: string
	utiHierarchy?: string[]

	constructor(src: File) {
		super(src)
		this.blob = src.blob
		this.fileType = src.fileType
		this.subFiles = src.subFiles
		this.uti = src.uti
		this.utiHierarchy = src.utiHierarchy
	}
}
