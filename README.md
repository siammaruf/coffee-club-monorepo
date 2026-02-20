# CoffeeClub

> Full-stack SaaS restaurant management platform with admin dashboard, customer website, and mobile POS app.

![NestJS](https://img.shields.io/badge/NestJS-11-red?logo=nestjs)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![React Native](https://img.shields.io/badge/React_Native-0.84-purple?logo=react)
![Expo](https://img.shields.io/badge/Expo-56-white?logo=expo)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-blue?logo=tailwindcss)

## Overview

CoffeeClub is a comprehensive restaurant and cafe management system designed as a SaaS platform. It provides everything needed to run a food service business — from order management and kitchen operations to customer-facing online ordering, reservations, and blog content.

The platform consists of four interconnected applications: a RESTful API backend, an admin dashboard for staff and management, a customer-facing website with an elegant dark theme, and a mobile POS app for managers on the go. All applications share a single PostgreSQL database and communicate through a unified API.

## Architecture

```
                    ┌─────────────────────────┐
                    │   PostgreSQL Database    │
                    └────────────┬────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │     NestJS Backend      │
                    │   REST API + Swagger    │
                    │   localhost:3000        │
                    └──┬─────────┬──────────┬─┘
                       │         │          │
              ┌────────┘    ┌────┘     ┌────┘
              ▼             ▼          ▼
    ┌──────────────┐ ┌───────────┐ ┌───────────┐
    │  Dashboard   │ │ Frontend  │ │  Mobile   │
    │  (Admin)     │ │(Customer) │ │(Manager)  │
    │  React 19    │ │ React 19  │ │  Expo 56  │
    └──────────────┘ └───────────┘ └───────────┘
```

## Applications

**Backend API** — NestJS 11 server with TypeORM and PostgreSQL. Handles authentication (JWT), file uploads (Cloudinary), email notifications, and serves all three client applications via REST endpoints with interactive Swagger documentation.

**Dashboard** — Admin panel for restaurant staff and management. Manage menu items, orders, employees, kitchen operations, expenses, customers, blog posts, reservations, and website content. Built with React 19, Radix UI components, and server-side rendering.

**Frontend** — Customer-facing website with a dark, elegant restaurant theme (Vincent). Supports menu browsing, online ordering with cart, table reservations, blog, and customer accounts. Built with React 19, React Query, and server-side rendering.

**Mobile** — Manager POS app for on-the-go operations. Order management, expense tracking, reports, and thermal receipt printing. Built with React Native and Expo, restricted to manager-role users.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | NestJS 11, TypeORM, PostgreSQL, Passport JWT, Swagger, Cloudinary, Nodemailer |
| Dashboard | React 19, React Router 7, Redux Toolkit, Radix UI, TailwindCSS v4, ApexCharts |
| Frontend | React 19, React Router 7 (SSR), Redux Toolkit, React Query, TailwindCSS v4, Embla Carousel |
| Mobile | React Native 0.84, Expo 56, NativeWind, Redux Toolkit, MMKV, Thermal Printer |
| Language | TypeScript 5.9 (all projects) |

## Prerequisites

- Node.js 20+
- PostgreSQL 14+ (running locally or via Docker)
- npm (included with Node.js)
- Expo CLI (`npx expo`) for mobile development
- Android Studio or Xcode for mobile emulators (optional)

## Quick Start

### 1. Clone the Repository

```bash
git clone --recurse-submodules <repo-url>
cd CoffeeClub
```

### 2. Set Up the Backend

```bash
cd backend
cp sample.env .env
# Edit .env with your database credentials and secrets
npm install
npm run migration:run
npm run seed:admin
npm run start:dev
```

API available at `http://localhost:3000/api/v1` — Swagger docs at `http://localhost:3000/api/v1/docs`

### 3. Set Up the Dashboard

```bash
cd dashboard
cp .env.example .env
# Verify VITE_API_URL points to your backend
npm install
npm run dev
```

### 4. Set Up the Frontend

```bash
cd frontend
echo "VITE_API_URL=http://localhost:3000/api/v1" > .env
npm install
npm run dev
```

### 5. Set Up Mobile (Optional)

```bash
cd mobile
npm install
npx expo start
# Press 'a' for Android or 'i' for iOS
```

## Project Structure

```
CoffeeClub/
├── backend/                # NestJS API server
│   ├── src/modules/        # Feature modules (~35 modules)
│   ├── src/common/         # Guards, decorators, interceptors, filters
│   ├── src/config/         # Database, JWT, Swagger, module config
│   └── sample.env          # Environment template
├── dashboard/              # React admin panel
│   ├── app/components/     # UI components (Radix/shadcn)
│   ├── app/routes/         # Page routes
│   ├── app/services/       # API service layer
│   └── app/redux/          # Redux Toolkit store
├── frontend/               # Customer website
│   ├── src/components/     # UI components (Vincent theme)
│   ├── src/routes/         # Page routes
│   ├── src/services/       # API service layer
│   └── src/lib/            # Utilities, defaults, hooks
├── mobile/                 # React Native Expo app
│   ├── src/app/            # Expo Router screens
│   ├── src/components/     # Reusable components
│   ├── src/services/       # API services
│   └── src/redux/          # Redux Toolkit store
└── .claude-project/docs/   # Detailed documentation
```

## API Documentation

- **Interactive docs**: Swagger UI at `/api/v1/docs` (when backend is running)
- **Full reference**: [PROJECT_API.md](.claude-project/docs/PROJECT_API.md)
- **Response format**: All endpoints return `{ data, status, message, statusCode, timestamp }`

## Database

PostgreSQL with TypeORM. All tables prefixed with `cc_`, UUID primary keys throughout.

```bash
cd backend
npm run migration:generate -- src/migrations/DescriptiveName  # Generate
npm run migration:run                                          # Apply
npm run migration:revert                                       # Rollback
```

Full schema documentation: [PROJECT_DATABASE.md](.claude-project/docs/PROJECT_DATABASE.md)

## Testing

```bash
# Backend
cd backend
npm run test           # Unit tests
npm run test:e2e       # E2E tests
npm run test:cov       # Coverage report

# Dashboard
cd dashboard
npm run typecheck      # TypeScript checking

# Frontend
cd frontend
npm run typecheck      # TypeScript checking
```

## Deployment

Each application has a `Dockerfile` for containerized deployment:

- **Backend**: Multi-stage build (Bun builder + Node.js 20 runtime), health check at `/api/v1/health`
- **Dashboard**: SSR production via `react-router-serve`
- **Frontend**: SSR production via `react-router-serve`

> Do NOT use nginx for frontend/dashboard — use `react-router-serve` or `serve` instead.

## Documentation

- [Project Knowledge](.claude-project/docs/PROJECT_KNOWLEDGE.md) — Full architecture and tech stack
- [API Reference](.claude-project/docs/PROJECT_API.md) — All endpoints and examples
- [Database Schema](.claude-project/docs/PROJECT_DATABASE.md) — ERD and entity details
- [API Integration](.claude-project/docs/PROJECT_API_INTEGRATION.md) — Route-to-API mapping
- [Design Guidelines](.claude-project/docs/PROJECT_DESIGN_GUIDELINES.md) — Color system, typography, components
- [Claude Context](CLAUDE.md) — Quick reference for Claude Code

## Contributing

1. Create a feature branch from `main`
2. Follow existing code patterns and conventions
3. Ensure TypeScript compiles without errors
4. Create a PR with a clear description

> **Note**: `.claude/` is a git submodule — do not modify it directly in this repository.

## License

This project is proprietary. All rights reserved.
