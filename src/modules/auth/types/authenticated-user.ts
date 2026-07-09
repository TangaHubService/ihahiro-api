import type { UserRole } from '@/common/enums/user-role.enum'

export interface AuthenticatedUser {
  id: string
  email: string
  role: UserRole
  isBuyer: boolean
  isSeller: boolean
}
