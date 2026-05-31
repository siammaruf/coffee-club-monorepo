# CoffeeClub — Agent Context

Restaurant/cafe management SaaS with four apps sharing one PostgreSQL database.

## Quick Stack

- **Backend**: NestJS 11 + TypeORM + PostgreSQL (`backend/`, port 3000)
- **Dashboard**: React 19 + React Router 7 (SSR) + Redux Toolkit + Radix UI + TailwindCSS v4 (`dashboard/`)
- **Frontend**: React 19 + React Router 7 (SSR) + Redux Toolkit + React Query + TailwindCSS v4 (`frontend/`)
- **Mobile**: React Native 0.84 + Expo 56 + NativeWind + Redux Toolkit + MMKV (`mobile/`)
- **Database**: PostgreSQL, `cc_` prefix, UUID PKs
- **Node**: 20+ required, TypeScript 5.9 everywhere

## Dev Commands

| App | Dev | Build | Notes |
|-----|-----|-------|-------|
| Backend | `cd backend && npm run start:dev` | `npm run build` | Swagger at `/api/v1/docs` |
| Dashboard | `cd dashboard && npm run dev` | `npm run build` | SSR via `react-router-serve` |
| Frontend | `cd frontend && npm run dev` | `npm run build` | SSR via `react-router-serve` |
| Mobile | `cd mobile && npx expo start` | `npx expo run:android` | Manager-only |

**Migrations:**
```bash
cd backend
npm run migration:generate -- src/migrations/Name
npm run migration:run
npm run seed:admin
```

## Conventions

### Backend (NestJS)

- Entities: `@PrimaryGeneratedColumn('uuid')`, table names prefixed `cc_` via `DB_TABLE_PREFIX`
- Modules registered in `src/config/modules.config.ts`
- Response shape: `{ data, status, message, statusCode, timestamp }` via `TransformInterceptor`
- Auth: global `JwtAuthGuard` (skip with `@Public()`), `RolesGuard` via `@Roles()`
- Validation: global `ValidationPipe` with `whitelist: true`, `transform: true`
- Passwords: `EncryptionUtil` (bcrypt)
- Uploads: Cloudinary
- Staff auth: JWT httpOnly cookies (`accessToken`, `refreshToken`)
- Customer auth: separate `customer-jwt` strategy, cookies `customer_access`/`customer_refresh`
- Roles: `ADMIN`, `MANAGER`, `STUFF`

### Dashboard (React)

- UI: Radix UI / shadcn in `app/components/ui/`
- HTTP: Axios with `withCredentials: true` in `app/services/httpService.ts`
- Per-resource services in `app/services/httpServices/`
- State: Redux Toolkit slices in `app/redux/features/`
- Forms: React Hook Form + Zod
- Icons: Lucide React + React Icons

### Frontend (Customer Website)

- Theme: Vincent dark — bg `#121618`, accent `#ffc851`
- Fonts: PT Sans Narrow (headings, uppercase, letter-spacing), Open Sans (body)
- Tailwind v4 with `@theme` directive in `src/index.css`
- Utility classes: `btn-vincent`, `btn-vincent-filled`, `vincent-container`, `page-title-block`
- SSR: React Router 7 framework mode (`ssr: true`)
- Carousel: Embla Carousel for new carousels
- Dynamic content: `useWebsiteContent()` hook fetches `/public/website-content`
- Fallbacks: `src/lib/defaults.ts`
- Auth components: `GuestRoute`, `ProtectedRoute`, `GuestLayout`, `ProtectedLayout`

### Mobile (React Native)

- Auth: Bearer token in `Authorization` header, stored in MMKV (NOT httpOnly cookies)
- Uses staff auth endpoints (`/auth/*`), not customer-auth
- Styling: NativeWind `className` only — never `StyleSheet.create`
- Services: object literals wrapping `HttpService` singleton
- Routing: Expo Router file-based with typed routes
- Manager-role only enforced at login

## Environment

- **Backend**: copy `backend/sample.env` → `backend/.env`
- **Dashboard**: copy `dashboard/.env.example` → `dashboard/.env` (`VITE_API_URL=http://localhost:3000/api/v1`)
- **Frontend**: create `frontend/.env` with `VITE_API_URL=http://localhost:3000/api/v1`
- **Mobile**: configure in `src/utils/config/api.ts` — `EXPO_PUBLIC_API_URL`

## Gotchas

1. **TypeORM nullable columns**: use `| null` in TS type when column is nullable
2. **Windows file casing**: agents may write `Button.tsx` instead of `button.tsx` — use PowerShell `Rename-Item` via temp name
3. **Windows mv failures**: `mv` can fail with "Device busy" — use `cp -r` + `rm -rf` instead
4. **FormData booleans**: `has_variations` etc. arrive as strings (`"true"`/`"false"`), must parse
5. **FormData numbers**: `price`, `quantity` arrive as strings, convert with `parseFloat`/`parseInt`
6. **Mobile vs Web auth**: Mobile uses Bearer header, web uses httpOnly cookies — never mix
7. **CORS**: backend requires `credentials: true` and `CORS_ORIGINS` whitelist
8. **No nginx for frontend**: use `react-router-serve` or `serve` instead

## Testing

```bash
cd backend && npm run test        # Unit
cd backend && npm run test:e2e    # E2E
cd backend && npm run test:cov    # Coverage
cd dashboard && npm run typecheck
cd frontend && npm run typecheck
```

## Docs Reference

| Doc | Path |
|-----|------|
| Architecture | `.claude-project/docs/PROJECT_KNOWLEDGE.md` |
| API | `.claude-project/docs/PROJECT_API.md` |
| Database | `.claude-project/docs/PROJECT_DATABASE.md` |
| Integration | `.claude-project/docs/PROJECT_API_INTEGRATION.md` |
| Design | `.claude-project/docs/PROJECT_DESIGN_GUIDELINES.md` |
| Status | `.claude-project/status/` |
