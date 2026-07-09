import type { SignOptions } from 'jsonwebtoken'

// jsonwebtoken types expiresIn as `number | StringValue`, a branded string type from the
// `ms` package covering patterns like "15m"/"30d". Config values come in as plain strings,
// so this is the one place we assert the shape instead of scattering `as any` everywhere.
export function toJwtExpiry(value: string): SignOptions['expiresIn'] {
  return value as SignOptions['expiresIn']
}
