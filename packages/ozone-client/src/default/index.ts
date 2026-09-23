import { OzoneClient } from '../index'

let defaultClient: OzoneClient.OzoneClient | undefined = undefined

const sessionCredentials = new OzoneClient.SessionCredentials()

export function getDefaultClient(clientConfig?: Partial<OzoneClient.ClientConfiguration>): OzoneClient.OzoneClient {
	if (defaultClient === undefined) {
		const urlSearchParams = new URLSearchParams(window.location.search)
		const ozoneUrl: string = urlSearchParams.get('serverURL') || ''
		const config: OzoneClient.ClientConfiguration = {...{
			ozoneURL: `${ozoneUrl}/ozone`,
			ozoneCredentials: sessionCredentials
		}, ...(clientConfig ?? {})}
		defaultClient = OzoneClient.newOzoneClient(config)

		// eslint-disable-next-line @typescript-eslint/no-floating-promises
		defaultClient.start() // don't wait client started
	}
	return defaultClient
}
