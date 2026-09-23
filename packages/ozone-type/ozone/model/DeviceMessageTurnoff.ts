import { DeviceMessage } from './DeviceMessage'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('device.message.turnoff')
export class DeviceMessageTurnoff extends DeviceMessage {
}
