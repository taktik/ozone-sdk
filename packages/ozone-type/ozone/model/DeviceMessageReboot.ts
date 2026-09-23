import { DeviceMessage } from './DeviceMessage'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('device.message.reboot')
export class DeviceMessageReboot extends DeviceMessage {
}
