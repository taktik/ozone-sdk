import { Response } from 'typescript-http-client'

export function returnNullOn404<T>(response: Response<T>) {
	if (response.status === 404) {
		return null
	} else {
		throw response
	}
}

export function deepCopy<T extends Object>(obj: T): T {
	let copy: any

	// Handle the 3 simple types, and null or undefined
	if (null == obj || 'object' !== typeof obj) return obj

	// Handle Date
	if (obj instanceof Date) {
		copy = new Date()
		copy.setTime(obj.getTime())
		return copy
	}

	// Handle Array
	if (obj instanceof Array) {
		copy = []
		for (let i = 0, len = obj.length; i < len; i++) {
			copy[i] = deepCopy(obj[i])
		}
		return copy
	}

	// Handle Object
	if (obj instanceof Object) {
		copy = {}
		for (let attr in obj) {
			if (obj.hasOwnProperty(attr)) copy[attr] = deepCopy(obj[attr])
		}
		return copy
	}

	throw new Error("Unable to copy obj! Its type isn't supported.")
}
