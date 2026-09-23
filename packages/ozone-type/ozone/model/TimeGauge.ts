import { Gauge } from './Gauge'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('timeGauge')
export class TimeGauge extends Gauge {
}
