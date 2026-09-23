import { DeviceMessage } from './DeviceMessage'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('device.message.alarm')
export class DeviceMessageAlarm extends DeviceMessage {
}
