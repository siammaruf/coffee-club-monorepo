# API Reference: CoffeeClub

## Base URL

- **Development**: `http://localhost:5000/api/v1`
- **Swagger Docs**: `http://localhost:5000/api/v1/docs`

## Response Format

All responses are wrapped by the global `TransformInterceptor`:

```json
{
  "data": {},
  "status": true,
  "message": "Success",
  "statusCode": 200,
  "timestamp": "2026-02-11T12:00:00.000Z"
}
```

## Authentication

This API uses **httpOnly cookie-based JWT authentication** for both staff and customers.

**Staff Auth Flow:**
1. `POST /auth/login` with email + password
2. Backend sets `accessToken` and `refreshToken` as httpOnly cookies
3. All subsequent requests automatically include cookies
4. Frontend uses `withCredentials: true` in axios config

**Auth Levels:**
- **Public** - No auth required (decorated with `@Public()`)
- **Auth** - Valid JWT required (JwtAuthGuard)
- **Auth + Role** - JWT + specific role (RolesGuard with `@Roles()`)
- **Customer Auth** - Customer JWT required

---

## Staff Auth Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/login` | Staff login (sets cookies) | Public |
| POST | `/auth/refresh-token` | Refresh access token | Public |
| POST | `/auth/forgot-password` | Request password reset OTP | Public |
| POST | `/auth/verify-otp` | Verify OTP code | Public |
| POST | `/auth/reset-password` | Reset password with verified token | Public |
| GET | `/auth/me` | Get current authenticated user | Auth |
| POST | `/auth/logout` | Logout (clears cookies) | Auth |

## Customer Auth Endpoints [NEW]

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/customer-auth/register` | Customer registration | Public |
| POST | `/customer-auth/login` | Customer login (sets cookies) | Public |
| POST | `/customer-auth/logout` | Customer logout (clears cookies) | Customer Auth |
| GET | `/customer-auth/me` | Get current customer profile | Customer Auth |
| POST | `/customer-auth/forgot-password` | Request password reset OTP | Public |
| POST | `/customer-auth/verify-otp` | Verify OTP code | Public |
| POST | `/customer-auth/reset-password` | Reset password | Public |

## Public Endpoints [NEW]

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/public/categories` | List all active categories | Public |
| GET | `/public/items` | List all available items (with filters) | Public |
| GET | `/public/items/:id` | Get item detail by ID | Public |
| GET | `/public/tables` | List all tables with availability | Public |

## Users (Staff Management)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users` | List all users | Auth |
| GET | `/users/:id` | Get user by ID | Auth |
| POST | `/users` | Create user (multipart: picture, NID images) | Auth + Admin |
| PUT | `/users/:id` | Update user | Auth + Admin |
| DELETE | `/users/:id` | Delete user | Auth + Admin |

## Customers

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/customers` | List all customers | Auth |
| GET | `/customers/:id` | Get customer by ID | Auth |
| POST | `/customers` | Create customer | Auth |
| PUT | `/customers/:id` | Update customer | Auth |
| DELETE | `/customers/:id` | Delete customer | Auth + Admin |

## Categories

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/categories` | List all categories | Auth |
| GET | `/categories/:id` | Get category by ID | Auth |
| POST | `/categories` | Create category (with icon upload) | Auth + Admin |
| PUT | `/categories/:id` | Update category | Auth + Admin |
| DELETE | `/categories/:id` | Delete category | Auth + Admin |

## Items (Products)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/items` | List all items | Auth |
| GET | `/items/:id` | Get item by ID | Auth |
| POST | `/items` | Create item (with image upload) | Auth + Admin |
| PUT | `/items/:id` | Update item | Auth + Admin |
| DELETE | `/items/:id` | Delete item | Auth + Admin |

## Orders (POS)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/orders` | List all orders (with filters) | Auth |
| GET | `/orders/:id` | Get order by ID (with items, tables, customer) | Auth |
| POST | `/orders` | Create order | Auth |
| PUT | `/orders/:id` | Update order (status, items, payment) | Auth |
| DELETE | `/orders/:id` | Delete/cancel order | Auth + Admin |

## Order Items

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/order-items` | List order items | Auth |
| GET | `/order-items/:id` | Get order item by ID | Auth |
| POST | `/order-items` | Add item to order | Auth |
| PUT | `/order-items/:id` | Update order item | Auth |
| DELETE | `/order-items/:id` | Remove item from order | Auth |

## Order Tokens

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/order-tokens` | List order tokens | Auth |
| GET | `/order-tokens/:id` | Get token by ID | Auth |
| POST | `/order-tokens` | Create order token | Auth |
| PUT | `/order-tokens/:id` | Update token | Auth |
| DELETE | `/order-tokens/:id` | Delete token | Auth |

## Tables

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/tables` | List all tables | Auth |
| GET | `/tables/:id` | Get table by ID | Auth |
| POST | `/tables` | Create table | Auth + Admin |
| PUT | `/tables/:id` | Update table (status, details) | Auth |
| DELETE | `/tables/:id` | Delete table | Auth + Admin |

## Discounts

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/discounts` | List all discounts | Auth |
| GET | `/discounts/:id` | Get discount by ID | Auth |
| POST | `/discounts` | Create discount | Auth + Admin |
| PUT | `/discounts/:id` | Update discount | Auth + Admin |
| DELETE | `/discounts/:id` | Delete discount | Auth + Admin |

## Discount Applications

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/discount-applications` | List discount usage records | Auth |
| POST | `/discount-applications` | Apply discount to order | Auth |

## Expenses

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/expenses` | List all expenses | Auth |
| GET | `/expenses/:id` | Get expense by ID | Auth |
| POST | `/expenses` | Create expense | Auth + Admin |
| PUT | `/expenses/:id` | Update expense | Auth + Admin |
| DELETE | `/expenses/:id` | Delete expense | Auth + Admin |

## Expense Categories

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/expense-categories` | List expense categories | Auth |
| GET | `/expense-categories/:id` | Get expense category by ID | Auth |
| POST | `/expense-categories` | Create expense category | Auth + Admin |
| PUT | `/expense-categories/:id` | Update expense category | Auth + Admin |
| DELETE | `/expense-categories/:id` | Delete expense category | Auth + Admin |

## Staff Salary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/staff-salary` | List salary records | Auth |
| GET | `/staff-salary/:id` | Get salary record by ID | Auth |
| POST | `/staff-salary` | Create salary record | Auth + Admin |
| PUT | `/staff-salary/:id` | Update salary record | Auth + Admin |
| DELETE | `/staff-salary/:id` | Delete salary record | Auth + Admin |

## Staff Attendance

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/stuff-attendance` | List attendance records | Auth |
| GET | `/stuff-attendance/:id` | Get attendance by ID | Auth |
| POST | `/stuff-attendance` | Record attendance | Auth |
| PUT | `/stuff-attendance/:id` | Update attendance | Auth |
| DELETE | `/stuff-attendance/:id` | Delete attendance | Auth + Admin |

## Staff Leave

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/stuff-leave` | List leave records | Auth |
| GET | `/stuff-leave/:id` | Get leave by ID | Auth |
| POST | `/stuff-leave` | Request leave | Auth |
| PUT | `/stuff-leave/:id` | Update leave (approve/reject) | Auth + Admin |
| DELETE | `/stuff-leave/:id` | Delete leave record | Auth + Admin |

## Banks

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/banks` | List bank accounts | Auth |
| GET | `/banks/:id` | Get bank by ID | Auth |
| POST | `/banks` | Add bank account | Auth + Admin |
| PUT | `/banks/:id` | Update bank account | Auth + Admin |
| DELETE | `/banks/:id` | Delete bank account | Auth + Admin |

## Kitchen Items

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/kitchen-items` | List kitchen items | Auth |
| GET | `/kitchen-items/:id` | Get kitchen item by ID | Auth |
| POST | `/kitchen-items` | Create kitchen item | Auth |
| PUT | `/kitchen-items/:id` | Update kitchen item | Auth |
| DELETE | `/kitchen-items/:id` | Delete kitchen item | Auth |

## Kitchen Orders

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/kitchen-orders` | List kitchen orders | Auth |
| GET | `/kitchen-orders/:id` | Get kitchen order by ID | Auth |
| POST | `/kitchen-orders` | Create kitchen order | Auth |
| PUT | `/kitchen-orders/:id` | Update kitchen order (status) | Auth |
| DELETE | `/kitchen-orders/:id` | Delete kitchen order | Auth |

## Kitchen Stock

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/kitchen-stock` | List kitchen stock | Auth |
| GET | `/kitchen-stock/:id` | Get stock entry by ID | Auth |
| POST | `/kitchen-stock` | Add stock entry | Auth |
| PUT | `/kitchen-stock/:id` | Update stock entry | Auth |
| DELETE | `/kitchen-stock/:id` | Delete stock entry | Auth |

## Reports

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/reports` | Get reports (with date filters) | Auth |
| POST | `/reports` | Generate report | Auth + Admin |

## Cart [NEW]

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/cart` | Get customer's cart with items | Customer Auth |
| POST | `/cart/items` | Add item to cart | Customer Auth |
| PUT | `/cart/items/:id` | Update cart item quantity | Customer Auth |
| DELETE | `/cart/items/:id` | Remove item from cart | Customer Auth |
| DELETE | `/cart` | Clear entire cart | Customer Auth |

## Customer Orders [NEW]

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/customer-orders` | Place order from cart | Customer Auth |
| GET | `/customer-orders` | Get customer's order history | Customer Auth |
| GET | `/customer-orders/:id` | Get order detail | Customer Auth |
| PUT | `/customer-orders/:id/cancel` | Cancel pending order | Customer Auth |

---

## Request/Response Examples

### Staff Login

**Request:**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@coffeeclub.com",
  "password": "password123"
}
```

**Response (200):** Sets httpOnly cookies + returns user data
```json
{
  "data": {
    "id": "uuid-here",
    "first_name": "Admin",
    "last_name": "User",
    "email": "admin@coffeeclub.com",
    "role": "ADMIN"
  },
  "status": true,
  "message": "Login successful",
  "statusCode": 200,
  "timestamp": "2026-02-11T12:00:00.000Z"
}
```

### Customer Registration [NEW]

**Request:**
```http
POST /api/v1/customer-auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "01700000000",
  "email": "john@example.com",
  "password": "securePass123"
}
```

### Create Order (POS)

**Request:**
```http
POST /api/v1/orders
Content-Type: application/json

{
  "order_type": "DINEIN",
  "order_source": "pos",
  "table_ids": ["table-uuid"],
  "customer_id": "customer-uuid",
  "items": [
    { "item_id": "item-uuid", "quantity": 2 }
  ],
  "discount_id": "discount-uuid",
  "payment_method": "CASH"
}
```

### Place Customer Order [NEW]

**Request:**
```http
POST /api/v1/customer-orders
Content-Type: application/json

{
  "order_type": "DELIVERY",
  "delivery_address": "123 Main St",
  "special_instructions": "Extra sugar please",
  "customer_phone": "01700000000"
}
```

### File Upload (Create User)

**Request:**
```http
POST /api/v1/users
Content-Type: multipart/form-data

picture: [file]
nid_front_picture: [file]
nid_back_picture: [file]
first_name: John
last_name: Doe
email: john@coffeeclub.com
phone: 01700000000
role: STUFF
base_salary: 15000
```

---

## Enums

| Enum | Values |
|------|--------|
| User Role | `ADMIN`, `MANAGER`, `STUFF` |
| User Status | `ACTIVE`, `INACTIVE` |
| Item Type | `BAR`, `KITCHEN` |
| Item Status | `AVAILABLE`, `UNAVAILABLE` |
| Order Type | `DINEIN`, `TAKEAWAY`, `DELIVERY` |
| Order Status | `PENDING`, `PREPARING`, `COMPLETED`, `CANCELLED` |
| Order Source | `pos`, `web` |
| Payment Method | `CASH`, `BKASH`, `BANK`, `OTHER` |
| Table Status | `AVAILABLE`, `OCCUPIED`, `RESERVED`, `OUT_OF_SERVICE` |
| Discount Type | `PERCENTAGE`, `FIXED` |

## Error Responses

| Status | Description |
|--------|-------------|
| 400 | Bad Request - Validation failed (class-validator) |
| 401 | Unauthorized - Invalid/missing/expired JWT |
| 403 | Forbidden - Insufficient role permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate entry (unique constraint) |
| 500 | Internal Server Error |

Error response format:
```json
{
  "data": null,
  "status": false,
  "message": "Validation failed",
  "statusCode": 400,
  "timestamp": "2026-02-11T12:00:00.000Z"
}
```
