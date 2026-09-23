import { expect } from 'chai'
import { SearchQuery } from '../../src/search/searchQuery'

describe('ozone-search-helper', function () {
	it('SearchQuery is exposed as a global class', function () {
		const mySearchQuery = new SearchQuery()
		expect(mySearchQuery).to.be.an.instanceof(SearchQuery)
	})

	it('SearchGenerator quicksearch', function () {
		const searchQuery = new SearchQuery()
		searchQuery.quicksearch('search value')
		expect(JSON.parse(searchQuery.searchQuery)).to.be.deep.equal({
			size: 10,
			query: {
				$type: 'QueryStringQuery',
				field: '_quicksearch',
				queryString: 'search value*',
			},
		})
	})

	it('SearchGenerator suggestion', function () {
		const searchQuery = new SearchQuery()
		searchQuery.suggestion('search value', 'new')
		expect(JSON.parse(searchQuery.searchQuery)).to.be.deep.equal({
			size: 10,
			query: {
				$type: 'QueryStringQuery',
				field: '_quicksearch',
				queryString: 'search value*',
			},
			aggregations: [
				{
					$type: 'TermsAggregation',
					name: 'suggest',
					field: '_quicksearch',
					order: 'COUNT_DESC',
					size: 10,
					includePattern: 'new.*',
				},
			],
		})
	})

	it('SearchGenerator tenant', function () {
		const searchQuery = new SearchQuery()
		searchQuery.tenantQuery('OWN_AND_PARENTS', 'my_tenantId')
		expect(JSON.parse(searchQuery.searchQuery)).to.be.deep.equal({
			size: 10,
			query: {
				$type: 'TenantQuery',
				mode: 'OWN_AND_PARENTS',
				tenantId: 'my_tenantId',
			},
		})
	})

	it('SearchGenerator custom', () => {
		const searchQuery = new SearchQuery()
		searchQuery.custom({ size: 8 })
		expect(JSON.parse(searchQuery.searchQuery)).to.be.deep.equal({ size: 8 })
	})

	it('SearchGenerator termQuery', () => {
		const searchQuery = new SearchQuery()
		searchQuery.termQuery('myField', 'aText')
		expect(JSON.parse(searchQuery.searchQuery)).to.be.deep.equal({
			size: 10,
			query: {
				$type: 'TermQuery',
				field: 'myField',
				value: 'aText',
				ignoreCase: false,
			},
		})
	})
	it('SearchGenerator typeQuery', () => {
		const searchQuery = new SearchQuery()
		searchQuery.typeQuery(...['type1', 'type2'])
		expect(JSON.parse(searchQuery.searchQuery)).to.be.deep.equal({
			size: 10,
			query: {
				$type: 'TypeQuery',
				typeIdentifiers: ['type1', 'type2'],
				includeSubTypes: false,
			},
		})
	})
	it('SearchGenerator typeQueryWithSubType', () => {
		const searchQuery = new SearchQuery()
		searchQuery.typeQueryWithSubType(...['type1', 'type2'])
		expect(JSON.parse(searchQuery.searchQuery)).to.be.deep.equal({
			size: 10,
			query: {
				$type: 'TypeQuery',
				typeIdentifiers: ['type1', 'type2'],
				includeSubTypes: true,
			},
		})
	})

	describe('SearchGenerator should combine queries', () => {
		it('typeQuery and TermQuery', () => {
			const searchQuery = new SearchQuery()
			searchQuery.typeQuery('aType').and.quicksearch('hello')

			expect(JSON.parse(searchQuery.searchQuery)).to.be.deep.equal({
				size: 10,
				query: {
					$type: 'BoolQuery',
					mustClauses: [
						{
							$type: 'TypeQuery',
							typeIdentifiers: ['aType'],
							includeSubTypes: false,
						},
						{
							$type: 'QueryStringQuery',
							field: '_quicksearch',
							queryString: 'hello*',
						},
					],
				},
			})
		})

		it('TypeQuery or quicksearch', () => {
			const searchQuery = new SearchQuery()
			searchQuery.typeQuery('aType').or.quicksearch('hello')

			expect(JSON.parse(searchQuery.searchQuery)).to.be.deep.equal({
				size: 10,
				query: {
					$type: 'BoolQuery',
					shouldClauses: [
						{
							$type: 'TypeQuery',
							typeIdentifiers: ['aType'],
							includeSubTypes: false,
						},
						{
							$type: 'QueryStringQuery',
							field: '_quicksearch',
							queryString: 'hello*',
						},
					],
				},
			})
		})

		it('(typeQuery or quicksearch) and termQuery', () => {
			const searchQuery = new SearchQuery()
			searchQuery.typeQuery('aType').or.quicksearch('hello').and.termQuery('myField', 'aText')

			expect(JSON.parse(searchQuery.searchQuery)).to.be.deep.equal({
				size: 10,
				query: {
					$type: 'BoolQuery',
					mustClauses: [
						{
							$type: 'BoolQuery',
							shouldClauses: [
								{
									$type: 'TypeQuery',
									typeIdentifiers: ['aType'],
									includeSubTypes: false,
								},
								{
									$type: 'QueryStringQuery',
									field: '_quicksearch',
									queryString: 'hello*',
								},
							],
						},
						{
							$type: 'TermQuery',
							field: 'myField',
							value: 'aText',
							ignoreCase: false,
						},
					],
				},
			})
		})

		it('(typeQuery or quicksearch or termQuery)', () => {
			const searchQuery = new SearchQuery()
			searchQuery.typeQuery('aType').or.quicksearch('hello').termQuery('myField', 'aText')

			expect(JSON.parse(searchQuery.searchQuery)).to.be.deep.equal({
				size: 10,
				query: {
					$type: 'BoolQuery',
					shouldClauses: [
						{
							$type: 'TypeQuery',
							typeIdentifiers: ['aType'],
							includeSubTypes: false,
						},
						{
							$type: 'QueryStringQuery',
							field: '_quicksearch',
							queryString: 'hello*',
						},
						{
							$type: 'TermQuery',
							field: 'myField',
							value: 'aText',
							ignoreCase: false,
						},
					],
				},
			})
		})
	})
	describe('should order', () => {
		it('search and order ascending', () => {
			const searchQuery = new SearchQuery()
			searchQuery.termQuery('myField', 'aText').order('aField').ASC
			expect(JSON.parse(searchQuery.searchQuery)).to.be.deep.equal({
				size: 10,
				query: {
					$type: 'TermQuery',
					field: 'myField',
					value: 'aText',
					ignoreCase: false,
				},
				sorts: [
					{
						field: 'aField',
						order: 'ASC',
					},
				],
			})
		})
		it('order ascending and search', () => {
			const searchQuery = new SearchQuery()
			searchQuery.order('aField').ASC.termQuery('myField', 'aText', true)
			expect(JSON.parse(searchQuery.searchQuery)).to.be.deep.equal({
				size: 10,
				query: {
					$type: 'TermQuery',
					field: 'myField',
					value: 'aText',
					ignoreCase: true,
				},
				sorts: [
					{
						field: 'aField',
						order: 'ASC',
					},
				],
			})
		})
		it('order descending', () => {
			const searchQuery = new SearchQuery()
			searchQuery.order('aField').DESC.termQuery('myField', 'aText')
			expect(JSON.parse(searchQuery.searchQuery)).to.be.deep.equal({
				size: 10,
				query: {
					$type: 'TermQuery',
					field: 'myField',
					value: 'aText',
					ignoreCase: false,
				},
				sorts: [
					{
						field: 'aField',
						order: 'DESC',
					},
				],
			})
		})
		it('compose order', () => {
			const searchQuery = new SearchQuery()
			searchQuery
				.order('aField')
				.ASC.termQuery('myField', 'aText')
				.order('bField')
				.DESC.order('cField').NONE
			expect(JSON.parse(searchQuery.searchQuery)).to.be.deep.equal({
				size: 10,
				query: {
					$type: 'TermQuery',
					field: 'myField',
					value: 'aText',
					ignoreCase: false,
				},
				sorts: [
					{
						field: 'aField',
						order: 'ASC',
					},
					{
						field: 'bField',
						order: 'DESC',
					},
					{
						field: 'cField',
						order: 'NONE',
					},
				],
			})
		})
	})
	describe('combineWith order', () => {
		it('shoud combine two query', () => {
			const searchQuery = new SearchQuery()
			const searchQueryToCombine = new SearchQuery()

			searchQuery.termQuery('myField', 'aText').addOrderOn('aField', 'ASC')
			searchQueryToCombine.termQuery('otherField', 'aValue')
			searchQuery.or.combineWith(searchQueryToCombine)

			expect(JSON.parse(searchQuery.searchQuery)).to.be.deep.equal({
				size: 10,
				query: {
					$type: 'BoolQuery',
					shouldClauses: [
						{
							$type: 'TermQuery',
							field: 'myField',
							value: 'aText',
							ignoreCase: false,
						},
						{
							$type: 'TermQuery',
							field: 'otherField',
							value: 'aValue',
							ignoreCase: false,
						},
					],
				},
				sorts: [
					{
						field: 'aField',
						order: 'ASC',
					},
				],
			})
		})

		it('shoud combine two BoolQuery query', () => {
			const searchQuery = new SearchQuery()
			const searchQueryToCombine = new SearchQuery()
			searchQuery.termQuery('myField', 'aText').addOrderOn('aField', 'ASC')
			searchQueryToCombine.not.termQuery('otherField', 'aValue')
			searchQuery.and.combineWith(searchQueryToCombine)

			expect(JSON.parse(searchQuery.searchQuery)).to.be.deep.equal({
				size: 10,
				query: {
					$type: 'BoolQuery',
					mustClauses: [
						{
							$type: 'TermQuery',
							field: 'myField',
							value: 'aText',
							ignoreCase: false,
						},
						{
							$type: 'BoolQuery',
							mustNotClauses: [
								{
									$type: 'TermQuery',
									field: 'otherField',
									value: 'aValue',
									ignoreCase: false,
								},
							],
						},
					],
				},
				sorts: [
					{
						field: 'aField',
						order: 'ASC',
					},
				],
			})
		})
	})
	describe('rangeQuery', () => {
		it('should create a range query', () => {
			const searchQuery = new SearchQuery()
			searchQuery.rangeQuery('aField', { from: 1, to: 2 })
			expect(JSON.parse(searchQuery.searchQuery)).to.be.deep.equal({
				size: 10,
				query: {
					$type: 'RangeQuery',
					field: 'aField',
					from: 1,
					to: 2,
				},
			})
		})
	})
	describe('regexpQuery', () => {
		it('should create a RegexpQuery', () => {
			const searchQuery = new SearchQuery()
			searchQuery.regexpQuery('aField', 'match.*', true)

			expect(JSON.parse(searchQuery.searchQuery)).to.be.deep.equal({
				size: 10,
				query: {
					$type: 'RegexpQuery',
					field: 'aField',
					ignoreCase: true,
					regexp: 'match.*',
				},
			})
		})
	})
	describe('wildcardQuery', () => {
		it('should create a WildcardQuery', () => {
			const searchQuery = new SearchQuery()
			searchQuery.wildcardQuery('aField', 'match')

			expect(JSON.parse(searchQuery.searchQuery)).to.be.deep.equal({
				size: 10,
				query: {
					$type: 'WildcardQuery',
					field: 'aField',
					wildcard: 'match',
				},
			})
		})
	})
})
