import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('reservation')
export class Reservation extends Item {
	a0?: string
	a1?: string
	a2?: string
	a3?: string
	a4?: string
	a5?: string
	a6?: string
	a7?: string
	a8?: string
	a9?: string
	bedName?: string
	checkOut?: number
	classOfService?: string
	code?: string
	date?: number
	guestArrivalDate?: number
	guestBirthDate?: string
	guestDepartureDate?: number
	guestFirstName?: string
	guestGroupNumber?: string
	guestLanguage?: string
	guestName?: string
	guestTitle?: string
	guestVipStatus?: string
	lastMutationDate?: number
	minibarRights?: string
	noPostStatus?: string
	oldRoomNumber?: string
	profileNumber?: string
	reservationNumber?: number
	roomNumber?: string
	sdaName?: string
	sdaPrefix?: string
	serviceName?: string
	shareFlag?: string
	swapFlag?: string
	telEnabled?: boolean
	time?: number
	tmmAddress?: string
	tmmName?: string
	tvEnabled?: boolean
	tvRights?: string
	videoRights?: string
	visitNumber?: string
	webEnabled?: boolean
	workstationId?: string

	constructor(src: Reservation) {
		super(src)
		this.a0 = src.a0
		this.a1 = src.a1
		this.a2 = src.a2
		this.a3 = src.a3
		this.a4 = src.a4
		this.a5 = src.a5
		this.a6 = src.a6
		this.a7 = src.a7
		this.a8 = src.a8
		this.a9 = src.a9
		this.bedName = src.bedName
		this.checkOut = src.checkOut
		this.classOfService = src.classOfService
		this.code = src.code
		this.date = src.date
		this.guestArrivalDate = src.guestArrivalDate
		this.guestBirthDate = src.guestBirthDate
		this.guestDepartureDate = src.guestDepartureDate
		this.guestFirstName = src.guestFirstName
		this.guestGroupNumber = src.guestGroupNumber
		this.guestLanguage = src.guestLanguage
		this.guestName = src.guestName
		this.guestTitle = src.guestTitle
		this.guestVipStatus = src.guestVipStatus
		this.lastMutationDate = src.lastMutationDate
		this.minibarRights = src.minibarRights
		this.noPostStatus = src.noPostStatus
		this.oldRoomNumber = src.oldRoomNumber
		this.profileNumber = src.profileNumber
		this.reservationNumber = src.reservationNumber
		this.roomNumber = src.roomNumber
		this.sdaName = src.sdaName
		this.sdaPrefix = src.sdaPrefix
		this.serviceName = src.serviceName
		this.shareFlag = src.shareFlag
		this.swapFlag = src.swapFlag
		this.telEnabled = src.telEnabled
		this.time = src.time
		this.tmmAddress = src.tmmAddress
		this.tmmName = src.tmmName
		this.tvEnabled = src.tvEnabled
		this.tvRights = src.tvRights
		this.videoRights = src.videoRights
		this.visitNumber = src.visitNumber
		this.webEnabled = src.webEnabled
		this.workstationId = src.workstationId
	}
}
