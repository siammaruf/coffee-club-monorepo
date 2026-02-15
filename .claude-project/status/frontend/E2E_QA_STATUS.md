# E2E QA Status: CoffeeClub

> **Last Updated:** 2026-02-15
> **Test Framework:** Not installed (Playwright recommended)
> **Dashboard Routes:** 51 | **Frontend Routes:** 18

---

## Infrastructure Status

| App | Test Framework | Config File | Test Files | Status |
|-----|---------------|-------------|------------|--------|
| Dashboard | None installed | No playwright.config.ts | No test files | Not Started |
| Frontend | None installed | No playwright.config.ts | No test files | Not Started |
| Backend | Jest + Supertest | jest-e2e.json | 1 minimal file | Minimal |

---

## Test Summary

| Category | App | Total | Complete | Not Started |
|----------|-----|-------|----------|-------------|
| Dashboard Auth | Dashboard | 4 | 0 | 4 |
| Dashboard Home | Dashboard | 2 | 0 | 2 |
| Employees | Dashboard | 4 | 0 | 4 |
| Products | Dashboard | 4 | 0 | 4 |
| Orders | Dashboard | 4 | 0 | 4 |
| Kitchen | Dashboard | 6 | 0 | 6 |
| Salary & HR | Dashboard | 3 | 0 | 3 |
| Categories & Inventory | Dashboard | 3 | 0 | 3 |
| Finance | Dashboard | 6 | 0 | 6 |
| Customers & Tables | Dashboard | 3 | 0 | 3 |
| Website Management | Dashboard | 6 | 0 | 6 |
| Blog Management | Dashboard | 4 | 0 | 4 |
| Reservations Mgmt | Dashboard | 2 | 0 | 2 |
| Partners | Dashboard | 2 | 0 | 2 |
| Contact Messages | Dashboard | 2 | 0 | 2 |
| Data Management | Dashboard | 2 | 0 | 2 |
| Public Pages | Frontend | 9 | 0 | 9 |
| Customer Auth | Frontend | 3 | 0 | 3 |
| Customer Protected | Frontend | 4 | 0 | 4 |
| Customer Flows | Frontend | 2 | 0 | 2 |
| **Total** | **Both** | **75** | **0** | **75** |

---

## Dashboard E2E Scenarios

### Authentication

| URL (Route) | Test Scenario | Status | Last Run |
|-------------|---------------|--------|----------|
| `/` | Display login form | Not Started | - |
| `/` | Show validation errors for empty form | Not Started | - |
| `/` | Login with valid credentials | Not Started | - |
| `/` | Show error for invalid credentials | Not Started | - |

### Dashboard Core

| URL (Route) | Test Scenario | Status | Last Run |
|-------------|---------------|--------|----------|
| `/dashboard` | Display dashboard home with stats | Not Started | - |
| `/dashboard/profile` | View and edit user profile | Not Started | - |

### Employees

| URL (Route) | Test Scenario | Status | Last Run |
|-------------|---------------|--------|----------|
| `/dashboard/employees` | List all employees with pagination | Not Started | - |
| `/dashboard/employees/create` | Create new employee with file uploads | Not Started | - |
| `/dashboard/employees/edit/:id` | Edit employee details | Not Started | - |
| `/dashboard/employees/:id` | View employee details | Not Started | - |

### Products

| URL (Route) | Test Scenario | Status | Last Run |
|-------------|---------------|--------|----------|
| `/dashboard/products` | List all products with search | Not Started | - |
| `/dashboard/products/create` | Create new product with image | Not Started | - |
| `/dashboard/products/edit/:id` | Edit product details | Not Started | - |
| `/dashboard/products/:id` | View product details | Not Started | - |

### Orders

| URL (Route) | Test Scenario | Status | Last Run |
|-------------|---------------|--------|----------|
| `/dashboard/orders` | List orders with date filtering | Not Started | - |
| `/dashboard/orders/create` | Create new order (table, items, customer) | Not Started | - |
| `/dashboard/orders/edit/:id` | Edit existing order | Not Started | - |
| `/dashboard/orders/:id` | View order details | Not Started | - |

### Kitchen Management

| URL (Route) | Test Scenario | Status | Last Run |
|-------------|---------------|--------|----------|
| `/dashboard/kitchen-orders` | List kitchen orders | Not Started | - |
| `/dashboard/kitchen-order/create` | Create kitchen order | Not Started | - |
| `/dashboard/kitchen-order/edit/:id` | Edit kitchen order | Not Started | - |
| `/dashboard/kitchen-order/:id` | View kitchen order details | Not Started | - |
| `/dashboard/kitchen-items` | Manage kitchen items CRUD | Not Started | - |
| `/dashboard/kitchen-stock` | Manage kitchen stock | Not Started | - |

### Salary & HR

| URL (Route) | Test Scenario | Status | Last Run |
|-------------|---------------|--------|----------|
| `/dashboard/salary` | List salaries with filters | Not Started | - |
| `/dashboard/salary/create` | Create salary record | Not Started | - |
| `/dashboard/attendance` | Manage attendance (check-in/out) | Not Started | - |

### Categories & Inventory

| URL (Route) | Test Scenario | Status | Last Run |
|-------------|---------------|--------|----------|
| `/dashboard/categories` | Manage categories CRUD | Not Started | - |
| `/dashboard/kitchen-items` | Manage kitchen items | Not Started | - |
| `/dashboard/kitchen-stock` | Manage kitchen stock levels | Not Started | - |

### Finance

| URL (Route) | Test Scenario | Status | Last Run |
|-------------|---------------|--------|----------|
| `/dashboard/expenses` | Manage expenses with filters | Not Started | - |
| `/dashboard/expenses/categories` | Manage expense categories | Not Started | - |
| `/dashboard/discounts` | Manage discounts CRUD | Not Started | - |
| `/dashboard/reports/sales` | View sales report with charts | Not Started | - |
| `/dashboard/reports/inventory` | View inventory report | Not Started | - |
| `/dashboard/reports/financial-summary` | View financial summary | Not Started | - |

### Customers & Tables

| URL (Route) | Test Scenario | Status | Last Run |
|-------------|---------------|--------|----------|
| `/dashboard/customers` | Manage customers (CRUD, points) | Not Started | - |
| `/dashboard/tables` | Manage tables (status, location) | Not Started | - |
| `/dashboard/tokens` | Manage order tokens | Not Started | - |

### Website Management (NEW)

| URL (Route) | Test Scenario | Status | Last Run |
|-------------|---------------|--------|----------|
| `/dashboard/website` | Hero Slides tab - CRUD operations | Not Started | - |
| `/dashboard/website` | Advantages tab - CRUD operations | Not Started | - |
| `/dashboard/website` | About tab - edit content | Not Started | - |
| `/dashboard/website` | Testimonials tab - CRUD operations | Not Started | - |
| `/dashboard/website` | Contact & Social tab - edit settings | Not Started | - |
| `/dashboard/website` | Newsletter tab - settings | Not Started | - |

### Blog Management (NEW)

| URL (Route) | Test Scenario | Status | Last Run |
|-------------|---------------|--------|----------|
| `/dashboard/blog` | List blog posts with search | Not Started | - |
| `/dashboard/blog` | Create new blog post | Not Started | - |
| `/dashboard/blog` | Edit existing blog post | Not Started | - |
| `/dashboard/blog` | Delete blog post | Not Started | - |

### Reservations Management (NEW)

| URL (Route) | Test Scenario | Status | Last Run |
|-------------|---------------|--------|----------|
| `/dashboard/reservations` | List reservations with status filter | Not Started | - |
| `/dashboard/reservations` | Update reservation status | Not Started | - |

### Partners (NEW)

| URL (Route) | Test Scenario | Status | Last Run |
|-------------|---------------|--------|----------|
| `/dashboard/partners` | List partner logos | Not Started | - |
| `/dashboard/partners` | CRUD partner entries | Not Started | - |

### Contact Messages (NEW)

| URL (Route) | Test Scenario | Status | Last Run |
|-------------|---------------|--------|----------|
| `/dashboard/contact-messages` | List contact messages | Not Started | - |
| `/dashboard/contact-messages` | Reply and manage messages | Not Started | - |

### Data Management (NEW)

| URL (Route) | Test Scenario | Status | Last Run |
|-------------|---------------|--------|----------|
| `/dashboard/data-management` | Export data to Excel | Not Started | - |
| `/dashboard/data-management` | Download export templates | Not Started | - |

---

## Frontend (Customer Website) E2E Scenarios

### Public Pages

| URL (Route) | Test Scenario | Status | Last Run |
|-------------|---------------|--------|----------|
| `/` | Home page renders with hero carousel, advantages | Not Started | - |
| `/menu` | Menu page lists categories and items | Not Started | - |
| `/about` | About page renders content | Not Started | - |
| `/contact` | Contact form submission | Not Started | - |
| `/blog` | Blog listing with pagination | Not Started | - |
| `/blog/:slug` | Individual blog post renders | Not Started | - |
| `/reservation` | Reservation form and submission | Not Started | - |
| `/cart` | Cart shows items, update quantity, remove | Not Started | - |
| `/404` | Not found page renders | Not Started | - |

### Customer Authentication

| URL (Route) | Test Scenario | Status | Last Run |
|-------------|---------------|--------|----------|
| `/login` | Customer login with email/phone + password | Not Started | - |
| `/register` | Customer registration flow | Not Started | - |
| `/forgot-password` | Password reset OTP flow | Not Started | - |

### Customer Protected Routes

| URL (Route) | Test Scenario | Status | Last Run |
|-------------|---------------|--------|----------|
| `/checkout` | Complete checkout with cart items | Not Started | - |
| `/orders` | View order history list | Not Started | - |
| `/orders/:id` | View single order details | Not Started | - |
| `/profile` | View and edit customer profile | Not Started | - |

### Complex User Flows

| Flow | Test Scenario | Status | Last Run |
|------|---------------|--------|----------|
| Menu→Cart→Checkout | Complete purchase flow (browse, add to cart, checkout) | Not Started | - |
| Auth→Checkout | Redirect to login, authenticate, return to checkout | Not Started | - |

---

## Prerequisites & Setup

### Recommended Setup

1. **Install Playwright** in both apps:
   ```bash
   cd dashboard && npm install --save-dev @playwright/test
   cd frontend && npm install --save-dev @playwright/test
   ```

2. **Create playwright.config.ts** for each app

3. **Directory structure:**
   ```
   dashboard/e2e/   # Dashboard test files
   frontend/e2e/    # Frontend test files
   ```

4. **Add scripts to package.json:**
   ```json
   "test:e2e": "playwright test",
   "test:e2e:ui": "playwright test --ui"
   ```

### Running Tests

- Backend must be running on `http://localhost:3000`
- Dashboard dev server on `http://localhost:5174`
- Frontend dev server on `http://localhost:5173`

---

## Status Legend

| Status | Meaning |
|--------|---------|
| Not Started | Test not yet implemented |
| In Progress | Test currently being developed |
| Complete | Test implemented and passing |
| Skipped | Test exists but skipped |
| Blocked | Cannot implement due to dependency |

---

## Execution Log

| Date | Items Processed | Pass | Fail | Notes |
|------|-----------------|------|------|-------|
| 2026-02-15 | Audit only | - | - | Infrastructure audit, route discovery |

## Changelog

- 2026-02-15: Complete rewrite. Added frontend customer website routes (18 new). Added dashboard new modules (website, blog, reservations, partners, contact, data mgmt). Total scenarios: 75.
- 2026-02-10: Initial file with 40 dashboard-only scenarios.
