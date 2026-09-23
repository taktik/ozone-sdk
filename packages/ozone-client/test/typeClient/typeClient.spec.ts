import { assert, expect } from 'chai'
import { FieldDescriptor } from '@taktik/ozone-type'
import { fakeServer, FakeServer, FakeXMLHttpRequest } from 'nise'
import { OzoneClient } from './../../src/index'
import { Response } from 'typescript-http-client'

describe('OzoneClient', () => {
	const wait = (timeMs: number) => new Promise((resolve) => setTimeout(resolve, timeMs))
	let client: OzoneClient.OzoneClient
	let server: FakeServer
	const responseHeaders = { json: { 'Content-Type': 'application/json' } }
	const fields: FieldDescriptor[] = [{ identifier: 'aFiled', fieldType: 'aType' }]
	const type = { fields: fields }

	beforeAll(() => {
		const credentials = new OzoneClient.UserCredentials('ozoneUser', 'ozonePassword')
		const config: OzoneClient.ClientConfiguration = {
			ozoneURL: `http://my.ozone.domain/ozone`,
			ozoneCredentials: credentials,
		}
		client = OzoneClient.newOzoneClient(config)
	})
	afterAll(() => {
		server.restore()
	})
	describe('findByIdentifier', () => {
		beforeAll(() => {
			// for test, its not mandatory to start the client
			// return client.start()
			server = fakeServer.create()
			server.respondWith('GET', 'http://my.ozone.domain/ozone/rest/v3/type/item', [
				200,
				responseHeaders.json,
				JSON.stringify(type),
			])
			server.respondWith('GET', 'http://my.ozone.domain/ozone/rest/v3/type/item-unknown', [
				404,
				responseHeaders.json,
				JSON.stringify(type),
			])
			server.respondWith('GET', 'http://my.ozone.domain/ozone/rest/v3/type/item-error', [
				500,
				responseHeaders.json,
				JSON.stringify(type),
			])
		})
		it('should resolve with item typeDescriptor', async () => {
			const typeClient = client.typeClient()
			const resp = typeClient.findByIdentifier('item')
			server.respond()
			const typeDescriptor = await resp
			expect(typeDescriptor).to.deep.equal(type)
		})
		it('should resolve with null on 404', async () => {
			const typeClient = client.typeClient()
			const resp = typeClient.findByIdentifier('item-unknown')
			server.respond()
			const typeDescriptor = await resp
			assert.isNull(typeDescriptor)
		})
		it('should reject with response on error 500', async () => {
			const typeClient = client.typeClient()
			const resp = typeClient.findByIdentifier('item-error')
			server.respond()
			try {
				const _typeDescriptor = await resp
				assert.isTrue(false, 'previous line should throw an error')
			} catch (response) {
				assert.instanceOf(response, Response)
				assert.equal((response as Response<unknown>).status, 500)
			}
		})
	})

	describe('save', () => {
		beforeAll(() => {
			// for test, its not mandatory to start the client
			// return client.start()
			server = fakeServer.create()
			server.respondWith('POST', 'http://my.ozone.domain/ozone/rest/v3/type', [
				200,
				responseHeaders.json,
				JSON.stringify({ identifier: 'newType', fields: fields }),
			])
		})
		it('should resolve with newType typeDescriptor', async () => {
			const typeClient = client.typeClient()
			const resp = typeClient.save({ identifier: 'newType', fields: fields })
			server.respond()
			const typeDescriptor = await resp
			expect(typeDescriptor).to.deep.equal({ identifier: 'newType', fields: fields })
		})
	})
	describe('findAll', () => {
		beforeAll(() => {
			// for test, its not mandatory to start the client
			// return client.start()
			server = fakeServer.create()
			server.respondWith('GET', 'http://my.ozone.domain/ozone/rest/v3/type', [
				200,
				responseHeaders.json,
				JSON.stringify([
					{ identifier: 'type1', fields: fields },
					{ identifier: 'type2', fields: fields },
				]),
			])
		})
		it('should resolve with an array of typeDescriptor', async () => {
			const typeClient = client.typeClient()
			const resp = typeClient.findAll()
			server.respond()
			const typeDescriptor = await resp
			expect(typeDescriptor).to.deep.equal([
				{ identifier: 'type1', fields: fields },
				{ identifier: 'type2', fields: fields },
			])
		})
	})
	describe('delete', () => {
		beforeAll(() => {
			// for test, its not mandatory to start the client
			// return client.start()
			server = fakeServer.create()
			server.respondWith('DELETE', 'http://my.ozone.domain/ozone/rest/v3/type/typeToDelete', [
				200,
				responseHeaders.json,
				'id',
			])
			server.respondWith('DELETE', 'http://my.ozone.domain/ozone/rest/v3/type/item-unknown', [
				404,
				responseHeaders.json,
				'id',
			])
		})
		it('should resolve with newType typeDescriptor', async () => {
			const typeClient = client.typeClient()
			const resp = typeClient.delete('typeToDelete')
			server.respond()
			const data = await resp
			expect(data).to.deep.equal(null)
		})

		it('should resolve with null on 404', async () => {
			const typeClient = client.typeClient()
			const resp = typeClient.delete('item-unknown')
			server.respond()
			const typeDescriptor = await resp
			assert.isNull(typeDescriptor)
		})
	})

	describe('getTypeCache', () => {
		describe('cache management', () => {
			let serverResponseCount: number
			beforeAll(() => {
				const fields1: FieldDescriptor[] = [{ identifier: 'aFiled', fieldType: 'aType' }]
				const fields2: FieldDescriptor[] = [{ identifier: 'bFiled', fieldType: 'bType' }]
				serverResponseCount = 0
				// for test, its not mandatory to start the client
				// return client.start()
				server = fakeServer.create()
				server.respondWith(
					'GET',
					/my.ozone.domain\/ozone\/rest\/v3\/type/,
					(xhr: FakeXMLHttpRequest) => {
						serverResponseCount++
						xhr.respond(
							200,
							responseHeaders.json,
							JSON.stringify([
								{ identifier: 'itemAllFields', superType: 'itemParent', fields: fields1 },
								{ identifier: 'itemParent', fields: fields2 },
							]),
						)
					},
				)
			})
			it('should request server information only once', async () => {
				const typeClient = client.typeClient()
				const first = typeClient.getTypeCache()
				const second = typeClient.getTypeCache()
				await wait(0)
				server.respond()
				expect(await first).to.equal(await second, 'both calls should share one cache')
				expect(serverResponseCount).to.be.equal(1, 'the server should be asked only once')
			})
		})

		describe('getAllFields', () => {
			const fields1: FieldDescriptor[] = [{ identifier: 'aFiled', fieldType: 'aType' }]
			const fields2: FieldDescriptor[] = [{ identifier: 'bFiled', fieldType: 'bType' }]

			beforeAll(() => {
				// for test, its not mandatory to start the client
				// return client.start()
				server = fakeServer.create()
				server.respondWith('GET', 'http://my.ozone.domain/ozone/rest/v3/type', [
					200,
					responseHeaders.json,
					JSON.stringify([
						{ identifier: 'itemAllFields', superType: 'itemParent', fields: fields1 },
						{ identifier: 'itemParent', fields: fields2 },
					]),
				])
			})
			it('should resolve with item fieldDescriptor', async () => {
				const typeClient = client.typeClient()
				const typeCachePromise = typeClient.getTypeCache()
				await wait(0)
				server.respond()
				const typeCache = await typeCachePromise
				const allFields = typeCache.getAllFields('itemAllFields')
				expect(allFields).to.deep.equal([...fields1, ...fields2])
			})
		})

		describe('isTypeInstanceOf', () => {
			beforeAll(() => {
				// for test, its not mandatory to start the client
				// return client.start()
				server = fakeServer.create()
				server.respondWith('GET', 'http://my.ozone.domain/ozone/rest/v3/type', [
					200,
					responseHeaders.json,
					JSON.stringify([
						{ identifier: 'itemInstance', superType: 'itemParent', fields: fields },
						{ identifier: 'itemParent', fields: fields },
					]),
				])
			})
			it('should resolve with true when itemInstance is an instance of itemParent', async () => {
				const typeClientCache = await client.typeClient().getTypeCache()
				const typeCachePromise = typeClientCache.refresh()
				await wait(0)
				server.respond()
				const typeCache = await typeCachePromise
				const isTypeInstanceOf = typeCache.isTypeInstanceOf('itemInstance', 'itemParent')
				assert.isTrue(isTypeInstanceOf)
			})
			it('should resolve with false when itemInstance is not an instance of itemAllFields', async () => {
				const typeClient = client.typeClient()
				const typeCachePromise = typeClient.getTypeCache()
				await wait(0)
				server.respond()
				const typeCache = await typeCachePromise
				const isTypeInstanceOf = typeCache.isTypeInstanceOf('itemInstance', 'itemAllFields')
				assert.isFalse(isTypeInstanceOf)
			})
		})

		describe('refreshCache', () => {
			const fields1: FieldDescriptor[] = [{ identifier: 'aFiled', fieldType: 'aType' }]
			const fields2: FieldDescriptor[] = [{ identifier: 'bFiled', fieldType: 'bType' }]

			const fields1AfterRefresh: FieldDescriptor[] = [
				{ identifier: 'aFiledAfterRefresh', fieldType: 'aTypeAfterRefresh' },
			]
			const fields2AfterRefresh: FieldDescriptor[] = [
				{ identifier: 'bFiledAfterRefresh', fieldType: 'bTypeAfterRefresh' },
			]

			beforeAll(() => {
				// for test, its not mandatory to start the client
				// return client.start()
				server = fakeServer.create()
				server.respondWith('GET', 'http://my.ozone.domain/ozone/rest/v3/type', [
					200,
					responseHeaders.json,
					JSON.stringify([
						{ identifier: 'itemAllFields', superType: 'itemParent', fields: fields1 },
						{ identifier: 'itemParent', fields: fields2 },
					]),
				])
			})
			it('should resolve with item fieldDescriptor', async () => {
				const typeClientCache = await client.typeClient().getTypeCache()
				const typeCachePromise = typeClientCache.refresh()
				await wait(0)
				server.respond()
				const typeCache = await typeCachePromise
				const allFields = typeCache.getAllFields('itemAllFields')
				expect(allFields).to.deep.equal([...fields1, ...fields2])
				server.respondWith('GET', 'http://my.ozone.domain/ozone/rest/v3/type', [
					200,
					responseHeaders.json,
					JSON.stringify([
						{ identifier: 'itemAllFields', superType: 'itemParent', fields: fields1AfterRefresh },
						{ identifier: 'itemParent', fields: fields2AfterRefresh },
					]),
				])
				const typeCacheRefreshPromise = typeCache.refresh()
				await wait(0)
				server.respond()
				const refreshedTypeCache = await typeCacheRefreshPromise
				const refreshedFields = refreshedTypeCache.getAllFields('itemAllFields')
				expect(refreshedFields).to.deep.equal([...fields1AfterRefresh, ...fields2AfterRefresh])
			})
		})
	})
})
