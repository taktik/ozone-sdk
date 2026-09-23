import { Item, UUID, Instant, OzoneType } from "./Item";

enum ConnectionStatus {
	CONNECTED = "CONNECTED",
	DISCONNECTED = "DISCONNECTED",
}

@OzoneType("flowr.chromecast")
export class FlowrChromecast extends Item {
	mac: string;
	chromecastId: string;
	ip: string;
	model: string;
	flowrDeviceId: UUID;
	hdmiPort = 1;
	pairings: FlowrChromecastPairing[];
	originalName: string;
	connectionStatus: ConnectionStatus;
	lastSeenOnline: Instant;

	constructor(src: FlowrChromecast) {
		super(src);

		this.mac = src.mac;
		this.chromecastId = src.chromecastId;
		this.ip = src.ip;
		this.model = src.model;
		this.flowrDeviceId = src.flowrDeviceId;
		this.hdmiPort = src.hdmiPort;
		this.pairings = src.pairings;
		this.originalName = src.originalName;
		this.connectionStatus = src.connectionStatus;
		this.lastSeenOnline = src.lastSeenOnline;
	}

	get displayName(): string {
		return this.name || this.originalName;
	}

	get bothNames(): string {
		let name = this.originalName;

		if (this.name) {
			name += ` (overridden name=${this.name})`;
		}

		return name;
	}
}

@OzoneType("flowr.chromecast.pairing")
export class FlowrChromecastPairing extends Item {
	ip: string;
	mac: string;
	creation: Instant;
	expiration: Instant;

	constructor(src: FlowrChromecastPairing) {
		super(src);

		this.ip = src.ip;
		this.mac = src.mac;
		this.creation = src.creation;
		this.expiration = src.expiration;
	}
}
