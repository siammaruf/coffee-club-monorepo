# API Integration: CoffeeClub

## Overview

This document maps frontend routes to their corresponding API endpoints for both applications.

- **Dashboard** (`dashboard/`): Admin panel for staff, uses React Router v7 + Redux Toolkit + Axios
- **Frontend** (`frontend/`): Customer-facing website, uses React Router + Zustand + fetch/Axios
- **API Base**: `http://localhost:5000/api/v1`

---

## Dashboard Routes -> API Mapping

### Auth Pages (no auth)

| Route | Component | APIs Used | Status |
|-------|-----------|-----------|--------|
| `/login` | pages/auth/login.tsx | `POST /auth/login` | Complete |
| `/auth/forgot-password` | pages/auth/forgot-password.tsx | `POST /auth/forgot-password` | Complete |
| `/auth/verify-otp` | pages/auth/verify-otp.tsx | `POST /auth/verify-otp` | Complete |
| `/auth/reset-password` | pages/auth/reset-password.tsx | `POST /auth/reset-password` | Complete |

### Dashboard Home

| Route | Component | APIs Used | Status |
|-------|-----------|-----------|--------|
| `/dashboard` | dashboard/index.tsx | Various summary APIs | Complete |
| `/dashboard/profile` | dashboard/profile.tsx | `GET /auth/me`, `PUT /users/:id` | Complete |

### Employee Management

| Route | Component | APIs Used | Status |
|-------|-----------|-----------|--------|
| `/dashboard/employees` | employees/index.tsx | `GET /users` | Complete |
| `/dashboard/employees/create` | employees/create.tsx | `POST /users` | Complete |
| `/dashboard/employees/edit/:id` | employees/edit.tsx | `GET /users/:id`, `PUT /users/:id` | Complete |
| `/dashboard/employees/:id` | employees/details.tsx | `GET /users/:id` | Complete |

### Product Management

| Route | Component | APIs Used | Status |
|-------|-----------|-----------|--------|
| `/dashboard/products` | products/index.tsx | `GET /items` | Complete |
| `/dashboard/products/create` | products/create.tsx | `POST /items` | Complete |
| `/dashboard/products/edit/:id` | products/edit.tsx | `GET /items/:id`, `PUT /items/:id` | Complete |
| `/dashboard/products/:id` | products/details.tsx | `GET /items/:id` | Complete |

### Order Management

| Route | Component | APIs Used | Status |
|-------|-----------|-----------|--------|
| `/dashboard/orders` | orders/index.tsx | `GET /orders` | Complete |
| `/dashboard/orders/create` | orders/create.tsx | `POST /orders` | Complete |
| `/dashboard/orders/edit/:id` | orders/edit.tsx | `GET /orders/:id`, `PUT /orders/:id` | Complete |
| `/dashboard/orders/:id` | orders/details.tsx | `GET /orders/:id` | Complete |

### Kitchen Management

| Route | Component | APIs Used | Status |
|-------|-----------|-----------|--------|
| `/dashboard/kitchen-orders` | kitchen-order/index.tsx | `GET /kitchen-orders` | Complete |
| `/dashboard/kitchen-order/create` | kitchen-order/create.tsx | `POST /kitchen-orders` | Complete |
| `/dashboard/kitchen-order/edit/:id` | kitchen-order/edit.tsx | `PUT /kitchen-orders/:id` | Complete |
| `/dashboard/kitchen-order/:id` | kitchen-order/details.tsx | `GET /kitchen-orders/:id` | Complete |
| `/dashboard/kitchen-items` | kitchen-items/index.tsx | `GET /kitchen-items` | Complete |
| `/dashboard/kitchen-stock` | kitchen-stock/index.tsx | `GET /kitchen-stock` | Complete |

### Salary & HR

| Route | Component | APIs Used | Status |
|-------|-----------|-----------|--------|
| `/dashboard/salary` | salary/index.tsx | `GET /staff-salary` | Complete |
| `/dashboard/salary/create` | salary/create.tsx | `POST /staff-salary` | Complete |
| `/dashboard/attendance` | attendance/index.tsx | `GET /stuff-attendance` | Complete |

### Finance & Reporting

| Route | Component | APIs Used | Status |
|-------|-----------|-----------|--------|
| `/dashboard/expenses` | expenses/index.tsx | `GET /expenses` | Complete |
| `/dashboard/expenses/categories` | expense-categories/index.tsx | `GET /expense-categories` | Complete |
| `/dashboard/discounts` | discount/index.tsx | `GET /discounts` | Complete |
| `/dashboard/reports/sales` | reports/sales.tsx | `GET /reports` | Complete |
| `/dashboard/reports/inventory` | reports/inventory.tsx | `GET /reports` | Complete |
| `/dashboard/reports/financial-summary` | reports/financialSummary.tsx | `GET /reports` | Complete |

### Other Dashboard Pages

| Route | Component | APIs Used | Status |
|-------|-----------|-----------|--------|
| `/dashboard/categories` | categories/index.tsx | `GET /categories` | Complete |
| `/dashboard/customers` | customers/index.tsx | `GET /customers` | Complete |
| `/dashboard/tables` | tables/index.tsx | `GET /tables` | Complete |
| `/dashboard/tokens` | tokens/index.tsx | `GET /order-tokens` | Complete |

---

## Frontend (Customer Website) Routes -> API Mapping [NEW]

### Public Pages (no auth)

| Route | Component | APIs Used | Status |
|-------|-----------|-----------|--------|
| `/` | pages/Home | `GET /public/categories`, `GET /public/items` | Planned |
| `/menu` | pages/Menu | `GET /public/categories`, `GET /public/items` | Planned |
| `/menu/:id` | pages/ItemDetail | `GET /public/items/:id` | Planned |
| `/about` | pages/About | - | Planned |
| `/contact` | pages/Contact | - | Planned |

### Customer Auth Pages (no auth)

| Route | Component | APIs Used | Status |
|-------|-----------|-----------|--------|
| `/login` | pages/Login | `POST /customer-auth/login` | Planned |
| `/register` | pages/Register | `POST /customer-auth/register` | Planned |
| `/forgot-password` | pages/ForgotPassword | `POST /customer-auth/forgot-password` | Planned |
| `/verify-otp` | pages/VerifyOtp | `POST /customer-auth/verify-otp` | Planned |
| `/reset-password` | pages/ResetPassword | `POST /customer-auth/reset-password` | Planned |

### Customer Protected Pages (customer auth required)

| Route | Component | APIs Used | Status |
|-------|-----------|-----------|--------|
| `/cart` | pages/Cart | `GET /cart`, `PUT /cart/items/:id`, `DELETE /cart/items/:id` | Planned |
| `/checkout` | pages/Checkout | `POST /customer-orders` | Planned |
| `/orders` | pages/Orders | `GET /customer-orders` | Planned |
| `/orders/:id` | pages/OrderDetail | `GET /customer-orders/:id` | Planned |
| `/account` | pages/Account | `GET /customer-auth/me` | Planned |

---

## Dashboard API Service Files

| Service | Location | Methods |
|---------|----------|---------|
| HttpService | `app/services/httpService.ts` | Base Axios client (get, post, put, delete, patch) |
| authService | `app/services/httpServices/authService.ts` | login, forgotPassword, verifyOTP, resetPassword, checkAuthStatus, logout |
| userService | `app/services/httpServices/userService.ts` | User CRUD operations |
| categoryService | `app/services/httpServices/categoryService.ts` | Category CRUD |
| productService | `app/services/httpServices/productService.ts` | Product/Item CRUD |
| orderService | `app/services/httpServices/orderService.ts` | Order CRUD |
| salaryService | `app/services/httpServices/salaryService.ts` | Salary CRUD |
| expenseService | `app/services/httpServices/expenseService.ts` | Expense CRUD |
| expenseCategory | `app/services/httpServices/expenseCategory.ts` | Expense Category CRUD |
| reportService | `app/services/httpServices/reportService.ts` | Reports |
| customerService | `app/services/httpServices/customerService.ts` | Customer CRUD |
| attendanceService | `app/services/httpServices/attendanceService.ts` | Attendance CRUD |
| discountService | `app/services/httpServices/discountService.ts` | Discount CRUD |
| discountApplicationService | `app/services/httpServices/discountApplicationService.ts` | Discount Application CRUD |
| kitchenItemsService | `app/services/httpServices/kitchenItemsService.ts` | Kitchen Items CRUD |
| kitchenOrderService | `app/services/httpServices/kitchenOrderService.ts` | Kitchen Order CRUD |
| kitchenStockService | `app/services/httpServices/kitchenStockService.ts` | Kitchen Stock CRUD |
| tableService | `app/services/httpServices/tableService.ts` | Table management |

## Frontend (Customer) API Service Files [NEW]

| Service | Location | Methods |
|---------|----------|---------|
| apiClient | `src/services/apiClient.ts` | Base HTTP client (Axios or fetch) |
| publicService | `src/services/publicService.ts` | getCategories, getItems, getItemById, getTables |
| customerAuthService | `src/services/customerAuthService.ts` | register, login, logout, me, forgotPassword, verifyOtp, resetPassword |
| cartService | `src/services/cartService.ts` | getCart, addItem, updateItem, removeItem, clearCart |
| customerOrderService | `src/services/customerOrderService.ts` | placeOrder, getOrders, getOrderById, cancelOrder |

## Frontend (Customer) Zustand Stores [NEW]

| Store | Location | State |
|-------|----------|-------|
| authStore | `src/store/authStore.ts` | customer, isAuthenticated, login, logout, checkAuth |
| cartStore | `src/store/cartStore.ts` | items, total, addItem, removeItem, updateQuantity, clearCart |
| menuStore | `src/store/menuStore.ts` | categories, items, selectedCategory, filters |

---

## Integration Configuration

### Dashboard (Axios)
```typescript
// dashboard/app/services/httpService.ts
const httpService = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,  // CRITICAL: sends httpOnly cookies
  headers: { 'Content-Type': 'application/json' }
});
```

### Frontend (Customer)
```typescript
// frontend/src/services/apiClient.ts
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,  // CRITICAL: sends httpOnly cookies
  headers: { 'Content-Type': 'application/json' }
});
```

### Key Integration Notes
- Both apps use `withCredentials: true` for httpOnly cookie auth
- Dashboard uses Redux async thunks for auth state
- Frontend uses Zustand stores for auth and cart state
- File uploads use `Content-Type: multipart/form-data` (Axios auto-sets boundary)
- All responses follow the standard wrapper format: `{ data, status, message, statusCode, timestamp }`

---

## Integration Checklist

### Dashboard
- [x] Axios instance configured with `withCredentials: true`
- [x] Request interceptor (Content-Type handling, FormData support)
- [x] Response interceptor (error handling)
- [x] Redux async thunks for auth actions
- [ ] Token refresh interceptor (auto-retry on 401)

### Frontend (Customer)
- [ ] API client configured with `withCredentials: true`
- [ ] Zustand auth store with persist
- [ ] Zustand cart store (synced with backend)
- [ ] Public API services (categories, items)
- [ ] Customer auth services (register, login, OTP)
- [ ] Cart services (add, update, remove)
- [ ] Order services (place, history, cancel)
- [ ] Error handling interceptor
