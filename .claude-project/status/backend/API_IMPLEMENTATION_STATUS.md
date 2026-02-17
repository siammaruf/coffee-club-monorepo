# API Implementation Status: CoffeeClub Backend

> **Backend Framework:** NestJS 11 + TypeORM + PostgreSQL
> **Last Updated:** 2026-02-15
> **Total Endpoints:** ~210 across 35 controllers
> **Swagger Coverage:** 100% (all endpoints have @ApiTags + @ApiOperation)

---

## Quick Summary

| Category | Modules | Endpoints | Swagger | Status |
|----------|---------|-----------|---------|--------|
| Authentication | Auth, Customer Auth | 17 | Yes | Complete |
| Public (Unauthenticated) | Public | 11 | Yes | Complete |
| Customer (Customer JWT) | Cart, Orders, Reservations | 10 | Yes | Complete |
| Menu & Products | Items, Categories | 14 | Yes | Complete |
| Order Management | Orders, Order Items, Order Tokens, Discounts, Discount Applications | 27 | Yes | Complete |
| Customer Management | Customers | 14 | Yes | Complete |
| Kitchen | Kitchen Items, Kitchen Stock, Kitchen Orders | 19 | Yes | Complete |
| HR & Staff | Users, Staff Salary, Attendance, Banks, Leaves | 41 | Yes | Complete |
| Finance & Reports | Expenses, Expense Categories, Sales Reports, Activities | 31 | Yes | Complete |
| Website & Content | Website Content, Blog, Partners, Contact Messages, Settings | 24 | Yes | Complete |
| Data Management | Export | 3 | Yes | Complete |
| System | App Root | 2 | Yes | Complete |
| **Total** | **35 controllers** | **~210** | **100%** | **Complete** |

---

## Authentication

### Auth Module - `/auth`
Auth: All @Public except GET /me

| Endpoint | Method | Auth | Swagger | Notes |
|----------|--------|------|---------|-------|
| `/auth/login` | POST | Public | Yes | LoginDto, sets httpOnly cookies |
| `/auth/logout` | POST | Public | Yes | Clears cookies |
| `/auth/forgot-password` | POST | Public | Yes | ForgotPasswordDto, sends OTP |
| `/auth/reset-password` | POST | Public | Yes | ResetPasswordDto |
| `/auth/verify-reset-token` | POST | Public | Yes | VerifyTokenDto |
| `/auth/verify-otp` | POST | Public | Yes | VerifyOtpDto |
| `/auth/new-user-password` | POST | Public | Yes | NewUserPasswordDto |
| `/auth/me` | GET | JWT | Yes | Returns current user |

### Customer Auth Module - `/customer-auth`
Auth: Mixed (@Public for register/login/forgot, CustomerJwtAuthGuard for profile)

| Endpoint | Method | Auth | Swagger | Notes |
|----------|--------|------|---------|-------|
| `/customer-auth/register` | POST | Public | Yes | CustomerRegisterDto |
| `/customer-auth/login` | POST | Public | Yes | CustomerLoginDto |
| `/customer-auth/logout` | POST | Customer JWT | Yes | Clears customer cookies |
| `/customer-auth/me` | GET | Customer JWT | Yes | Customer profile |
| `/customer-auth/forgot-password` | POST | Public | Yes | CustomerForgotPasswordDto |
| `/customer-auth/verify-otp` | POST | Public | Yes | CustomerVerifyOtpDto |
| `/customer-auth/reset-password` | POST | Public | Yes | CustomerResetPasswordDto |
| `/customer-auth/profile` | PUT | Customer JWT | Yes | UpdateCustomerProfileDto |
| `/customer-auth/profile/password` | PUT | Customer JWT | Yes | ChangeCustomerPasswordDto |

---

## Public (Unauthenticated)

### Public Module - `/public`
Auth: All @Public

| Endpoint | Method | Auth | Swagger | Notes |
|----------|--------|------|---------|-------|
| `/public/categories` | GET | Public | Yes | Pagination + search |
| `/public/items` | GET | Public | Yes | Pagination + search + categorySlug filter |
| `/public/items/:id` | GET | Public | Yes | Single item |
| `/public/tables` | GET | Public | Yes | Available tables |
| `/public/blog` | GET | Public | Yes | Published posts, pagination |
| `/public/blog/:slug` | GET | Public | Yes | Single post by slug |
| `/public/settings/reservations` | GET | Public | Yes | Reservation availability |
| `/public/reservations` | POST | Public | Yes | CreateReservationDto |
| `/public/website-content` | GET | Public | Yes | Hero slides, advantages, testimonials, settings |
| `/public/contact` | POST | Public | Yes | CreateContactMessageDto |
| `/public/partners` | GET | Public | Yes | Active partner logos |

---

## Customer (Customer JWT Auth)

### Customer Cart - `/customer/cart`
Auth: CustomerJwtAuthGuard

| Endpoint | Method | Auth | Swagger | Notes |
|----------|--------|------|---------|-------|
| `/customer/cart` | GET | Customer JWT | Yes | Get cart with items |
| `/customer/cart/items` | POST | Customer JWT | Yes | AddToCartDto |
| `/customer/cart/items/:id` | PUT | Customer JWT | Yes | UpdateCartItemDto |
| `/customer/cart/items/:id` | DELETE | Customer JWT | Yes | Remove item |
| `/customer/cart` | DELETE | Customer JWT | Yes | Clear entire cart |

### Customer Orders - `/customer/orders`
Auth: CustomerJwtAuthGuard

| Endpoint | Method | Auth | Swagger | Notes |
|----------|--------|------|---------|-------|
| `/customer/orders` | POST | Customer JWT | Yes | CreateCustomerOrderDto |
| `/customer/orders` | GET | Customer JWT | Yes | Pagination |
| `/customer/orders/:id` | GET | Customer JWT | Yes | Single order |
| `/customer/orders/:id/cancel` | PUT | Customer JWT | Yes | Cancel order |

### Customer Reservations - `/customer/reservations`
Auth: CustomerJwtAuthGuard

| Endpoint | Method | Auth | Swagger | Notes |
|----------|--------|------|---------|-------|
| `/customer/reservations` | GET | Customer JWT | Yes | Pagination |

---

## Menu & Products

### Items Module - `/items`
Auth: @Public for GET, Roles(ADMIN, MANAGER, STUFF, BARISTA) for mutations

| Endpoint | Method | Auth | Swagger | Notes |
|----------|--------|------|---------|-------|
| `/items` | GET | Public | Yes | Pagination + search + categorySlug |
| `/items/:id` | GET | JWT | Yes | Single item |
| `/items/slug/:slug` | GET | JWT | Yes | Find by slug |
| `/items` | POST | JWT (Roles) | Yes | CreateItemDto + image upload |
| `/items/:id` | PUT | JWT (Roles) | Yes | UpdateItemDto + image upload |
| `/items/:id/upload-image` | POST | JWT (Roles) | Yes | FileInterceptor |
| `/items/:id/remove-image` | DELETE | JWT (Roles) | Yes | Remove item image |
| `/items/:id` | DELETE | JWT (Roles) | Yes | Delete item |

### Categories Module - `/categories`
Auth: @Public for GET, Roles(ADMIN, MANAGER, STUFF, BARISTA) for mutations

| Endpoint | Method | Auth | Swagger | Notes |
|----------|--------|------|---------|-------|
| `/categories` | POST | JWT (Roles) | Yes | CreateCategoryDto |
| `/categories` | GET | Public | Yes | Pagination + search |
| `/categories/:id` | GET | JWT | Yes | Single category |
| `/categories/slug/:slug` | GET | JWT | Yes | Find by slug |
| `/categories/:id` | PATCH | JWT (Roles) | Yes | UpdateCategoryDto |
| `/categories/:id` | DELETE | JWT (Roles) | Yes | Delete category |

---

## Order Management

### Orders Module - `/orders`
Auth: Roles(ADMIN, MANAGER, STUFF, BARISTA)

| Endpoint | Method | Auth | Swagger | Notes |
|----------|--------|------|---------|-------|
| `/orders` | GET | JWT (Roles) | Yes | Pagination + search + dateFilter |
| `/orders` | POST | JWT (Roles) | Yes | CreateOrderDto |
| `/orders/:id` | PUT | JWT (Roles) | Yes | UpdateOrderDto |
| `/orders/:id` | GET | JWT (Roles) | Yes | Single order |
| `/orders/:id` | DELETE | JWT (Roles) | Yes | Delete order |

### Order Items - `/order-items`
Auth: Roles(ADMIN, MANAGER, STUFF, BARISTA)

| Endpoint | Method | Auth | Swagger | Notes |
|----------|--------|------|---------|-------|
| `/order-items` | POST | JWT (Roles) | Yes | CreateOrderItemDto |
| `/order-items` | GET | JWT (Roles) | Yes | Filter by orderId |
| `/order-items/:id` | GET | JWT (Roles) | Yes | Single item |
| `/order-items/:id` | PATCH | JWT (Roles) | Yes | UpdateOrderItemDto |
| `/order-items/:id` | DELETE | JWT (Roles) | Yes | Delete item |

### Order Tokens - `/order-tokens`
Auth: Roles(ADMIN, MANAGER, STUFF, BARISTA)

| Endpoint | Method | Auth | Swagger | Notes |
|----------|--------|------|---------|-------|
| `/order-tokens` | POST | JWT (Roles) | Yes | CreateOrderTokenDto |
| `/order-tokens` | GET | JWT (Roles) | Yes | Pagination + search |
| `/order-tokens/:id` | GET | JWT (Roles) | Yes | Single token |
| `/order-tokens/:id` | PATCH | JWT (Roles) | Yes | UpdateOrderTokenDto |
| `/order-tokens/:id` | DELETE | JWT (Roles) | Yes | Delete token |

### Discounts - `/discounts`
Auth: Roles(ADMIN, MANAGER)

| Endpoint | Method | Auth | Swagger | Notes |
|----------|--------|------|---------|-------|
| `/discounts` | POST | JWT (Roles) | Yes | BaseDiscountDto |
| `/discounts` | GET | JWT (Roles) | Yes | Pagination + search |
| `/discounts/not-expired` | GET | JWT (Roles) | Yes | Active discounts only |
| `/discounts/:id` | GET | JWT (Roles) | Yes | Single discount |
| `/discounts/name/:name` | GET | JWT (Roles) | Yes | Find by name |
| `/discounts/:id` | PATCH | JWT (Roles) | Yes | BaseDiscountDto |
| `/discounts/:id` | DELETE | JWT (Roles) | Yes | Delete discount |

### Discount Applications - `/discount-applications`
Auth: Roles(ADMIN, MANAGER, STUFF, BARISTA)

| Endpoint | Method | Auth | Swagger | Notes |
|----------|--------|------|---------|-------|
| `/discount-applications` | POST | JWT (Roles) | Yes | CreateDiscountApplicationDto |
| `/discount-applications` | GET | JWT (Roles) | Yes | List all |
| `/discount-applications/:id` | GET | JWT (Roles) | Yes | Single application |
| `/discount-applications/:id` | PATCH | JWT (Roles) | Yes | UpdateDiscountApplicationDto |
| `/discount-applications/:id` | DELETE | JWT (Roles) | Yes | Delete application |

---

## Customer Management

### Customers Module - `/customers`
Auth: Roles(ADMIN, MANAGER)

| Endpoint | Method | Auth | Swagger | Notes |
|----------|--------|------|---------|-------|
| `/customers` | POST | JWT (Roles) | Yes | CreateCustomerDto + picture upload |
| `/customers` | GET | JWT (Roles) | Yes | Pagination + search + is_active filter |
| `/customers/:id` | GET | JWT (Roles) | Yes | Single customer |
| `/customers/email/:email` | GET | JWT (Roles) | Yes | Find by email |
| `/customers/:id` | PATCH | JWT (Roles) | Yes | UpdateCustomerDto + picture upload |
| `/customers/:id/upload-picture` | POST | JWT (Roles) | Yes | FileInterceptor |
| `/customers/:id/picture` | DELETE | JWT (Roles) | Yes | Remove picture |
| `/customers/:id` | DELETE | JWT (Roles) | Yes | Delete customer |
| `/customers/:id/redeem-points` | POST | JWT (Roles) | Yes | Loyalty points redemption |
| `/customers/:id/balance` | GET | JWT (Roles) | Yes | Points balance |
| `/customers/:id/can-redeem/:amount` | GET | JWT (Roles) | Yes | Check redeemability |
| `/customers/:id/add-points` | POST | JWT (Roles) | Yes | Add points from order |
| `/customers/:id/activate` | PATCH | JWT (Roles) | Yes | Activate customer |
| `/customers/:id/deactivate` | PATCH | JWT (Roles) | Yes | Deactivate customer |

### Tables Module - `/tables`
Auth: Roles(ADMIN, MANAGER)

| Endpoint | Method | Auth | Swagger | Notes |
|----------|--------|------|---------|-------|
| `/tables` | POST | JWT (Roles) | Yes | CreateTableDto |
| `/tables` | GET | JWT (Roles) | Yes | Filter by status, location, search |
| `/tables/available` | GET | JWT (Roles) | Yes | Available tables only |
| `/tables/location/:location` | GET | JWT (Roles) | Yes | By location |
| `/tables/number/:number` | GET | JWT (Roles) | Yes | By table number |
| `/tables/:id` | GET | JWT (Roles) | Yes | Single table |
| `/tables/:id` | PATCH | JWT (Roles) | Yes | UpdateTableDto |
| `/tables/:id/status` | PATCH | JWT (Roles) | Yes | Update status only |
| `/tables/:id` | DELETE | JWT (Roles) | Yes | Delete table |

---

## Kitchen

### Kitchen Items - `/kitchen-items`
Auth: Roles(ADMIN, MANAGER, CHEF)

| Endpoint | Method | Auth | Swagger | Notes |
|----------|--------|------|---------|-------|
| `/kitchen-items` | GET | JWT (Roles) | Yes | Pagination + type filter |
| `/kitchen-items/:id` | GET | JWT (Roles) | Yes | Single item |
| `/kitchen-items` | POST | JWT (Roles) | Yes | CreateKitchenItemDto + image |
| `/kitchen-items/:id` | PATCH | JWT (Roles) | Yes | UpdateKitchenItemDto + image |
| `/kitchen-items/:id` | DELETE | JWT (Roles) | Yes | Delete item |

### Kitchen Stock - `/kitchen-stock`
Auth: Roles(ADMIN, MANAGER, CHEF)

| Endpoint | Method | Auth | Swagger | Notes |
|----------|--------|------|---------|-------|
| `/kitchen-stock` | GET | JWT (Roles) | Yes | Pagination + itemId filter |
| `/kitchen-stock/:id` | GET | JWT (Roles) | Yes | Single stock entry |
| `/kitchen-stock/item/:itemId` | GET | JWT (Roles) | Yes | By item ID |
| `/kitchen-stock` | POST | JWT (Roles) | Yes | CreateKitchenStockDto |
| `/kitchen-stock/:id` | PUT | JWT (Roles) | Yes | UpdateKitchenStockDto |
| `/kitchen-stock/:id/quantity` | PATCH | JWT (Roles) | Yes | Update quantity only |
| `/kitchen-stock/:id` | DELETE | JWT (Roles) | Yes | Delete stock |

### Kitchen Orders - `/kitchen-orders`
Auth: Roles(ADMIN, MANAGER, CHEF)

| Endpoint | Method | Auth | Swagger | Notes |
|----------|--------|------|---------|-------|
| `/kitchen-orders` | GET | JWT (Roles) | Yes | Pagination + kitchenStockId |
| `/kitchen-orders/:id` | GET | JWT (Roles) | Yes | Single order |
| `/kitchen-orders/stock/:stockId` | GET | JWT (Roles) | Yes | By stock ID |
| `/kitchen-orders` | POST | JWT (Roles) | Yes | CreateKitchenOrderDto |
| `/kitchen-orders/:id` | PUT | JWT (Roles) | Yes | UpdateKitchenOrderDto |
| `/kitchen-orders/:id` | DELETE | JWT (Roles) | Yes | Delete order |
| `/kitchen-orders/approve/:id` | PATCH | JWT (Roles) | Yes | Approve order |

---

## HR & Staff

### Users Module - `/users`
Auth: Roles(ADMIN)

| Endpoint | Method | Auth | Swagger | Notes |
|----------|--------|------|---------|-------|
| `/users` | POST | JWT (Admin) | Yes | CreateUserDto + file uploads (picture, nid) |
| `/users` | GET | JWT | Yes | Pagination + search + status + role filter |
| `/users/:id` | GET | JWT | Yes | Single user |
| `/users/email/:email` | GET | JWT | Yes | Find by email |
| `/users/:id` | PATCH | JWT (Admin) | Yes | UpdateUserDto + file uploads |
| `/users/:id/picture` | PATCH | JWT | Yes | Update profile picture |
| `/users/:id/nid-pictures` | PATCH | JWT | Yes | Update NID pictures |
| `/users/:id/deactivate` | PATCH | JWT (Admin) | Yes | Deactivate user |
| `/users/:id/activate` | PATCH | JWT (Admin) | Yes | Activate user |
| `/users/:id/resend-password-reset` | POST | JWT (Admin) | Yes | Resend password reset |
| `/users/:id/change-password` | PATCH | JWT | Yes | ChangePasswordDto |
| `/users/:id/profile-picture` | PATCH | JWT | Yes | Update profile picture |

### Staff Salary - `/staff-salary`
Auth: Roles(ADMIN)

| Endpoint | Method | Auth | Swagger | Notes |
|----------|--------|------|---------|-------|
| `/staff-salary` | POST | JWT (Admin) | Yes | CreateSalaryDto + receipt_image |
| `/staff-salary` | GET | JWT (Admin) | Yes | Filter: user_id, is_paid, dates |
| `/staff-salary/:id` | GET | JWT (Admin) | Yes | Single salary |
| `/staff-salary/:id` | PUT | JWT (Admin) | Yes | UpdateSalaryDto + receipt_image |
| `/staff-salary/:id/mark-as-paid` | POST | JWT (Admin) | Yes | With receipt_image |
| `/staff-salary/:id/mark-as-unpaid` | POST | JWT (Admin) | Yes | Mark unpaid |
| `/staff-salary/user/:userId/history` | GET | JWT (Admin) | Yes | Year filter |
| `/staff-salary/:id` | DELETE | JWT (Admin) | Yes | Delete salary |

### Staff Attendance - `/stuff-attendance`
Auth: Roles(ADMIN, MANAGER, STUFF, BARISTA, CHEF)

| Endpoint | Method | Auth | Swagger | Notes |
|----------|--------|------|---------|-------|
| `/stuff-attendance` | POST | JWT (Roles) | Yes | CreateStuffAttendanceDto |
| `/stuff-attendance` | GET | JWT (Roles) | Yes | Filter: userId, status, dates |
| `/stuff-attendance/:id` | GET | JWT (Roles) | Yes | Single record |
| `/stuff-attendance/:id` | PATCH | JWT (Roles) | Yes | UpdateStuffAttendanceDto |
| `/stuff-attendance/:id` | DELETE | JWT (Roles) | Yes | Delete record |
| `/stuff-attendance/check-in/:userId` | POST | JWT (Roles) | Yes | Check in |
| `/stuff-attendance/check-out/:userId` | POST | JWT (Roles) | Yes | Check out |
| `/stuff-attendance/approve/:id` | POST | JWT (Roles) | Yes | Approve attendance |
| `/stuff-attendance/report/:userId` | GET | JWT (Roles) | Yes | Monthly report (year, month) |

### Banks - `/banks`
Auth: Roles(ADMIN)

| Endpoint | Method | Auth | Swagger | Notes |
|----------|--------|------|---------|-------|
| `/banks/:userId` | POST | JWT (Admin) | Yes | CreateBankDto |
| `/banks/user/:userId` | GET | JWT (Admin) | Yes | By user ID |
| `/banks/:id` | GET | JWT (Admin) | Yes | Single bank |
| `/banks/:id` | PATCH | JWT (Admin) | Yes | UpdateBankDto |
| `/banks/:id` | DELETE | JWT (Admin) | Yes | Delete bank |

### Leaves - `/leaves`
Auth: Roles(ADMIN, MANAGER, STUFF, BARISTA, CHEF)

| Endpoint | Method | Auth | Swagger | Notes |
|----------|--------|------|---------|-------|
| `/leaves` | POST | JWT (Roles) | Yes | CreateLeaveDto |
| `/leaves` | GET | JWT (Roles) | Yes | List all |
| `/leaves/:id` | GET | JWT (Roles) | Yes | Single leave |
| `/leaves/user/:userId` | GET | JWT (Roles) | Yes | By user |
| `/leaves/:id` | PUT | JWT (Roles) | Yes | UpdateLeaveDto |
| `/leaves/:id/status` | PATCH | JWT (Roles) | Yes | Update status |
| `/leaves/:id` | DELETE | JWT (Roles) | Yes | Delete leave |

---

## Finance & Reports

### Expenses - `/expenses`
Auth: Roles(ADMIN, MANAGER)

| Endpoint | Method | Auth | Swagger | Notes |
|----------|--------|------|---------|-------|
| `/expenses` | GET | JWT (Roles) | Yes | Filter: categoryId, status, dateFilter |
| `/expenses/summary` | GET | JWT (Roles) | Yes | Expense summary |
| `/expenses/status/:status` | GET | JWT (Roles) | Yes | By status, paginated |
| `/expenses/:id` | GET | JWT (Roles) | Yes | Single expense |
| `/expenses/category/:categoryId` | GET | JWT (Roles) | Yes | By category |
| `/expenses` | POST | JWT (Roles) | Yes | CreateExpensesDto |
| `/expenses/:id` | PUT | JWT (Roles) | Yes | UpdateExpensesDto |
| `/expenses/status/:id` | PATCH | JWT (Roles) | Yes | Update status |
| `/expenses/bulk/status` | PATCH | JWT (Roles) | Yes | Bulk status update |
| `/expenses/:id` | DELETE | JWT (Roles) | Yes | Delete expense |

### Expense Categories - `/expense-categories`
Auth: Roles(ADMIN, MANAGER)

| Endpoint | Method | Auth | Swagger | Notes |
|----------|--------|------|---------|-------|
| `/expense-categories` | POST | JWT (Roles) | Yes | CreateExpenseCategoryDto + icon |
| `/expense-categories` | GET | JWT (Roles) | Yes | Pagination + search |
| `/expense-categories/:id` | GET | JWT (Roles) | Yes | Single category |
| `/expense-categories/slug/:slug` | GET | JWT (Roles) | Yes | By slug |
| `/expense-categories/:id` | PUT | JWT (Roles) | Yes | UpdateExpenseCategoryDto + icon |
| `/expense-categories/:id` | DELETE | JWT (Roles) | Yes | Delete category |

### Sales Reports - `/sales-reports`
Auth: Roles(ADMIN, MANAGER)

| Endpoint | Method | Auth | Swagger | Notes |
|----------|--------|------|---------|-------|
| `/sales-reports/financial-summary` | GET | JWT (Roles) | Yes | Financial overview |
| `/sales-reports/kitchen-report` | GET | JWT (Roles) | Yes | Filter: type, dates |
| `/sales-reports/generate` | POST | JWT (Roles) | Yes | GenerateReportDto |
| `/sales-reports/regenerate/:date` | POST | JWT (Roles) | Yes | Regenerate by date |
| `/sales-reports` | GET | JWT (Roles) | Yes | Paginated list |
| `/sales-reports/by-date/:date` | GET | JWT (Roles) | Yes | By date |
| `/sales-reports/filtered-summary` | GET | JWT (Roles) | Yes | With date/type filters |
| `/sales-reports/dashboard` | GET | JWT (Roles) | Yes | Dashboard data |
| `/sales-reports/:id` | GET | JWT (Roles) | Yes | Single report |
| `/sales-reports/:id` | DELETE | JWT (Roles) | Yes | Delete report |
| `/sales-reports/charts/sales-progress` | GET | JWT (Roles) | Yes | Sales chart data |
| `/sales-reports/charts/expenses` | GET | JWT (Roles) | Yes | Expense chart data |

### Activities - `/activities`
Auth: Roles(ADMIN, MANAGER)

| Endpoint | Method | Auth | Swagger | Notes |
|----------|--------|------|---------|-------|
| `/activities` | POST | JWT (Roles) | Yes | CreateActivityDto |
| `/activities` | GET | JWT (Roles) | Yes | Filter: type, entity, user, dates |
| `/activities/stats` | GET | JWT (Roles) | Yes | Activity statistics |
| `/activities/entity/:entityType/:entityId` | GET | JWT (Roles) | Yes | By entity |
| `/activities/:id` | GET | JWT (Roles) | Yes | Single activity |

---

## Website & Content Management

### Website Content - `/website-content`
Auth: Roles(ADMIN)

| Endpoint | Method | Auth | Swagger | Notes |
|----------|--------|------|---------|-------|
| `/website-content/hero-slides` | GET | JWT (Admin) | Yes | Pagination + search |
| `/website-content/hero-slides` | POST | JWT (Admin) | Yes | CreateHeroSlideDto |
| `/website-content/hero-slides/:id` | PUT | JWT (Admin) | Yes | UpdateHeroSlideDto |
| `/website-content/hero-slides/:id` | DELETE | JWT (Admin) | Yes | Delete slide |
| `/website-content/advantages` | GET | JWT (Admin) | Yes | Pagination + search |
| `/website-content/advantages` | POST | JWT (Admin) | Yes | CreateAdvantageDto |
| `/website-content/advantages/:id` | PUT | JWT (Admin) | Yes | UpdateAdvantageDto |
| `/website-content/advantages/:id` | DELETE | JWT (Admin) | Yes | Delete advantage |
| `/website-content/testimonials` | GET | JWT (Admin) | Yes | Pagination + search |
| `/website-content/testimonials` | POST | JWT (Admin) | Yes | CreateTestimonialDto |
| `/website-content/testimonials/:id` | PUT | JWT (Admin) | Yes | UpdateTestimonialDto |
| `/website-content/testimonials/:id` | DELETE | JWT (Admin) | Yes | Delete testimonial |
| `/website-content/settings` | GET | JWT (Admin) | Yes | All website settings |
| `/website-content/settings` | PUT | JWT (Admin) | Yes | Update settings |
| `/website-content/upload-image` | POST | JWT (Admin) | Yes | Image upload (5MB max) |

### Blog - `/blog`
Auth: Roles(ADMIN)

| Endpoint | Method | Auth | Swagger | Notes |
|----------|--------|------|---------|-------|
| `/blog` | POST | JWT (Admin) | Yes | CreateBlogPostDto |
| `/blog` | GET | JWT (Admin) | Yes | Pagination + search |
| `/blog/:id` | GET | JWT (Admin) | Yes | Single post |
| `/blog/:id` | PUT | JWT (Admin) | Yes | UpdateBlogPostDto |
| `/blog/:id` | DELETE | JWT (Admin) | Yes | Delete post |

### Reservations - `/reservations`
Auth: Roles(ADMIN)

| Endpoint | Method | Auth | Swagger | Notes |
|----------|--------|------|---------|-------|
| `/reservations` | POST | JWT (Admin) | Yes | CreateReservationDto |
| `/reservations` | GET | JWT (Admin) | Yes | Pagination + search + status |
| `/reservations/:id` | GET | JWT (Admin) | Yes | Single reservation |
| `/reservations/:id` | PUT | JWT (Admin) | Yes | UpdateReservationDto |
| `/reservations/:id` | DELETE | JWT (Admin) | Yes | Delete reservation |

### Partners - `/partners`
Auth: Roles(ADMIN)

| Endpoint | Method | Auth | Swagger | Notes |
|----------|--------|------|---------|-------|
| `/partners` | POST | JWT (Admin) | Yes | CreatePartnerDto |
| `/partners` | GET | JWT (Admin) | Yes | Pagination + search |
| `/partners/:id` | GET | JWT (Admin) | Yes | Single partner |
| `/partners/:id` | PUT | JWT (Admin) | Yes | UpdatePartnerDto |
| `/partners/:id` | DELETE | JWT (Admin) | Yes | Delete partner |

### Contact Messages - `/contact-messages`
Auth: Roles(ADMIN)

| Endpoint | Method | Auth | Swagger | Notes |
|----------|--------|------|---------|-------|
| `/contact-messages` | GET | JWT (Admin) | Yes | Pagination + search + status |
| `/contact-messages/:id` | GET | JWT (Admin) | Yes | Single message |
| `/contact-messages/:id/reply` | PUT | JWT (Admin) | Yes | Reply to message |
| `/contact-messages/:id/status` | PUT | JWT (Admin) | Yes | Update status |
| `/contact-messages/:id` | DELETE | JWT (Admin) | Yes | Delete message |

### Settings - `/settings`
Auth: Roles(ADMIN)

| Endpoint | Method | Auth | Swagger | Notes |
|----------|--------|------|---------|-------|
| `/settings` | GET | JWT (Admin) | Yes | All settings |
| `/settings/:key` | GET | JWT (Admin) | Yes | Single setting by key |
| `/settings/:key` | PUT | JWT (Admin) | Yes | UpdateSettingDto |

---

## Data Management

### Export - `/data-management/export`
Auth: Roles(ADMIN)

| Endpoint | Method | Auth | Swagger | Notes |
|----------|--------|------|---------|-------|
| `/data-management/export/groups` | GET | JWT (Admin) | Yes | Available export groups |
| `/data-management/export/excel` | POST | JWT (Admin) | Yes | ExportDataDto |
| `/data-management/export/template/:group` | GET | JWT (Admin) | Yes | Download template |

---

## System

### App Root - `/`
Auth: All @Public

| Endpoint | Method | Auth | Swagger | Notes |
|----------|--------|------|---------|-------|
| `/` | GET | Public | Yes | Hello message |
| `/health` | GET | Public | Yes | Health check |

---

## Authentication Patterns

| Pattern | Description | Cookie Names |
|---------|-------------|--------------|
| Employee JWT | httpOnly cookie auth, role-based access | `access`, `refresh` |
| Customer JWT | Separate strategy, CustomerJwtAuthGuard | `customer_access`, `customer_refresh` |
| Public | @Public() decorator, no auth required | N/A |

## File Upload Endpoints

| Module | Endpoint | Fields | Max Size |
|--------|----------|--------|----------|
| Users | POST/PATCH `/users` | picture, nid_front_picture, nid_back_picture | - |
| Items | POST `/items`, POST `/items/:id/upload-image` | image | - |
| Kitchen Items | POST/PATCH `/kitchen-items` | image | - |
| Staff Salary | POST/PUT `/staff-salary` | receipt_image | - |
| Expense Categories | POST/PUT `/expense-categories` | icon | - |
| Website Content | POST `/website-content/upload-image` | image | 5MB |
| Customers | POST `/customers/:id/upload-picture` | picture | - |

---

## Execution Log

| Date | Action | Details |
|------|--------|---------|
| 2026-02-10 | Initial file created | Based on old Express/Knex backend (48 endpoints) |
| 2026-02-15 | Full audit & rewrite | Scanned all 35 NestJS controllers, found ~210 endpoints |

## Changelog

- 2026-02-15: Complete rewrite based on NestJS backend audit. Updated from 48 to ~210 endpoints across 35 controllers.
- 2026-02-10: Initial status file created (outdated Express/Knex reference)