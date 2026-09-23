import { assert } from 'chai'
import sinon from 'sinon'
import { fakeServer, FakeServer, FakeXMLHttpRequest } from 'nise'
import { OzoneClient } from '../../src/index'
import { FieldsPermissionUtility } from '@taktik/ozone-type'

describe('OzoneClient', () => {
	let client: OzoneClient.OzoneClient
	let server: FakeServer

	beforeAll(() => {
		server = fakeServer.create()
		const credentials = new OzoneClient.UserCredentials('ozoneUser', 'ozonePassword')
		const config: OzoneClient.ClientConfiguration = {
			ozoneURL: `http://my.ozone.domain/ozone`,
			ozoneCredentials: credentials
		}
		client = OzoneClient.newOzoneClient(config)
		// for test, its not mandatory to start the client
		// return client.start()
	})

	afterAll(() => {
		server.restore()
	})
	describe('permissionClient', () => {
		describe('bulkGetPermissions', () => {
			it('shoud send POST request permission', async () => {
				server.respondWith(
					'POST',
					/\/rest\/v3\/items\/bulkGetPermissions\?fields=name$/,
					[
						200,
						{ 'Content-Type': 'application/json' },
						'[ {"id": "item_id_1", "grants": ["FIELD_EDIT", "FIELD_VIEW"], "fieldGrants": {"name": ["FIELD_EDIT", "FIELD_VIEW"]}}, {"id": "item_id_2", "grants": ["FIELD_VIEW"], "fieldGrants": {"name": ["FIELD_VIEW"]}}]'
					]
				)
				const api = client.permissionClient()
				const resp = api.bulkGetPermissions([
					'name'
					// {identifier:'f_id2'},
				], ['item_id_1', 'item_id_2'])
				server.respond()
				const data: Map<string, FieldsPermissionUtility> = await resp
				assert.deepEqual(data.get('item_id_1')!.grant, { 'id': 'item_id_1', 'grants': ['FIELD_EDIT', 'FIELD_VIEW'], 'fieldGrants': { 'name': ['FIELD_EDIT', 'FIELD_VIEW'] } } as any)
				assert.isTrue((data.get('item_id_1')as any).isFieldEditable('name'))
				assert.isFalse(data.get('item_id_2')!.isFieldEditable('name'))
			})
		})
		describe('getPermissions', () => {
			it('shoud send POST request permission', async () => {
				server.respondWith(
					'POST',
					/\/rest\/v3\/items\/bulkGetPermissions\?fields=name$/,
					[
						200,
						{ 'Content-Type': 'application/json' },
						'[ {"id": "item_id_1", "grants": ["FIELD_EDIT", "FIELD_VIEW"], "fieldGrants": {"name": ["FIELD_EDIT", "FIELD_VIEW"]}}]'
					]
				)
				const api = client.permissionClient()
				const resp = api.getPermissions([
					'name'
					// {identifier:'f_id2'},
				], 'item_id_1')
				server.respond()
				const data = await resp
				if (data) {
					assert.deepEqual(data.grant, { 'id': 'item_id_1', 'grants': ['FIELD_EDIT', 'FIELD_VIEW'], 'fieldGrants': { 'name': ['FIELD_EDIT', 'FIELD_VIEW'] } } as any)
					assert.isTrue(data.isFieldEditable('name'))
				} else {
					assert.isDefined(data)
				}
			})
		})
	})
})
