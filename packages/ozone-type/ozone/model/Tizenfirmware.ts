import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('tizenfirmware')
export class Tizenfirmware extends Item {
	binary?: UUID
	description?: string
	fileName?: string
	size_byte?: number
	swVersion?: string

	constructor(src: Tizenfirmware) {
		super(src)
		this.binary = src.binary
		this.description = src.description
		this.fileName = src.fileName
		this.size_byte = src.size_byte
		this.swVersion = src.swVersion
	}
}
