import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('vehicleposition')
export class Vehicleposition extends Item {
	directionId?: number
	distanceFromPoint?: number
	lineId?: number
	pointId?: number

	constructor(src: Vehicleposition) {
		super(src)
		this.directionId = src.directionId
		this.distanceFromPoint = src.distanceFromPoint
		this.lineId = src.lineId
		this.pointId = src.pointId
	}
}
