# Project Knowledge: CoffeeClub

## Overview

CoffeeClub is a **restaurant/cafe management system** with three applications:
1. **Backend** - NestJS API server (POS, admin, and customer-facing APIs)
2. **Dashboard** - React admin panel for staff/management (POS, inventory, HR, reporting)
3. **Frontend** - Customer-facing website (menu browsing, ordering, account management)

## Tech Stack

### Backend (NestJS)
- **Framework**: NestJS 11 (TypeScript)
- **ORM**: TypeORM
- **Database**: PostgreSQL (table prefix: `cc_`)
- **Auth**: JWT with httpOnly cookies (access + refresh tokens)
- **File Upload**: Cloudinary
- **Email**: Nodemailer
- **SMS**: SMS module (API-based)
- **API Docs**: Swagger at `/api/v1/docs`
- **Validation**: class-validator + class-transformer (global ValidationPipe)

### Dashboard (`dashboard/`)
- **Framework**: React 19 + React Router 7 (SSR via @react-router/node)
- **Build**: Vite
- **CSS**: TailwindCSS v4 + tw-animate-css
- **State**: Redux Toolkit + React Redux
- **HTTP Client**: Axios
- **Forms**: React Hook Form + Zod
- **UI Components**: Radix UI (shadcn/ui primitives)
- **Charts**: ApexCharts + react-apexcharts
- **Icons**: Lucide React + React Icons
- **DnD**: @hello-pangea/dnd
- **Date**: date-fns
- **Theme**: next-themes (dark mode)
- **Notifications**: Sonner

### Frontend (`frontend/`)
- **Framework**: React 19.2.4 + React Router 7 (framework mode with SSR)
- **Routing**: React Router 7 with `@react-router/dev` (file-based route config in `src/routes.ts`)
- **Build**: `react-router dev` / `react-router build` / `react-router-serve`
- **State**: Redux Toolkit + React Query (TanStack Query)
- **CSS**: TailwindCSS v4 with `@theme` directive in `index.css`
- **SSR**: React Router 7 framework mode (`ssr: true` in `react-router.config.ts`)
- **SEO**: React Router `MetaFunction` exports per page for meta tags, JSON-LD structured data
- **Carousel**: Embla Carousel (`embla-carousel-react` + `embla-carousel-autoplay`) for hero slider and testimonials
- **Icons**: Lucide React (UI icons) + React Icons (`react-icons/fa` for social icons)
- **Forms**: React Hook Form + Zod validation
- **Toasts**: react-hot-toast
- **Theme**: Vincent dark restaurant theme - PT Sans Narrow headings + Open Sans body (dark-mode-only)
- **Design**: Dark charcoal backgrounds (`#121618`), gold accents (`#c8a97e`), light text (`#dce4e8`), uppercase sans-serif headings
- **Source**: HTML template adapted from `.claude-project/resources/HTML/`
- **All old components removed**: HeroSlider, AboutSection, SpecialMenuSection, WhyChooseUs, etc. were rebuilt from scratch

## Architecture

```
coffeeclub/
├── backend/                        # NestJS 11 API server
│   └── src/
│       ├── modules/
│       │   ├── auth/               # Staff JWT auth (login, refresh, forgot-password, OTP)
│       │   ├── users/              # Staff/employee management
│       │   ├── customers/          # Customer CRUD (admin-managed)
│       │   ├── customer-auth/      # Customer auth (register, login, OTP, reset-password) [NEW]
│       │   ├── public/             # Public endpoints (categories, items, tables) [NEW]
│       │   ├── cart/               # Shopping cart for customers [NEW]
│       │   ├── customer-orders/    # Customer order placement & history [NEW]
│       │   ├── blog/               # Blog posts (public listing + admin CRUD) [NEW]
│       │   ├── reservations/       # Table/event reservations [NEW]
│       │   ├── partners/           # Partner logos/brands [NEW]
│       │   ├── items/              # Menu items/products
│       │   ├── categories/         # Item categories
│       │   ├── orders/             # POS order management
│       │   ├── order-items/        # Order line items
│       │   ├── order-tokens/       # Kitchen order tokens
│       │   ├── tables/             # Table management
│       │   ├── discounts/          # Discount definitions
│       │   ├── discount-application/ # Discount usage tracking
│       │   ├── expenses/           # Expense tracking
│       │   ├── expense-categories/ # Expense categorization
│       │   ├── staff-salary/       # Salary management
│       │   ├── stuff-attendance/   # Attendance tracking
│       │   ├── stuff-leave/        # Leave management
│       │   ├── banks/              # Bank account management
│       │   ├── kitchen-items/      # Kitchen inventory items
│       │   ├── kitchen-orders/     # Kitchen order processing
│       │   ├── kitchen-stock/      # Kitchen stock levels
│       │   ├── reports/            # Sales, inventory, financial reports
│       │   ├── cache/              # Cache management module
│       │   ├── cloudinary/         # Image upload service
│       │   ├── email/              # Email service (Nodemailer)
│       │   └── sms/                # SMS notification service
│       ├── common/
│       │   ├── guards/             # JwtAuthGuard, RolesGuard
│       │   ├── decorators/         # @Public(), @Roles(), @CurrentUser()
│       │   ├── interceptors/       # TransformInterceptor
│       │   ├── filters/            # DatabaseExceptionFilter
│       │   └── pipes/              # ValidationPipe config
│       └── config/                 # TypeORM, JWT, app configuration
├── dashboard/                      # React admin panel (was frontend/)
│   └── app/
│       ├── components/
│       │   ├── common/             # Shared components (ConfirmDialog)
│       │   ├── layout/             # Header, Sidebar, Footer
│       │   ├── modals/             # Modal dialogs (Add/Edit/View)
│       │   ├── skeleton/           # Loading skeleton components
│       │   └── ui/                 # Radix/shadcn UI primitives
│       ├── hooks/auth/             # AuthGuard, AuthRedirect, LogoutButton
│       ├── pages/
│       │   ├── auth/               # Login, forgot-password, verify-otp, reset-password
│       │   └── dashboard/          # All dashboard pages
│       ├── redux/
│       │   ├── features/           # authSlice, userSlice
│       │   └── store/              # Redux store config
│       ├── routes/                 # Route definitions
│       ├── services/
│       │   ├── httpService.ts      # Axios base client
│       │   └── httpServices/       # Per-resource API services
│       ├── styles/                 # CSS (Tailwind + typography)
│       ├── types/                  # TypeScript type definitions
│       └── utils/                  # Error handling, validation
├── frontend/                       # Customer-facing website (React Router 7 framework mode, SSR)
│   ├── react-router.config.ts     # SSR config (ssr: true, appDirectory: "src")
│   └── src/
│       ├── entry.client.tsx       # Client hydration entry
│       ├── entry.server.tsx       # SSR rendering entry
│       ├── root.tsx               # Root layout (html, head, body)
│       ├── routes.ts              # Route config (layout + pages)
│       ├── index.css              # Vincent dark theme (@theme directive, global styles, .btn-vincent, etc.)
│       ├── components/
│       │   ├── layout/            # Header (3-column), Footer (centered), Layout (with BackToTop)
│       │   ├── home/              # HeroSlider, AdvantagesSection, HotSalesSection, AboutTestimonialsSection, TabbedMenuSection, BlogPreviewSection, NewsletterSection
│       │   ├── menu/              # ItemDetailModal
│       │   ├── cart/              # CartDrawer, CartItem
│       │   ├── auth/              # ProtectedRoute, ProtectedLayout, GuestRoute, GuestLayout
│       │   └── ui/                # Loading spinner
│       ├── pages/                  # HomePage, MenuPage, AboutPage, ContactPage, BlogPage, BlogPostPage, CartPage, CheckoutPage, ReservationPage, LoginPage, RegisterPage, ForgotPasswordPage, ProfilePage, OrderHistoryPage, OrderDetailPage, NotFoundPage
│       ├── redux/
│       │   ├── features/           # authSlice, cartSlice, orderSlice
│       │   └── store/              # Redux store config + hooks
│       ├── hooks/                  # useAuth, useCart, useMenu, useInView, useCountUp
│       ├── services/
│       │   ├── httpService.ts      # Axios base client
│       │   └── httpServices/       # Per-resource API services + queries/ (React Query hooks)
│       ├── types/                  # TypeScript types (customer, item, order, blog, reservation, partner)
│       ├── utils/                  # Validation schemas (auth, etc.)
│       └── lib/                    # Config, queryClient, utilities (cn, formatPrice, truncate, etc.)
└── .claude-project/                # Project documentation
```

## Global NestJS Configuration

### Guards (Applied Globally)
- **JwtAuthGuard** - Checks JWT on every request; skips routes decorated with `@Public()`
- **RolesGuard** - Enforces role-based access via `@Roles(Role.ADMIN, Role.MANAGER)` decorator

### Interceptors
- **TransformInterceptor** - Wraps all responses in standard format:
  ```json
  { "data": {}, "status": true, "message": "Success", "statusCode": 200, "timestamp": "..." }
  ```

### Filters
- **DatabaseExceptionFilter** - Catches TypeORM/database errors and returns clean error responses

### Pipes
- **ValidationPipe** - Global with `whitelist: true`, `transform: true`

### Auth Decorators
- `@Public()` - Marks route as publicly accessible (bypasses JwtAuthGuard)
- `@Roles(Role.ADMIN)` - Requires specific role(s)
- `@CurrentUser()` - Injects authenticated user into handler

### Entity ID Strategy
- All entities use UUID: `@PrimaryGeneratedColumn('uuid')`
- All table names prefixed with `cc_` (via `DB_TABLE_PREFIX`)

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| NestJS over Express | Structured architecture, dependency injection, decorators, guards |
| TypeORM over Knex | Entity decorators, relations, migrations, repository pattern |
| httpOnly cookie auth | Prevents XSS token theft vs localStorage |
| UUID primary keys | Distributed-safe, non-sequential IDs |
| Cloudinary for uploads | Cloud-hosted images, automatic optimization |
| Separate dashboard/frontend | Different UX needs: admin POS vs customer ordering |
| Redux Toolkit for both apps | Consistent state management pattern across dashboard and frontend |

## Development Setup

```bash
# Start backend (default port from .env)
cd backend && npm run start:dev

# Start dashboard
cd dashboard && npm run dev

# Start frontend
cd frontend && npm run dev

# Run migrations
cd backend && npm run migration:run

# Generate migration
cd backend && npm run migration:generate -- src/migrations/MigrationName

# Seed database
cd backend && npm run seed:run
```

## Environment Variables

### Backend

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | `5000` |
| `ENCRYPTION_SALT` | Bcrypt salt rounds | Yes | `10` |
| `JWT_SECRET` | JWT signing secret | Yes | `your-secret-key` |
| `CORS_ORIGINS` | Allowed CORS origins | Yes | `http://localhost:5173,http://localhost:3000` |
| `DB_HOST` | PostgreSQL host | Yes | `localhost` |
| `DB_PORT` | PostgreSQL port | No | `5432` |
| `DB_USERNAME` | PostgreSQL user | Yes | `cc_user` |
| `DB_PASSWORD` | PostgreSQL password | Yes | `password` |
| `DB_NAME` | PostgreSQL database | Yes | `coffeeclub` |
| `DB_TABLE_PREFIX` | Table name prefix | No | `cc_` |
| `MAIL_HOST` | SMTP host | Yes | `smtp.gmail.com` |
| `MAIL_USER` | SMTP username | Yes | `noreply@coffeeclub.com` |
| `MAIL_PASSWORD` | SMTP password | Yes | `app-password` |
| `MAIL_FROM` | From address | Yes | `CoffeeClub <noreply@coffeeclub.com>` |
| `FRONTEND_URL` | Customer frontend URL | Yes | `http://localhost:3000` |
| `SMS_API_KEY` | SMS provider API key | No | `key-xxx` |
| `SMS_SENDER_ID` | SMS sender ID | No | `CoffeeClub` |

### Dashboard

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API base URL | Yes | `http://localhost:5000/api/v1` |

### Frontend

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API base URL | Yes | `http://localhost:5000/api/v1` |

## Security Architecture

### Staff Authentication (Auth Module)
1. Staff calls `POST /api/v1/auth/login` with email + password
2. Backend validates credentials and sets `accessToken` + `refreshToken` as httpOnly cookies
3. JwtAuthGuard extracts token from cookies on every request
4. RolesGuard checks `@Roles()` decorator for role-based access
5. Roles: `ADMIN`, `MANAGER`, `STUFF`

### Customer Authentication (Customer-Auth Module) [NEW]
1. Customer registers via `POST /api/v1/customer-auth/register`
2. OTP verification via SMS/email
3. Login sets httpOnly cookies (same mechanism as staff)
4. Customer-specific endpoints protected by customer JWT context

### Security Features
- httpOnly cookies (XSS protection)
- JWT access + refresh token rotation
- Role-based access control (ADMIN, MANAGER, STUFF)
- Global ValidationPipe (whitelist strips unknown fields)
- DatabaseExceptionFilter (prevents leaking DB errors)
- CORS origin whitelist with credentials
- Password hashing with bcrypt
- OTP-based password reset

## External Services

| Service | Purpose | Config |
|---------|---------|--------|
| PostgreSQL | Primary database | `DB_*` env vars |
| Cloudinary | Image uploads | Cloudinary module |
| Nodemailer | Transactional emails | `MAIL_*` env vars |
| SMS Provider | OTP & notifications | `SMS_*` env vars |
| Swagger UI | API documentation | `/api/v1/docs` |
