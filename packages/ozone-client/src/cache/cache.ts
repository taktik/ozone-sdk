export type CacheOptions = {
	/**
	 * max number of element store in cache
	 */
	max?: number,

	/**
	 * data validity expiration date
	 */
	maxAge?: number,

	/**
	 * get function will return the outdated value before delete it
	 */
	stale?: Boolean
}

type MapDataType<V> = {expires: number | false, content: V}

/**
 * TypeScript implementation of https://github.com/lukeed/tmp-cache
 * LRU caches operate on a first-in-first-out queue.
 * This means that the first item is the oldest and will therefore be deleted once the max limit has been reached.
 *
 * When a maxAge value is set, items are given an expiration date.
 * This allows existing items to become stale over time which, depending on your stale config,
 * is equivalent to the item not existing at all!
 *
 * In order to counteract this idle decay, all set() and get() operations on an item "refresh" its expiration date.
 * By doing so, a new expires value is issued & the item is moved to the end of the list — aka,
 * it's the newest kid on the block!
 *
 */
export class Cache<K, V> {
	private readonly store: Map<K,MapDataType<V>>

	private readonly max: number

	private readonly maxAge: number

	private readonly stale: Boolean

	constructor(opts: CacheOptions | number = {}) {
		this.store = new Map<K, MapDataType<V>>()

		let options: CacheOptions
		if (typeof opts === 'number') {
			options = { max: opts }
		} else {
			options = opts
		}

		let max = options.max || 0
		this.max = max > 0 && max || Infinity
		this.maxAge = options.maxAge !== undefined ? options.maxAge : -1
		this.stale = !!options.stale
	}

	peek(key: K) {
		return this.get(key, false)
	}

	get size(): number {
	  return this.store.size
	}

	clear(): void {
	  this.store.clear()
	}

	delete(key: K): boolean {
	  return this.store.delete(key)
	}

	forEach(callBack: (value: V, key: K) => void): void {
	  this.store.forEach((value, key) => callBack(value.content, key))
	}

	has(key: K): boolean {
		return this.store.has(key)
	}

	set(key: K, content: V, maxAge: number = this.maxAge) {
		this.has(key) && this.delete(key);
		(this.size + 1 > this.max) && this.delete(this.keys().next().value)
		const expires = maxAge > -1 && (maxAge + Date.now())
		return this.store.set(key, { expires, content })
	}

	get(key: K, mut: boolean = true) {
		const x = this.store.get(key)
		if (x === undefined) return x

		const { expires, content } = x
		if (expires !== false && Date.now() >= expires) {
			this.delete(key)
			return this.stale ? content : undefined
		}

		if (mut) this.set(key, content)
		return content
	}

	keys (): IterableIterator<K> {
		return this.store.keys()
	}
}
