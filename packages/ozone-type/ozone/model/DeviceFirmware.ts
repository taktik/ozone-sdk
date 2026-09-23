import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('device.firmware')
export class DeviceFirmware extends Item {
	binary?: UUID
	byteSize?: number
	description?: string
	fileName?: string
	softwareVersion?: string

	constructor(src: DeviceFirmware) {
		super(src)
		this.binary = src.binary
		this.byteSize = src.byteSize
		this.description = src.description
		this.fileName = src.fileName
		this.softwareVersion = src.softwareVersion
	}
}
