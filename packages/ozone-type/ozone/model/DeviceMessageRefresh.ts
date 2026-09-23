import { DeviceMessage } from './DeviceMessage'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('device.message.refresh')
export class DeviceMessageRefresh extends DeviceMessage {
}
