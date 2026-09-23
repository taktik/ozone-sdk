import { assert } from 'chai'
import { fakeServer, FakeServer } from 'nise'
import { OzoneClient } from '../../src/index'

describe('OzoneClient', () => {
	let client: OzoneClient.OzoneClient
	let server: FakeServer

	beforeAll(() => {
		server = fakeServer.create()
		const credentials = new OzoneClient.UserCredentials('ozoneUser', 'ozonePassword')
		const config: OzoneClient.ClientConfiguration = {
			ozoneURL: `http://my.ozone.domain/ozone`,
			ozoneCredentials: credentials,
		}
		client = OzoneClient.newOzoneClient(config)
		// for test, its not mandatory to start the client
		// return client.start()
	})

	afterAll(() => {
		server.restore()
	})
	describe('RoleClient', () => {
		describe('getAll', () => {
			it('shoud send GET request on role', async () => {
				server.respondWith('GET', 'http://my.ozone.domain/ozone/rest/v3/role', [
					200,
					{ 'Content-Type': 'application/json' },
					'[ {"id": "a", "name": "role1"}, {"id": "b", "name": "role2"}]',
				])
				const api = client.roleClient()
				const resp = api.getAll()
				server.respond()
				const data = await resp
				assert.deepEqual(data, [{ id: 'a', name: 'role1' }, { id: 'b', name: 'role2' } as any])
			})
		})
		describe('save', () => {
			it('shoud send POST request on role', async () => {
				server.respondWith('POST', 'http://my.ozone.domain/ozone/rest/v3/role', [
					200,
					{ 'Content-Type': 'application/json' },
					'{"id": "a", "name": "role1"}',
				])
				const api = client.roleClient()
				const resp = api.save({ name: 'role1' })
				server.respond()
				const data = await resp
				assert.deepEqual(data, { id: 'a', name: 'role1' })
			})
		})
		describe('getByName', () => {
			it('shoud send GET request on role/name/{name}', async () => {
				server.respondWith('GET', 'http://my.ozone.domain/ozone/rest/v3/role/name/role1', [
					200,
					{ 'Content-Type': 'application/json' },
					'{"id": "a", "name": "role1"}',
				])
				const api = client.roleClient()
				const resp = api.getByName('role1')
				server.respond()
				const data = await resp
				assert.deepEqual(data, { id: 'a', name: 'role1' })
			})
			it('shoud resolve with null on 404', async () => {
				server.respondWith('GET', 'http://my.ozone.domain/ozone/rest/v3/role/name/role2', [
					404,
					{ 'Content-Type': 'application/json' },
					'{"id": "a", "name": "role1"}',
				])
				const api = client.roleClient()
				const resp = api.getByName('role2')
				server.respond()
				const data = await resp
				assert.isNull(data)
			})
		})
		describe('getPermission', () => {
			it('shoud send POST request on role/permissions', async () => {
				server.respondWith('POST', 'http://my.ozone.domain/ozone/rest/v3/role/permissions', [
					200,
					{ 'Content-Type': 'application/json' },
					'[{"id": "a", "grants": "AUTHENTICATE"}]',
				])
				const api = client.roleClient()
				const resp = api.getPermissions(['role1'])
				server.respond()
				const data = await resp
				assert.deepEqual(data, [{ id: 'a', grants: 'AUTHENTICATE' }] as any)
			})
		})

		describe('getById', () => {
			it('shoud send GET request on role/{id}', async () => {
				server.respondWith('GET', 'http://my.ozone.domain/ozone/rest/v3/role/an_id1', [
					200,
					{ 'Content-Type': 'application/json' },
					'{"id": "an_id1", "name": "role1"}',
				])
				const api = client.roleClient()
				const resp = api.getById('an_id1')
				server.respond()
				const data = await resp
				assert.deepEqual(data, { id: 'an_id1', name: 'role1' })
			})
			it('shoud resolve with null on 404', async () => {
				server.respondWith('GET', 'http://my.ozone.domain/ozone/rest/v3/role/an_id1', [
					404,
					{ 'Content-Type': 'application/json' },
					'{"id": "an_id1", "name": "role1"}',
				])
				const api = client.roleClient()
				const resp = api.getById('an_id1')
				server.respond()
				const data = await resp
				assert.isNull(data)
			})
		})
		describe('deleteById', () => {
			it('shoud send DELETE request on role/{id}', async () => {
				server.respondWith('DELETE', 'http://my.ozone.domain/ozone/rest/v3/role/an_id1', [
					200,
					{ 'Content-Type': 'application/json' },
					'an_id1',
				])
				const api = client.roleClient()
				const resp = api.deleteById('an_id1')
				server.respond()
				const data = await resp
				assert.deepEqual(data, null)
			})
			it('shoud resolve with null on 404', async () => {
				server.respondWith('DELETE', 'http://my.ozone.domain/ozone/rest/v3/role/an_id1', [
					404,
					{ 'Content-Type': 'application/json' },
					'an_id1',
				])
				const api = client.roleClient()
				const resp = api.deleteById('an_id1')
				server.respond()
				const data = await resp
				assert.isNull(data)
			})
		})
	})
})
