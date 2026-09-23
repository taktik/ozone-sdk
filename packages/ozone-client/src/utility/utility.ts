import { Response } from 'typescript-http-client'

export function returnNullOn404<T>(response: Response<T>) {
	if (response.status === 404) {
		return null
	} else {
		throw response
	}
}
