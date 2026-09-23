import { Externalmedia } from './Externalmedia'
import { Video } from './Video'

import { Item, UUID, Instant, OzoneType } from './Item'

@OzoneType('externalvideo')
export class Externalvideo extends Video implements Externalmedia {
	externalDate?: Instant
	externalId?: string
	externalSource?: string
	externalURL?: string
	externalValidityDate?: Instant

	constructor(src: Externalvideo) {
		super(src)
		this.externalDate = src.externalDate
		this.externalId = src.externalId
		this.externalSource = src.externalSource
		this.externalURL = src.externalURL
		this.externalValidityDate = src.externalValidityDate
	}
}
