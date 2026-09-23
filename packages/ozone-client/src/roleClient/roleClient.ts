import { Role, UUID, Grants } from '@taktik/ozone-type'

export interface RoleClient {

	getAll(): Promise<Role[]>

	save(role: Role): Promise<Role>

	getByName(roleName: string): Promise<Role | null>

	getPermissions(roleIds: UUID[]): Promise<Grants[]>

	getById(roleId: UUID): Promise<Role | null>

	deleteById(id: UUID): Promise<UUID | null>
}
