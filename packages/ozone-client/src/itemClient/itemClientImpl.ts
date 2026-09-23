import { FromOzone, Item, Query, SearchRequest, UUID, State as MetaState, Patch } from '@taktik/ozone-type'
import { ItemClient, SearchResults, SearchIterator, SearchIdsResults } from './itemClient'
import { OzoneClient } from '../ozoneClient/ozoneClient'
import { Request, Response as HttpClientResponse } from 'typescript-http-client'
import { returnNullOn404 } from '../utility/utility'

export class ItemClientImpl<T extends Item> implements ItemClient<T> {
	constructor(private client: OzoneClient, private baseUrl: string, private typeIdentifier: string) {
	}

	async count(query?: Query): Promise<number> {
		const results = await this.search({
			query: query,
			size: 0
		})
		return results.total || 0
	}

	deleteById(id: UUID, permanent = false): Promise<UUID | null> {
		const request = new Request(`${this.baseUrl}/rest/v3/items/${this.typeIdentifier}/${id}${permanent ? '?permanent=true' : ''}`)
			.setMethod('DELETE')
		return this.client.call<UUID>(request).catch(returnNullOn404)
	}

	deleteByIds(ids: UUID[], permanent = false): Promise<UUID[]> {
		const request = new Request(`${this.baseUrl}/rest/v3/items/${this.typeIdentifier}/bulkDelete${permanent ? '?permanent=true' : ''}`)
			.setMethod('POST')
			.setBody(ids)
		return this.client.call<UUID[]>(request)
	}

	async findAll(): Promise<FromOzone<T>[]> {
		const results = await this.search({
			size: 10_000
		})
		return results?.results ?? []
	}

	findAllByIds(ids: UUID[]): Promise<FromOzone<T>[]> {
		const request = new Request(`${this.baseUrl}/rest/v3/items/${this.typeIdentifier}/bulkGet`)
			.setMethod('POST')
			.setBody(ids)
		return this.client.call<FromOzone<T>[]>(request)
	}

	findOne(id: UUID): Promise<FromOzone<T> | null> {
		const request = new Request(`${this.baseUrl}/rest/v3/items/${this.typeIdentifier}/${id}`)
			.setMethod('GET')
		return this.client.call<FromOzone<T>>(request).catch(returnNullOn404)
	}

	async save(item: Patch<T>): Promise<FromOzone<T>> {
		const request = new Request(`${this.baseUrl}/rest/v3/items/${this.typeIdentifier}`)
			.setMethod('POST')
			.setBody(item)
		const savedItem = await this.client.call<FromOzone<T>>(request)
		if (savedItem._meta.state === MetaState.ERROR) {
			throw savedItem
		}
		return savedItem
	}

	async saveAll(items: Patch<T>[]): Promise<FromOzone<T>[]> {
		const request = new Request(`${this.baseUrl}/rest/v3/items/${this.typeIdentifier}/bulkSave`)
			.setMethod('POST')
			.setBody(items)
		const savedItems = await this.client.call<FromOzone<T>[]>(request)
		if (savedItems.some(item => item._meta.state === MetaState.ERROR)) {
			throw savedItems
		}
		return savedItems
	}

	search(searchRequest: SearchRequest): Promise<SearchResults<FromOzone<T>>> {
		const request = new Request(`${this.baseUrl}/rest/v3/items/${this.typeIdentifier}/search`)
			.setMethod('POST')
			.setBody(searchRequest)
		return this.client.call<SearchResults<FromOzone<T>>>(request)
	}

	searchIds(searchRequest: SearchRequest): Promise<SearchIdsResults> {
		const request = new Request(`${this.baseUrl}/rest/v3/items/${this.typeIdentifier}/searchIds`)
			.setMethod('POST')
			.setBody(searchRequest)
		return this.client.call<SearchIdsResults>(request)
	}

	searchGenerator (searchRequest: SearchRequest): SearchIterator<T> {
		return new SearchIteratorImpl<T>(this.client, this.baseUrl, this.typeIdentifier, searchRequest)
	}

	async broadcast(item: T): Promise<FromOzone<T>> {
		const request = new Request(`${this.baseUrl}/rest/v3/items/${this.typeIdentifier}/broadcast`)
			.setMethod('POST')
			.setBody(item)
		const savedItem = await this.client.call<FromOzone<T>>(request)
		if (savedItem._meta.state === MetaState.ERROR) {
			throw savedItem
		}
		return savedItem
	}

	async bulkBroadcast(items: T[]): Promise<FromOzone<T>[]> {
		const request = new Request(`${this.baseUrl}/rest/v3/items/${this.typeIdentifier}/bulkBroadcast`)
			.setMethod('POST')
			.setBody(items)
		const savedItems = await this.client.call<FromOzone<T>[]>(request)
		if (savedItems.some(item => item._meta.state === MetaState.ERROR)) {
			throw savedItems
		}
		return savedItems
	}

	async queryDelete (searchQuery: Query, permanent = false): Promise<UUID[]> {
		const url = `${this.baseUrl}/rest/v3/items/${this.typeIdentifier}/queryDelete${permanent ? '?permanent=true' : ''}`
		const request = new Request(url)
			.setMethod('POST')
			.setBody(searchQuery)
		return this.client.call<UUID[]>(request)
	}
}

class SearchIteratorImpl<T> implements SearchIterator<T> {
	private hasMoreData: boolean = true
	private loadingSize: number = 0

	currentRequest?: Request

	constructor(private client: OzoneClient, private baseUrl: string, private typeIdentifier: string, private searchRequest: SearchRequest) {}

	private _search(searchRequest: SearchRequest): Promise<SearchResults<FromOzone<T>>> {
		try {
			this.currentRequest = new Request(`${this.baseUrl}/rest/v3/items/${this.typeIdentifier}/search`)
				.setMethod('POST')
				.setBody(searchRequest)
			return this.client.call<SearchResults<FromOzone<T>>>(this.currentRequest)
		} catch (err) {
			if (err instanceof HttpClientResponse) {
				if (err.request && err.request.isAborted) {
					throw Error('search aborted')
				}
			}

			throw err
		}
	}

	public async next(forceOffset?: number): Promise<IteratorResult<SearchResults<FromOzone<T>>>> {
		try {
			if (this.hasMoreData || forceOffset !== undefined) {
				this.searchRequest.offset = forceOffset !== undefined ? forceOffset : this.loadingSize
				const response = await this._search(this.searchRequest)
				this.loadingSize = this.searchRequest.offset + (response.size || 0)
				const done = !this.hasMoreData
				this.hasMoreData = this.loadingSize < Number(response.total || 0)
				return { value: response, done }
			}
		} catch (err) {
			if (
				!(err instanceof HttpClientResponse)
				|| !err.request?.isAborted
			) {
				throw err
			}
		}
		return { done: true, value: {} }
	}
	public cancel() {
		if (this.currentRequest) {
			this.currentRequest.abort()
		}
	}
	[Symbol.asyncIterator]() {
		return this
	}
}
