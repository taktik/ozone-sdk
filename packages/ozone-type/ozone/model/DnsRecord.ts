import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('dns.record')
export class DnsRecord extends Item {
	value: string
	dns: UUID
	recordName: string
	recordType: string
	ttl: number

	constructor(src: DnsRecord) {
		super(src)
		this.value = src.value
		this.dns = src.dns
		this.recordName = src.recordName
		this.recordType = src.recordType
		this.ttl = src.ttl
		this.value = src.value
	}
}
