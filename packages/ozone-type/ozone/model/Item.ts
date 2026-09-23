export type UUID = string
export type Instant = string

export interface ItemError {
	fields?: string[]
	message?: string
}

export interface ValidityError extends ItemError {}

export interface SecurityError extends ItemError {}

export interface PersistenceError extends ItemError {}

export interface ItemMeta {
	instanceId?: UUID
	state?: State
	validity?: Validity
	security?: Security
	persistence?: Persistence
	validityErrors?: ValidityError[]
	securityErrors?: SecurityError[]
	persistenceErrors?: PersistenceError[]
}

export enum State {
   OK = 'OK',
   ERROR = 'ERROR'
}

export enum Validity { VALID = 'VALID', INVALID = 'INVALID', UNKNOWN = 'UNKNOWN' }
export enum Security { ALLOWED = 'ALLOWED', FORBIDDEN = 'FORBIDDEN', UNKNOWN = 'UNKNOWN' }
export enum Persistence { NEW = 'NEW', DIRTY = 'DIRTY', SAVED = 'SAVED', SAVE_ERROR = 'SAVE_ERROR' }

export type AbsentFromPatchProps = '_meta' | 'creationUser' | 'modificationUser'

export type NonNullablePatchProps = 'id' | 'version' | 'type'

export type NullablePatchProps<T extends Item> = Exclude<keyof T, NonNullablePatchProps | AbsentFromPatchProps>

export type Patch<T extends Item> = {
  [P in NullablePatchProps<T>]?: T[P] | null
} & {
  [P in NonNullablePatchProps]?: T[P]
}

/**
 * template type for item received from ozone
 */
export type FromOzone<T extends Item> = T & {
	id: UUID
	version: UUID
	_meta: ItemMeta
	tenant: UUID
	type: string
}

/**
 * Transform an item to an object than can be saved.
 * undefined values (not be modify on ozone)
 * @param item
 */
export function toPatch<T extends Item>(item: T): Patch<T> {
	let patch: any = {}
	for (let prop of Object.getOwnPropertyNames(item)) {
		if (prop in ['_meta', 'creationUser', 'modificationUser']) {
			continue
		}
		const val: any = (item as any)[prop]
		if (val !== undefined) {
			patch[prop] = val
		}
	}
	return patch as Patch<T>
}

/**
 * Transform an item to an object than can be saved
 * undefined value will be set to null (erase on ozone)
 * @param item
 */
export function toPatchWithUndefinedAsNull<T extends Item>(item: T): Patch<T> {
	let patch: any = {}
	for (let prop of Object.getOwnPropertyNames(item)) {
		if (prop in ['_meta', 'creationUser', 'modificationUser']) {
			continue
		}
		const val: any = (item as any)[prop]
		if (val === undefined) {
			patch[prop] = null
		} else {
			patch[prop] = val
		}
	}
	return patch as Patch<T>
}

@OzoneType('item')
export class Item {
	id?: UUID
	version?: UUID
	type?: string
	_meta?: ItemMeta
	name?: string
	deleted?: boolean
	traits?: string[]
	tenant?: UUID
	creationUser?: UUID
	modificationUser?: UUID

	constructor (src?: Item) {
		if (src) {
			this.id = src.id
			this.version = src.version
			this.type = src.type
			this._meta = src._meta
			this.name = src.name
			this.deleted = src.deleted
			this.traits = src.traits
			this.tenant = src.tenant
			this.creationUser = src.creationUser
			this.modificationUser = src.modificationUser
		}
	}
}

export class GenericItem extends Item {
	[key: string]: any;
}

/**
 * Decorator for class that extend ozone item
 * @param typeIdentifier
 * @constructor
 */
export function OzoneType(typeIdentifier: string) {
	return function <T extends {new(...args: any[]): {}}>(constructor: T) {
		return class extends constructor {
			type = typeIdentifier
		}
	}
}
