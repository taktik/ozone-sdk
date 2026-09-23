import { DeviceMessage } from './DeviceMessage'

import { OzoneType } from './Item'

export enum Level {
	ALL,
	TRACE,
	DEBUG,
	INFO,
	WARN,
	ERROR,
	FATAL,
	OFF
}

@OzoneType('device.message.setloglevel')
export class DeviceMessageSetLogLevel extends DeviceMessage {
	level: Level

	constructor(src: DeviceMessageSetLogLevel) {
		super(src)
		this.level = src.level
	}
}
