import { expect } from 'chai'
import sinon from 'sinon'
import { fakeServer, FakeServer, FakeXMLHttpRequest } from 'nise'
import { SearchQuery } from '../../src/search'
import { OzoneClient } from './../../src/index'

describe('OzoneClient', () => {
	let client: OzoneClient.OzoneClient
	let server: FakeServer

	beforeAll(() => {
		const credentials = new OzoneClient.UserCredentials('ozoneUser', 'ozonePassword')
		const config: OzoneClient.ClientConfiguration = {
			ozoneURL: `http://my.ozone.domain/ozone`,
			ozoneCredentials: credentials
		}
		client = OzoneClient.newOzoneClient(config)
	})
	afterAll(() => {
		server.restore()
	})
	describe('itemClient', () => {
		describe('searchGenerator', () => {
			const collectionResult = [
				{ results: [{ item: 1 }, { item: 2 }], total: 6 , size: 2 },
				{ results: [{ item: 3 }, { item: 4 }], total: 6 , size: 2 },
				{ results: [{ item: 5 }, { item: 6 }], total: 6 , size: 2 }
			]
			beforeAll(() => {
				// for test, its not mandatory to start the client
				// return client.start()
				server = fakeServer.create()
				server.respondWith(
					'POST',
					'http://my.ozone.domain/ozone/rest/v3/items/item/search',
					xhr => {
						xhr.respond(200, { 'Content-Type': 'application/json' }, JSON.stringify({ results: [{ item: 1 }], total: 1 , size: 1 }))
					})

				server.respondWith(
					'POST',
					'http://my.ozone.domain/ozone/rest/v3/items/collection/search',
					xhr => {
						const request = JSON.parse(xhr.requestBody)
						const index = ((request.offset || 0) / request.size) >> 0 // integer division
						xhr.respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(collectionResult[index]))
					})
			})
			it('should return a generator', async () => {
				const itemApi = client.itemClient('item')
				const searchQuery = new SearchQuery()
				searchQuery.termQuery('foo', 'bar')
				const searchGen: any = itemApi.searchGenerator(searchQuery.searchRequest)
				const res1Promise = searchGen.next()
				server.respond()
				const res1 = await res1Promise
				expect(res1.value).to.deep.equal({ results: [{ item: 1 }], total: 1 , size: 1 })
				const res2 = await searchGen.next()
				expect(res2.done).to.equal(true)
			})
			it('should iterate on all the results', async () => {
				const itemApi = client.itemClient('collection')
				const searchQuery = new SearchQuery()
				searchQuery.termQuery('foo', 'bar').setSize(2)
				server.autoRespond = true
				let expectedResponseIndex = 0

				for await (const result of itemApi.searchGenerator(searchQuery.searchRequest)) {
					expect(result).to.deep.equal(collectionResult[expectedResponseIndex++])
				}
				expect(expectedResponseIndex).to.equal(3)
			})
			it('should go to given offset', async () => {
				const itemApi = client.itemClient('collection')
				const searchQuery = new SearchQuery()
				const pageSize = 2
				searchQuery.termQuery('foo', 'bar').setSize(pageSize)

				const searchGen: any = itemApi.searchGenerator(searchQuery.searchRequest)
				const res1Promise = searchGen.next()
				server.respond()
				const res1 = await res1Promise
				expect(res1.value).to.deep.equal({ results: [{ item: 1 }, { item: 2 }], total: 6 , size: 2 }, 'load 1st chuck of results')
				const lastOffset = res1.value.total - pageSize
				expect(lastOffset).to.equal(4)

				const res2Promise = searchGen.next(lastOffset)
				server.respond()
				const res2 = await res2Promise
				expect(res2.value).to.deep.equal({ results: [{ item: 5 }, { item: 6 }], total: 6 , size: 2 }, 'load last chuck of results')

				const res3Promise = searchGen.next(2)
				server.respond()
				const res3 = await res3Promise
				expect(res3.value).to.deep.equal({ results: [{ item: 3 }, { item: 4 }], total: 6 , size: 2 }, 'come back to the 2nd chuck of results')

				const res4Promise = searchGen.next()
				server.respond()
				const res4 = await res4Promise
				expect(res4.value).to.deep.equal({ results: [{ item: 5 }, { item: 6 }], total: 6 , size: 2 }, 'load next (last) chuck of results')

				const res5Promise = searchGen.next(0)
				server.respond()
				const res5 = await res5Promise
				expect(res5.value).to.deep.equal({ results: [{ item: 1 }, { item: 2 }], total: 6 , size: 2 }, 'come back to the 1st chuck of results')
			})

			it('cancel should cancel ongoing request and finish iterator', async () => {
				const itemApi = client.itemClient('item')
				const searchQuery = new SearchQuery()
				searchQuery.termQuery('foo', 'bar')
				const searchGen: any = itemApi.searchGenerator(searchQuery.searchRequest)
				const res1Promise = searchGen.next()
				searchGen.cancel()
				const res1 = await res1Promise
				expect(res1.done).to.equal(true)
			})
		})
	})
})
