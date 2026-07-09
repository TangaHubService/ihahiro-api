import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { InjectRepository } from '@nestjs/typeorm'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Repository } from 'typeorm'
import { User } from '@/modules/users/entities/user.entity'
import type { AuthenticatedUser } from '@/modules/auth/types/authenticated-user'

interface JwtPayload {
  sub: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(User) private readonly usersRepository: Repository<User>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    })
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.usersRepository.findOne({ where: { id: payload.sub } })

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Session is no longer valid')
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isBuyer: user.isBuyer,
      isSeller: user.isSeller,
    }
  }
}
