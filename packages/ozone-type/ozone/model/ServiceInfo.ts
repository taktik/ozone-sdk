import { Item, UUID, Instant, OzoneType } from './Item'

export interface ServiceInfo {
	instanceId: string
	properties?: { [key: string]:string; }
	replicaId: string
	serviceName: string
}
