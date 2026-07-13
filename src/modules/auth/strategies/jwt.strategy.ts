import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { InjectRepository } from '@nestjs/typeorm'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Repository } from 'typeorm'
import { User } from '@/modules/users/entities/user.entity'
import { BlacklistedToken } from '@/modules/auth/entities/blacklisted-token.entity'
import type { AuthenticatedUser } from '@/modules/auth/types/authenticated-user'

interface JwtPayload {
  sub: string
  jti: string
  exp: number
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(BlacklistedToken)
    private readonly blacklistedTokensRepository: Repository<BlacklistedToken>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    })
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const [user, blacklisted] = await Promise.all([
      this.usersRepository.findOne({ where: { id: payload.sub } }),
      this.blacklistedTokensRepository.findOne({ where: { jti: payload.jti } }),
    ])

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Session is no longer valid')
    }

    if (blacklisted) {
      throw new UnauthorizedException('Session has been logged out')
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isBuyer: user.isBuyer,
      isSeller: user.isSeller,
      jti: payload.jti,
      tokenExpiresAt: new Date(payload.exp * 1000),
    }
  }
}
