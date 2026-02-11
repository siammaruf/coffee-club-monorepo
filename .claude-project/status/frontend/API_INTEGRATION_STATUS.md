# API Integration Status: CoffeeClub (Frontend)

> **Framework:** React v19 (React Router 7)
> **Last Updated:** 2026-02-10

## Overview

This document tracks which frontend screens have been integrated with their required API endpoints.

---

## Integration Matrix

### Authentication

| Screen | API Endpoint | Status | Service Method |
|--------|--------------|--------|----------------|
| Login | `POST /auth/login` | Complete | authService.login |
| Forgot Password | `POST /auth/forgot-password` | Complete | authService.forgotPassword |
| Verify OTP | `POST /auth/verify-otp` | Complete | authService.verifyOTP |
| Reset Password | `POST /auth/reset-password` | Complete | authService.resetPassword |

### Employees

| Screen | API Endpoint | Status | Service Method |
|--------|--------------|--------|----------------|
| Employee List | `GET /users` | Complete | userService |
| Create Employee | `POST /users` | Complete | userService |
| Edit Employee | `GET /users/:id`, `PUT /users/:id` | Complete | userService |
| Employee Details | `GET /users/:id` | Complete | userService |

### Products

| Screen | API Endpoint | Status | Service Method |
|--------|--------------|--------|----------------|
| Product List | `GET /items` | Complete | productService |
| Create Product | `POST /items` | Complete | productService |
| Edit Product | `GET /items/:id`, `PUT /items/:id` | Complete | productService |
| Product Details | `GET /items/:id` | Complete | productService |

### Orders

| Screen | API Endpoint | Status | Service Method |
|--------|--------------|--------|----------------|
| Order List | `GET /orders` | Complete | orderService |
| Create Order | `POST /orders` | Complete | orderService |
| Edit Order | `GET /orders/:id`, `PUT /orders/:id` | Complete | orderService |
| Order Details | `GET /orders/:id` | Complete | orderService |

### Kitchen

| Screen | API Endpoint | Status | Service Method |
|--------|--------------|--------|----------------|
| Kitchen Orders | Kitchen order APIs | Complete | kitchenOrderService |
| Kitchen Items | Kitchen item APIs | Complete | kitchenItemsService |
| Kitchen Stock | Kitchen stock APIs | Complete | kitchenStockService |

### Categories

| Screen | API Endpoint | Status | Service Method |
|--------|--------------|--------|----------------|
| Categories | `GET /categories` | Complete | categoryService |

### Salary

| Screen | API Endpoint | Status | Service Method |
|--------|--------------|--------|----------------|
| Salary List | `GET /salaries` | Complete | salaryService |
| Create Salary | `POST /salaries` | Complete | salaryService |

### Finance

| Screen | API Endpoint | Status | Service Method |
|--------|--------------|--------|----------------|
| Expenses | `GET /expenses` | Complete | expenseService |
| Expense Categories | Expense category APIs | Complete | expenseCategory |
| Discounts | Discount APIs | Complete | discountService |

### Reports

| Screen | API Endpoint | Status | Service Method |
|--------|--------------|--------|----------------|
| Sales Report | `GET /reports` | Complete | reportService |
| Inventory Report | Report APIs | Complete | reportService |
| Financial Summary | Report APIs | Complete | reportService |

### Other

| Screen | API Endpoint | Status | Service Method |
|--------|--------------|--------|----------------|
| Customers | Customer APIs | Complete | customerService |
| Tables | Table APIs | Complete | tableService |
| Attendance | Attendance APIs | Complete | attendanceService |
| Tokens | Token APIs | Complete | - |

---

## API Services

| Service | Location | Endpoints |
|---------|----------|-----------|
| authService | `app/services/httpServices/authService.ts` | login, forgotPassword, verifyOTP, resetPassword, checkAuthStatus, logout |
| userService | `app/services/httpServices/userService.ts` | User CRUD |
| categoryService | `app/services/httpServices/categoryService.ts` | Category CRUD |
| productService | `app/services/httpServices/productService.ts` | Product/Item CRUD |
| orderService | `app/services/httpServices/orderService.ts` | Order CRUD |
| salaryService | `app/services/httpServices/salaryService.ts` | Salary CRUD |
| expenseService | `app/services/httpServices/expenseService.ts` | Expense CRUD |
| reportService | `app/services/httpServices/reportService.ts` | Reports |
| customerService | `app/services/httpServices/customerService.ts` | Customer CRUD |
| attendanceService | `app/services/httpServices/attendanceService.ts` | Attendance CRUD |
| discountService | `app/services/httpServices/discountService.ts` | Discount CRUD |
| kitchenItemsService | `app/services/httpServices/kitchenItemsService.ts` | Kitchen Items CRUD |
| kitchenOrderService | `app/services/httpServices/kitchenOrderService.ts` | Kitchen Order CRUD |
| kitchenStockService | `app/services/httpServices/kitchenStockService.ts` | Kitchen Stock CRUD |
| tableService | `app/services/httpServices/tableService.ts` | Table management |

---

## Implementation Checklist

- [x] Axios instance configured
- [x] Auth token via cookies (withCredentials)
- [x] Error handling (errorHandler.ts)
- [x] TypeScript types for all API responses
- [ ] Token refresh interceptor (auto-retry on 401)
