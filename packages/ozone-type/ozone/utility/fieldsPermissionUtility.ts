import { Grants } from '../model/models'

export class FieldsPermissionUtility {

	constructor(public grant: Grants) {}

	hasFieldPermission(fieldName: string, permission: Grants.FieldGrantsEnum): boolean {
		if (this.grant.fieldGrants && this.grant.fieldGrants.hasOwnProperty(fieldName)) {
			return typeof (
				this.grant.fieldGrants[fieldName]
					.find(i => i === permission as any)
			) === 'string'
		} else {
			return false
		}
	}

	isFieldEditable(fieldName: string): boolean {
		return this.hasFieldPermission(fieldName, Grants.FieldGrantsEnum.FIELDEDIT)
	}
}
