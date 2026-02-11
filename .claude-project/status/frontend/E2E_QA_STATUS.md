# E2E QA Status: coffeeclub (Frontend)

## Overview

This document tracks end-to-end test coverage for the frontend application.

**Tech Stack:** Playwright (planned), TypeScript, Page Object Model

**Last Updated:** 2026-02-10

---

## Test Coverage Matrix

### Authentication

| URL (Route) | Test Scenario Name | Status | Lasted at |
|-------------|-------------------|--------|-----------|
| /login | Display login form | Not Started | - |
| /login | Show validation errors for empty form | Not Started | - |
| /login | Login with valid credentials | Not Started | - |
| /login | Show error for invalid credentials | Not Started | - |
| /auth/forgot-password | Request password reset (send OTP) | Not Started | - |
| /auth/verify-otp | Verify OTP code | Not Started | - |
| /auth/reset-password | Reset password with token | Not Started | - |

### Dashboard

| URL (Route) | Test Scenario Name | Status | Lasted at |
|-------------|-------------------|--------|-----------|
| /dashboard | Display dashboard home | Not Started | - |
| /dashboard/profile | View and edit profile | Not Started | - |

### Employees

| URL (Route) | Test Scenario Name | Status | Lasted at |
|-------------|-------------------|--------|-----------|
| /dashboard/employees | List all employees | Not Started | - |
| /dashboard/employees/create | Create new employee | Not Started | - |
| /dashboard/employees/edit/:id | Edit employee details | Not Started | - |
| /dashboard/employees/:id | View employee details | Not Started | - |

### Products

| URL (Route) | Test Scenario Name | Status | Lasted at |
|-------------|-------------------|--------|-----------|
| /dashboard/products | List all products | Not Started | - |
| /dashboard/products/create | Create new product | Not Started | - |
| /dashboard/products/edit/:id | Edit product | Not Started | - |
| /dashboard/products/:id | View product details | Not Started | - |

### Orders

| URL (Route) | Test Scenario Name | Status | Lasted at |
|-------------|-------------------|--------|-----------|
| /dashboard/orders | List all orders | Not Started | - |
| /dashboard/orders/create | Create new order | Not Started | - |
| /dashboard/orders/edit/:id | Edit order | Not Started | - |
| /dashboard/orders/:id | View order details | Not Started | - |

### Kitchen Orders

| URL (Route) | Test Scenario Name | Status | Lasted at |
|-------------|-------------------|--------|-----------|
| /dashboard/kitchen-orders | List all kitchen orders | Not Started | - |
| /dashboard/kitchen-order/create | Create kitchen order | Not Started | - |
| /dashboard/kitchen-order/edit/:id | Edit kitchen order | Not Started | - |
| /dashboard/kitchen-order/:id | View kitchen order details | Not Started | - |

### Salary & HR

| URL (Route) | Test Scenario Name | Status | Lasted at |
|-------------|-------------------|--------|-----------|
| /dashboard/salary | List all salaries | Not Started | - |
| /dashboard/salary/create | Create salary record | Not Started | - |
| /dashboard/attendance | Manage attendance | Not Started | - |

### Inventory & Categories

| URL (Route) | Test Scenario Name | Status | Lasted at |
|-------------|-------------------|--------|-----------|
| /dashboard/categories | Manage categories | Not Started | - |
| /dashboard/kitchen-items | Manage kitchen items | Not Started | - |
| /dashboard/kitchen-stock | Manage kitchen stock | Not Started | - |

### Finance

| URL (Route) | Test Scenario Name | Status | Lasted at |
|-------------|-------------------|--------|-----------|
| /dashboard/expenses | Manage expenses | Not Started | - |
| /dashboard/expenses/categories | Manage expense categories | Not Started | - |
| /dashboard/discounts | Manage discounts | Not Started | - |
| /dashboard/reports/sales | View sales report | Not Started | - |
| /dashboard/reports/inventory | View inventory report | Not Started | - |
| /dashboard/reports/financial-summary | View financial summary | Not Started | - |

### Customers & Tables

| URL (Route) | Test Scenario Name | Status | Lasted at |
|-------------|-------------------|--------|-----------|
| /dashboard/customers | Manage customers | Not Started | - |
| /dashboard/tables | Manage tables | Not Started | - |
| /dashboard/tokens | Manage tokens | Not Started | - |

---

## Status Legend

| Status | Meaning |
|--------|---------|
| Not Started | Test not yet implemented |
| In Progress | Test currently being developed |
| Complete | Test implemented and passing |
| Skipped | Test exists but skipped (see test file for reason) |
| Blocked | Cannot implement due to dependency |

---

## Running Tests

### Prerequisites

1. **Start Backend Server**
```bash
cd backend && npm run dev
# Backend runs on http://localhost:5000
```

2. **Start Frontend Dev Server**
```bash
cd frontend && npm run dev
# Frontend runs on http://localhost:5173
```

---

## Test Summary

| Category | Total | Complete | Skipped | Not Started |
|----------|-------|----------|---------|-------------|
| Authentication | 7 | 0 | 0 | 7 |
| Dashboard | 2 | 0 | 0 | 2 |
| Employees | 4 | 0 | 0 | 4 |
| Products | 4 | 0 | 0 | 4 |
| Orders | 4 | 0 | 0 | 4 |
| Kitchen Orders | 4 | 0 | 0 | 4 |
| Salary & HR | 3 | 0 | 0 | 3 |
| Inventory & Categories | 3 | 0 | 0 | 3 |
| Finance | 6 | 0 | 0 | 6 |
| Customers & Tables | 3 | 0 | 0 | 3 |
| **Total** | **40** | **0** | **0** | **40** |

---

## Notes

> E2E testing infrastructure has not been set up yet. Playwright needs to be installed and configured.
