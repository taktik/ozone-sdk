import { DeviceMessage } from './DeviceMessage'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('device.message.turnon')
export class DeviceMessageTurnon extends DeviceMessage {
}
