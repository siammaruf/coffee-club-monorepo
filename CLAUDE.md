# CoffeeClub - Claude Context

Restaurant/cafe management SaaS platform with 4 applications sharing a single PostgreSQL database.

## Quick Stack Reference

- **Backend**: NestJS 11 + TypeORM + PostgreSQL (`backend/`, port 3000)
- **Dashboard**: React 19 + React Router 7 (SSR) + Redux Toolkit + Radix UI + TailwindCSS v4 (`dashboard/`)
- **Frontend**: React 19 + React Router 7 (SSR) + Redux Toolkit + React Query + TailwindCSS v4 (`frontend/`)
- **Mobile**: React Native 0.84 + Expo 56 + NativeWind + Redux Toolkit + MMKV (`mobile/`)
- **Database**: PostgreSQL with `cc_` table prefix, UUID primary keys
- **Node**: 20+ required
- **Language**: TypeScript 5.9 across all projects

## Project Structure

```
CoffeeClub/
├── backend/              # NestJS API server
├── dashboard/            # React admin panel (staff/management)
├── frontend/             # Customer-facing website (Vincent dark theme)
├── mobile/               # React Native Expo POS app (manager only)
├── .claude/              # Claude workflow (git submodule)
├── .claude-project/
│   ├── docs/             # 5 detailed documentation files
│   ├── status/           # Implementation status tracking
│   └── resources/HTML/   # Vincent HTML template source
└── menual-sc/            # Manual screenshots (reference)
```

## Development Commands

| App | Start Dev | Build | Notes |
|-----|-----------|-------|-------|
| Backend | `cd backend && npm run start:dev` | `npm run build` | Swagger at `/api/v1/docs` |
| Dashboard | `cd dashboard && npm run dev` | `npm run build` | SSR via `react-router-serve` |
| Frontend | `cd frontend && npm run dev` | `npm run build` | SSR via `react-router-serve` |
| Mobile | `cd mobile && npx expo start` | `npx expo run:android` | Manager-only access |

**Migrations:**
```bash
cd backend
npm run migration:generate -- src/migrations/MigrationName
npm run migration:run
npm run seed:admin    # First-time admin setup
```

## Architecture Conventions

### Backend (NestJS)

- Entity IDs: `@PrimaryGeneratedColumn('uuid')`
- Table names: prefixed with `cc_` via `DB_TABLE_PREFIX`
- Modules registered in `src/config/modules.config.ts`
- Response format: `{ data, status, message, statusCode, timestamp }` via `TransformInterceptor`
- Global guards: `JwtAuthGuard` (skip with `@Public()`), `RolesGuard` (check with `@Roles()`)
- Global pipe: `ValidationPipe` with `whitelist: true`, `transform: true`
- Decorators: `@Public()`, `@Roles(Role.ADMIN)`, `@CurrentUser()`, `@CurrentCustomer()`
- Password hashing: `EncryptionUtil` (bcrypt)
- File uploads: Cloudinary
- Staff auth: JWT httpOnly cookies (`accessToken`, `refreshToken`)
- Customer auth: separate `customer-jwt` strategy, cookies `customer_access`/`customer_refresh`
- Roles: `ADMIN`, `MANAGER`, `STUFF`

### Dashboard (React)

- UI components: Radix UI / shadcn in `app/components/ui/`
- HTTP: Axios with `withCredentials: true` in `app/services/httpService.ts`
- Per-resource services in `app/services/httpServices/`
- State: Redux Toolkit slices in `app/redux/features/`
- Forms: React Hook Form + Zod
- Icons: Lucide React + React Icons

### Frontend (Customer Website)

- Theme: Vincent dark restaurant — bg `#121618`, accent `#ffc851`
- Fonts: PT Sans Narrow (headings, uppercase, letter-spacing), Open Sans (body)
- TailwindCSS v4 with `@theme` directive in `src/index.css`
- CSS classes: `btn-vincent`, `btn-vincent-filled`, `vincent-container`, `page-title-block`
- SSR: React Router 7 framework mode (`ssr: true`)
- Carousel: Embla Carousel (use for new carousels)
- Dynamic content: `useWebsiteContent()` hook fetches from `/public/website-content`
- Fallbacks: `src/lib/defaults.ts` when API unavailable
- Auth components: `GuestRoute`, `ProtectedRoute`, `GuestLayout`, `ProtectedLayout`

### Mobile (React Native)

- Auth: Bearer token in Authorization header (NOT httpOnly cookies), stored in MMKV
- Uses staff auth endpoints (`/auth/*`), NOT customer-auth
- Styling: NativeWind `className` only — never `StyleSheet.create`
- Services: Object literals wrapping `HttpService` singleton
- Routing: Expo Router file-based with typed routes
- Manager-role only enforced at login

## Environment Variables

- **Backend**: Copy `backend/sample.env` to `backend/.env` — key vars: `PORT`, `DB_*`, `JWT_SECRET`, `CORS_ORIGINS`
- **Dashboard**: Copy `dashboard/.env.example` to `dashboard/.env` — `VITE_API_URL=http://localhost:3000/api/v1`
- **Frontend**: Create `frontend/.env` — `VITE_API_URL=http://localhost:3000/api/v1`
- **Mobile**: Configure in `src/utils/config/api.ts` — `EXPO_PUBLIC_API_URL`

## Common Gotchas

1. **TypeORM nullable columns**: Must use `| null` in TS type when column is nullable and value can be `null`
2. **Windows file casing**: Agents may write `Button.tsx` instead of `button.tsx` — use PowerShell `Rename-Item` via temp name
3. **Windows mv failures**: `mv` can fail with "Device busy" — use `cp -r` + `rm -rf` instead
4. **FormData booleans**: `has_variations` etc. arrive as strings (`"true"`/`"false"`), must parse
5. **FormData numbers**: `price`, `quantity` arrive as strings, convert with `parseFloat`/`parseInt`
6. **Mobile vs Web auth**: Mobile uses Bearer header, web uses httpOnly cookies — never mix
7. **CORS**: Backend requires `credentials: true` and `CORS_ORIGINS` whitelist
8. **No nginx for frontend**: Use `react-router-serve` or `serve` instead

## Testing

```bash
cd backend && npm run test        # Unit tests
cd backend && npm run test:e2e    # E2E tests
cd backend && npm run test:cov    # Coverage
cd dashboard && npm run typecheck # TypeScript check
cd frontend && npm run typecheck  # TypeScript check
```

## Documentation Reference

| Document | Path | Content |
|----------|------|---------|
| Knowledge | `.claude-project/docs/PROJECT_KNOWLEDGE.md` | Full architecture, tech stack, security |
| API | `.claude-project/docs/PROJECT_API.md` | All endpoint specs, request/response examples |
| Database | `.claude-project/docs/PROJECT_DATABASE.md` | Full schema, ERD, entity relationships |
| Integration | `.claude-project/docs/PROJECT_API_INTEGRATION.md` | Frontend route to API mapping |
| Design | `.claude-project/docs/PROJECT_DESIGN_GUIDELINES.md` | Color system, typography, components |
| Status | `.claude-project/status/` | Implementation progress tracking |

---

**Last Updated:** 2026-02-20
