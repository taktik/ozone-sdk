/**
 * Created by hubert on 8/06/17.
 */
import { SearchRequest, Query, BoolQuery, Sort } from '@taktik/ozone-type'
import {
	existsQuery,
	idsQuery,
	quicksearch,
	rangeQuery,
	regexpQuery,
	tenantQuery,
	termQuery,
	termsQuery,
	termsQueryOptions,
	typeQuery,
	typeQueryWithSubType,
	wildcardQuery,
} from './functions'
import { BoolQueryName } from './types'
type SearchModeEnum = SearchRequest.SearchModeEnum

/**
 * Class helper to create searchQuery.
 * * Example:
 * ```javaScript
 *   let searchQuery = new SearchQuery();
 *   searchQuery.quicksearch('');
 *   const searchGenerator = itemClient.search(searchQuery.searchRequest);
 * ```
 *
 * Search query can be chain.
 *  * Example:
 * ```javaScript
 *   let searchQuery = new SearchQuery();
 *   // ((type == 'aTypeor' or contains 'hello') and 'myField' == 'aText)
 *   // Order by 'creationDate'
 *   searchQuery
 *      .typeQuery('aType')
 *      .or.quicksearch('hello')
 *      .and.termQuery('myField','aText')
 *      .order('creationDate').DESC;
 *
 *   searchQuery.quicksearch('').and;
 *
 *   const searchGenerator = itemClient.search(searchQuery.searchRequest);
 *
 *  * Example:
 * ```javaScript
 *   let searchQuery = new SearchQuery();
 *   // type == 'aTypeor' or contains 'hello' or 'myField' == 'aText'
 *   searchQuery
 *      .typeQuery('aType')
 *      .or
 *         .quicksearch('hello')
 *         .termQuery('myField','aText');
 *
 *   const searchGenerator = itemClient.search(searchQuery.searchRequest);
 * ```
 */
export class SearchQuery {
	_searchRequest: SearchRequest = {
		size: 10,
	}

	_collection?: string

	/**
	 * Set collection to search on.
	 * @deprecated
	 * @param {string} collection
	 * @return {this} this to be chained
	 */
	on(collection: string) {
		this._collection = collection
		return this
	}

	/**
	 * @deprecated
	 */
	get collection(): string | undefined {
		return this._collection
	}
	get searchQuery() {
		return JSON.stringify(this._searchRequest)
	}

	/**
	 * searchRequest getter
	 */
	get searchRequest(): SearchRequest {
		return this._searchRequest
	}

	/**
	 * create boolQuery mustClauses.
	 * @return {this}
	 */
	get and(): this {
		return this.boolQuery('mustClauses')
	}

	/**
	 * create boolQuery shouldClauses.
	 * @return {this}
	 */
	get or(): this {
		return this.boolQuery('shouldClauses')
	}

	/**
	 * create boolQuery mustNotClauses (nand).
	 * @return {this}
	 */
	get not(): this {
		return this.boolQuery('mustNotClauses')
	}

	private add<Args extends any[]>(fun: (...args: Args) => Query): (...args: Args) => this {
		return (...args: Args): this => {
			return this.addQuery(fun(...args))
		}
	}

	/**
	 * set search request size
	 * Can be chain.
	 * @param {number} size
	 * @return {this} this
	 */
	setSize(size: number): this {
		this._searchRequest.size = size
		return this
	}
	/**
	 * set search request offsed
	 * Can be chain.
	 * @param {number} offset
	 * @return {this} this
	 */
	setOffset(offset: number): this {
		this._searchRequest.offset = offset
		return this
	}

	/**
	 * set search request searchMode
	 * Can be chain.
	 * @param {number} searchMode
	 * @return {this} this
	 */
	setSearchMode(searchMode: SearchModeEnum): this {
		this._searchRequest.searchMode = searchMode
		return this
	}

	/**
	 * generic boolQuery
	 * Can be chain.
	 * @param {string} kind kind of bool query
	 * @return {this}
	 */
	boolQuery(kind: BoolQueryName): this {
		const currentQuery = this._searchRequest.query
			? Object.assign({}, this._searchRequest.query)
			: undefined
		this._searchRequest.query = {
			$type: 'BoolQuery',
		}

		this._searchRequest.query[kind] = []
		if (currentQuery) {
			this._searchRequest.query[kind].push(currentQuery)
		}

		return this
	}

	/**
	 * Combine query
	 * @param searchQuery
	 */
	combineWith(searchQuery: SearchQuery): this {
		if (searchQuery._searchRequest?.query) {
			this.addQuery(searchQuery._searchRequest.query)
			return this
		}

		throw Error('No query define in combineWith(searchQuery)')
	}

	/**
	 * Search for auto complete
	 * @param {string} searchString
	 * @param {string?} lastTerm
	 * @param {number?} size
	 * @return {this}
	 */
	suggestion(searchString: string, lastTerm: string = '', size?: number): this {
		const suggestSize = size || this._searchRequest.size

		this._searchRequest.aggregations = [
			{
				$type: 'TermsAggregation',
				name: 'suggest',
				field: '_quicksearch',
				order: 'COUNT_DESC',
				size: suggestSize,
				includePattern: `${lastTerm}.*`,
			},
		]

		return this.quicksearch(searchString)
	}

	/**
	 * create a custom searchRequest.
	 * Can not be chained
	 * @param {SearchRequest} searchParam
	 */
	custom(searchParam: SearchRequest): void {
		this._searchRequest = searchParam
	}

	existsQuery = this.add(existsQuery)
	idsQuery = this.add(idsQuery)
	quicksearch = this.add(quicksearch)
	tenantQuery = this.add(tenantQuery)
	termQuery = this.add(termQuery)
	termsQuery = this.add(termsQuery)
	termsQueryOptions = this.add(termsQueryOptions)
	typeQuery = this.add(typeQuery)
	typeQueryWithSubType = this.add(typeQueryWithSubType)
	rangeQuery = this.add(rangeQuery)
	regexpQuery = this.add(regexpQuery)
	wildcardQuery = this.add(wildcardQuery)

	/**
	 *
	 * @param {Query} query
	 * @return {this}
	 */
	addQuery(query: Query): this {
		if (this._searchRequest.query && this._searchRequest.query.$type === 'BoolQuery') {
			const currentQuery = this._searchRequest.query as BoolQuery
			if (currentQuery.mustClauses) {
				currentQuery.mustClauses.push(query)
			} else if (currentQuery.shouldClauses) {
				currentQuery.shouldClauses.push(query)
			} else if (currentQuery.mustNotClauses) {
				currentQuery.mustNotClauses.push(query)
			} else {
				throw new Error('unsupported BoolQuery')
			}
		} else {
			this._searchRequest.query = query
		}

		return this
	}

	/**
	 * function to an order on a field
	 * @param {string} field
	 * @param {Sort.OrderEnum} order
	 * @return {this}
	 */
	addOrderOn(field: string, order: Sort.OrderEnum) {
		this._searchRequest.sorts = this._searchRequest.sorts || []
		this._searchRequest.sorts.push({
			field,
			order,
		})
		return this
	}

	/**
	 * Short hand to field oder in chain configuration.
	 * Has to be follow by ASC, DESC or NONE
	 * @param {string} field field to search on.
	 * @return {OrderRequest}
	 */
	order(field: string): OrderRequest {
		return new OrderRequest(this, field)
	}
}
export class OrderRequest {
	request: SearchQuery
	field: string
	constructor(request: SearchQuery, field: string) {
		this.request = request
		this.field = field
	}
	get ASC(): SearchQuery {
		return this.request.addOrderOn(this.field, 'ASC')
	}
	get DESC(): SearchQuery {
		return this.request.addOrderOn(this.field, 'DESC')
	}
	get NONE(): SearchQuery {
		return this.request.addOrderOn(this.field, 'NONE')
	}
}
