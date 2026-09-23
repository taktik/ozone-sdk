export default function uniqBy<T>(list: T[] | null | undefined, identifier: keyof T | ((element: T) => unknown)): T[] {
	const alreadyKept: any[] = []

	return list?.filter(element => {
		const value = typeof identifier === 'function'
			? identifier(element)
			: element[identifier]
		const toKeep = !alreadyKept.includes(value)

		if (toKeep) {
			alreadyKept.push(value)
		}
		return toKeep
	}) ?? []
}
