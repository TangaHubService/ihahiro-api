# ihahiro-api

Backend for [Ihahiro](../ihahiro-web) — a Rwanda-focused agricultural marketplace. NestJS + TypeORM + PostgreSQL.

## Prerequisites

- Node.js 20+
- PostgreSQL 14+ running locally (or reachable) — [Postgres.app](https://postgresapp.com/) is the easiest way to get one on macOS

## 1. Install dependencies

```bash
npm install
```

## 2. Create the database

Create a role and database for the app. Using `psql` (adjust host/user for your setup — this assumes a local Postgres with a `postgres` superuser):

```bash
psql -h localhost -U postgres -c "CREATE ROLE ihahiro LOGIN PASSWORD 'ihahiro';"
psql -h localhost -U postgres -c "CREATE DATABASE ihahiro OWNER ihahiro;"
```

## 3. Configure environment variables

```bash
cp .env.example .env
```

The defaults in `.env.example` match the role/database created above and point at `localhost:4000`. Change `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` to real secrets before deploying anywhere beyond your own machine — the app refuses to boot without them (env vars are validated at startup, see `src/config/env.validation.ts`).

## 4. Run migrations

Schema changes are managed through TypeORM migrations, not `synchronize` — see `src/database/migrations/`.

```bash
npm run migration:run
```

To generate a new migration after changing an entity:

```bash
npm run migration:generate -- src/database/migrations/DescriptiveName
```

## 5. Seed data

```bash
npm run seed:locations   # Rwanda's 5 provinces + 30 districts (hand-verified, safe to hard-code)
npm run seed:catalog     # starter categories, units, and products
npm run seed:admin       # creates an admin user — see below
```

`seed:admin` reads `ADMIN_EMAIL` / `ADMIN_PASSWORD` from the environment (defaults to `admin@ihahiro.rw` / `change-me-now` if unset — **do not leave the default password in anything but a throwaway local DB**):

```bash
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=some-strong-password npm run seed:admin
```

There is no public API path to become an admin (role is never accepted from client input), so this script — or direct DB access — is the only way to bootstrap the first admin/moderator account.

### Sector / cell / village data

`seed:locations` only seeds provinces and districts — Rwanda has ~416 sectors, ~2,148 cells, and ~14,800+ villages, and hard-coding that many names without an authoritative source risks silently shipping wrong data. Instead, get the official admin boundaries export from Rwanda's National Institute of Statistics (NISR), convert it to a CSV with columns `province,district,sector,cell,village`, and run:

```bash
npm run seed:sub-locations -- path/to/file.csv
```

Safe to re-run; existing rows are matched by name/type/parent and skipped.

## 6. Run the server

```bash
npm run start:dev   # watch mode
# or
npm run build && npm run start   # compiled, production-style
```

The API listens on `http://localhost:4000` with routes under `/api/v1` (both configurable via `PORT` / `API_PREFIX`). Uploaded listing photos are served from `/uploads` off the same port.

## Project structure

Each domain lives under `src/modules/<name>/` with its own `entities/`, `dto/`, `<name>.controller.ts`, `<name>.service.ts`, and `<name>.module.ts`:

`auth`, `users`, `locations`, `categories`, `units`, `products`, `listings`, `media`, `favorites`, `reports`, `reviews`, `notifications`, `moderation`, `chat`, `saved-searches`.

Cross-cutting pieces live in `src/common/` (guards, decorators, the response-envelope interceptor, the global exception filter) and `src/config/` (env validation).

## Testing

There is no automated test suite yet. Every endpoint listed above has been manually verified against a real local Postgres instance (register → create listing → moderate → publish → favorite → report → upload media → serve media), but that verification isn't captured as a repeatable test. Adding one (at least integration tests per module, hitting a real test database) should happen before this goes anywhere near production.

Auth is JWT access + refresh tokens (refresh tokens are stored hashed, with rotation on use). Every route requires a valid access token by default — add `@Public()` to a controller/handler to opt out (see `locations`, `categories`, `products`, `listings` list/detail endpoints, and `auth` register/login/refresh). Role-gated routes (moderation, resolving reports) use `@Roles(UserRole.ADMIN, UserRole.MODERATOR)`.

## Media storage

Listing photos are uploaded via `multipart/form-data` to `POST /media` and stored on local disk under `MEDIA_LOCAL_DIR` (default `uploads/`), served statically at `MEDIA_PUBLIC_BASE_URL`. `MEDIA_DRIVER=local` is the only driver implemented today; swapping to S3/object storage later should only require changes inside `src/modules/media/`.

## Deliberately out of scope

- **Leads / deliveries / price-history**: the web client's endpoint map has room for these, but they presuppose an order/transaction concept that doesn't exist yet (the platform has no checkout). Building them now would be exactly the kind of premature abstraction this project's own engineering guidelines warn against.
- **Chat UI**: the backend (`chat` module — threads, messages, read receipts) is fully implemented and manually verified via curl, but there's no frontend for it yet and no automated test suite.

## Known limitation when running everything locally

Next.js's image optimizer (on the `ihahiro-web` side) refuses to proxy images from private/loopback IPs as a built-in SSRF guard. Since this API serves media from `localhost` in local dev, `ihahiro-web` automatically falls back to unoptimized `<img>` rendering for photos when `NEXT_PUBLIC_API_URL` points at a local host — see `ihahiro-web/src/lib/utils/mediaImageProps.ts`. Nothing to configure here; it resolves itself once the media host is a real public domain in production.
