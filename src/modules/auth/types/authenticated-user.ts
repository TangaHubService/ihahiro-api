import type { UserRole } from '@/common/enums/user-role.enum'

export interface AuthenticatedUser {
  id: string
  email: string
  role: UserRole
  isBuyer: boolean
  isSeller: boolean
  // Identifies the access token this request was authenticated with, so
  // logout can blacklist this exact token rather than every token the user holds.
  jti: string
  tokenExpiresAt: Date
}
