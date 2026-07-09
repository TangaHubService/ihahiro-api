// Creates (or promotes) the first admin account. There is no public API path to become an
// admin — role is never accepted from client input (see RegisterDto) — so bootstrapping the
// first admin has to happen out-of-band, either via this script or direct DB access.
//
// Usage: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=... npm run seed:admin
import * as bcrypt from 'bcrypt'
import { AppDataSource } from '../data-source'
import { UserRole } from '@/common/enums/user-role.enum'
import { User } from '@/modules/users/entities/user.entity'

async function run() {
  const email = (process.env.ADMIN_EMAIL ?? 'admin@ihahiro.rw').toLowerCase()
  const password = process.env.ADMIN_PASSWORD ?? 'change-me-now'

  await AppDataSource.initialize()
  const repo = AppDataSource.getRepository(User)

  let admin = await repo.findOne({ where: { email } })

  if (admin) {
    admin.role = UserRole.ADMIN
    await repo.save(admin)
    console.log(`Promoted existing user ${email} to admin.`)
  } else {
    const passwordHash = await bcrypt.hash(password, 12)
    admin = repo.create({
      email,
      passwordHash,
      firstName: 'Ihahiro',
      lastName: 'Admin',
      isBuyer: false,
      isSeller: false,
      role: UserRole.ADMIN,
      isVerified: true,
    })
    await repo.save(admin)
    console.log(`Created admin ${email}. Change the password after first login.`)
  }

  await AppDataSource.destroy()
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
