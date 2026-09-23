import { DeviceMessage } from './DeviceMessage'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('device.message.reload')
export class DeviceMessageReload extends DeviceMessage {
}
