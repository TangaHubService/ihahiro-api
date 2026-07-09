import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import * as bcrypt from 'bcrypt'
import * as crypto from 'crypto'
import { IsNull, MoreThan, Repository } from 'typeorm'
import { toJwtExpiry } from '@/common/utils/jwt-expiry'
import { RegisterDto } from '@/modules/auth/dto/register.dto'
import { LoginDto } from '@/modules/auth/dto/login.dto'
import { RefreshToken } from '@/modules/auth/entities/refresh-token.entity'
import { User } from '@/modules/users/entities/user.entity'

const BCRYPT_ROUNDS = 12
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface TokenPair {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(RefreshToken) private readonly refreshTokensRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersRepository.findOne({ where: { email: dto.email.toLowerCase() } })
    if (existing) {
      throw new ConflictException('An account with this email already exists')
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS)

    const user = this.usersRepository.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone ?? null,
      isBuyer: dto.isBuyer ?? true,
      isSeller: dto.isSeller ?? false,
    })
    await this.usersRepository.save(user)

    const tokens = await this.issueTokenPair(user)
    return { user: this.toPublicUser(user), tokens }
  }

  async login(dto: LoginDto) {
    const isEmail = EMAIL_REGEX.test(dto.identifier)
    const user = await this.usersRepository.findOne({
      where: isEmail ? { email: dto.identifier.toLowerCase() } : { phone: dto.identifier },
    })

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash)
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const tokens = await this.issueTokenPair(user)
    return { user: this.toPublicUser(user), tokens }
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const tokenHash = this.hashToken(refreshToken)
    const stored = await this.refreshTokensRepository.findOne({
      where: { tokenHash, revokedAt: IsNull(), expiresAt: MoreThan(new Date()) },
      relations: { user: true },
    })

    if (!stored || !stored.user || !stored.user.isActive) {
      throw new UnauthorizedException('Refresh token is invalid or expired')
    }

    // Rotate: revoke the used token and issue a fresh pair, so a stolen-but-already-used
    // refresh token can't be replayed.
    stored.revokedAt = new Date()
    await this.refreshTokensRepository.save(stored)

    return this.issueTokenPair(stored.user)
  }

  async logout(userId: string) {
    await this.refreshTokensRepository.update({ userId, revokedAt: IsNull() }, { revokedAt: new Date() })
  }

  async me(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } })
    if (!user) {
      throw new UnauthorizedException('Session is no longer valid')
    }
    return this.toPublicUser(user)
  }

  private async issueTokenPair(user: User): Promise<TokenPair> {
    const accessToken = await this.jwtService.signAsync(
      { sub: user.id },
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: toJwtExpiry(this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m')),
      }
    )

    const refreshTokenRaw = crypto.randomBytes(48).toString('hex')
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '30d')

    await this.refreshTokensRepository.save(
      this.refreshTokensRepository.create({
        userId: user.id,
        tokenHash: this.hashToken(refreshTokenRaw),
        expiresAt: this.addDuration(new Date(), refreshExpiresIn),
      })
    )

    return {
      accessToken,
      refreshToken: refreshTokenRaw,
      expiresIn: this.parseDurationSeconds(this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m')),
    }
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex')
  }

  private toPublicUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      isBuyer: user.isBuyer,
      isSeller: user.isSeller,
      role: user.role,
    }
  }

  private parseDurationSeconds(duration: string): number {
    const match = /^(\d+)([smhd])$/.exec(duration)
    if (!match) return 900
    const value = Number(match[1])
    const unit = match[2]
    const multiplier = { s: 1, m: 60, h: 3600, d: 86400 }[unit] ?? 1
    return value * multiplier
  }

  private addDuration(base: Date, duration: string): Date {
    return new Date(base.getTime() + this.parseDurationSeconds(duration) * 1000)
  }
}
