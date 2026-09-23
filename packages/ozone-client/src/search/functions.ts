import {
	BoolQuery,
	ExistsQuery,
	IdsQuery,
	ModeType,
	Query,
	QueryStringQuery,
	RangeQuery,
	RegexpQuery,
	TenantQuery,
	TermQuery,
	TermsQuery,
	TypeQuery,
	UUID,
	WildcardQuery
} from '@taktik/ozone-type'
import { BasicOzoneType } from './types'

abstract class OzoneQueryBuilder<T extends Query> {
	abstract done(): T
}

type BuilderOrQuery<T extends Query> = OzoneQueryBuilder<T> | T

class BoolQueryBuilder extends OzoneQueryBuilder<BoolQuery> {
	private _or: BuilderOrQuery<Query>[] = []
	private _and: BuilderOrQuery<Query>[] = []
	private _not: BuilderOrQuery<Query>[] = []

	minimumShouldMatch = 1

	setMinimumShouldMatch(value: number): this {
		this.minimumShouldMatch = value
		return this
	}

	or(queries: BuilderOrQuery<Query>[]): this {
		this._or.push(...queries)
		return this
	}

	and(queries: BuilderOrQuery<Query>[]): this {
		this._and.push(...queries)
		return this
	}

	not(queries: BuilderOrQuery<Query>[]): this {
		this._not.push(...queries)
		return this
	}

	done(): BoolQuery {
		return {
			$type: 'BoolQuery',
			shouldClauses: this._or.map(query => query instanceof OzoneQueryBuilder ? query.done() : query),
			mustClauses: this._and.map(query => query instanceof OzoneQueryBuilder ? query.done() : query),
			mustNotClauses: this._not.map(query => query instanceof OzoneQueryBuilder ? query.done() : query),
			minimumShouldMatch: this.minimumShouldMatch
		}
	}
}

function boolQuery(): BoolQueryBuilder {
	return new BoolQueryBuilder()
}

function existsQuery(field: string): ExistsQuery {
	return { '$type': 'ExistsQuery', field }
}

/**
 * search array of ids
 * @param {string} ids
 * @return {IdsQuery}
 */
function idsQuery(ids: Array<string>): IdsQuery {
	return { '$type': 'IdsQuery', ids }
}

/**
 * ozone QueryStringQuery
 * @param {string} searchString string to search
 */
function quicksearch(searchString: string): QueryStringQuery {
	return {
		'$type': 'QueryStringQuery',
		field: '_quicksearch',
		queryString: `${searchString}*`
	}
}

/**
 * Search in a range of value
 * @param field
 * @param param {from?: any, to?: any}
 */
function rangeQuery(field: string, param: {from?: any, to?: any, lowerIncluded?: boolean, upperIncluded?: boolean}): RangeQuery {
	return {
		'$type': 'RangeQuery',
		field,
		...param
	}
}

/**
 * Search with a regular expression
 * @param field
 * @param regexp
 * @param ignoreCase
 */
function regexpQuery(field: string, regexp: string, ignoreCase: boolean = false): RegexpQuery {
	return {
		'$type': 'RegexpQuery',
		field,
		regexp,
		ignoreCase
	}
}

/**
 * Search inside a tenant
 * @param {ModeType} mode
 * @param {string} tenantId
 * @return {TenantQuery}
 */
function tenantQuery(mode: ModeType, tenantId: UUID): TenantQuery {
	return { $type: 'TenantQuery', tenantId, mode }
}

/**
 * Search for a term in a field
 * @param {string} field
 * @param {BasicOzoneType} value
 * @param {boolean} ignoreCase
 * @return {TermQuery}
 */
function termQuery(field: string, value: BasicOzoneType, ignoreCase = false): TermQuery {
	return { $type: 'TermQuery', field, value, ignoreCase }
}

/**
 * Search for a list of terms in a field
 * @param {string} field
 * @param {BasicOzoneType[]} values
 * @param {boolean} ignoreCase
 * @return {TermQuery}
 */
function termsQuery(field: string, ...values: Array<BasicOzoneType>): TermsQuery {
	return { $type: 'TermsQuery', field, values }
}

/**
 * Search for a list of terms in a field, with options
 * @param {string} field
 * @param {BasicOzoneType[]} values
 * @param {boolean} ignoreCase
 * @return {TermQuery}
 */
function termsQueryOptions(field: string, values: Array<BasicOzoneType>, options: {ignoreCase?: boolean, exactMatch?: boolean} = {}): TermsQuery {
	return {
		'$type': 'TermsQuery',
		field,
		values,
		...options
	}
}

/**
 * Search inside a type
 * @param {boolean} includeSubTypes
 * @param {string} typeIdentifiers
 * @return {TypeQuery}
 */
function genericTypeQuery(includeSubTypes: boolean, ...typeIdentifiers: Array<string>): TypeQuery {
	return {
		'$type': 'TypeQuery',
		typeIdentifiers: typeIdentifiers,
		includeSubTypes: includeSubTypes
	}
}

/**
 * Search inside a type.
 * Not in subtype
 * @param {string} typeIdentifiers
 * @return {TypeQuery}
 */
function typeQuery(...typeIdentifiers: string[]): TypeQuery {
	return genericTypeQuery(false, ...typeIdentifiers)
}

/**
 * Search inside a type and its subtype(s)
 * @param {string} typeIdentifiers
 * @return {TypeQuery}
 */
function typeQueryWithSubType(...typeIdentifiers: string[]): TypeQuery {
	return genericTypeQuery(true, ...typeIdentifiers)
}

/**
 * Matches documents that have fields matching a wildcard expression (not analyzed).
 * Supported wildcards are *, which matches any character sequence (including the empty one), and ?,
 * which matches any single character. Note that this query can be slow, as it needs to iterate over many terms.
 * In order to prevent extremely slow wildcard queries,
 * a wildcard term should not start with one of the wildcards * or ?.
 * The wildcard query maps to Lucene WildcardQuery.
 * @param field
 * @param wildcard
 * @param ignoreCase
 * @param analyzed
 */
function wildcardQuery(field: string, wildcard: string, ignoreCase?: boolean, analyzed?: boolean): WildcardQuery {
	return {
		$type: 'WildcardQuery',
		field,
		wildcard,
		ignoreCase,
		analyzed
	}
}

export {
	boolQuery,
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
	wildcardQuery
}
