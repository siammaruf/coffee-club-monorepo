# Database Schema: CoffeeClub

## Overview

- **Database**: PostgreSQL
- **ORM**: TypeORM (NestJS integration)
- **ID Strategy**: UUID (`@PrimaryGeneratedColumn('uuid')`) on all entities
- **Table Prefix**: `cc_` (via `DB_TABLE_PREFIX` env var)
- **Migrations**: `backend/src/migrations/`
- **Timestamps**: All entities have `created_at` and `updated_at` (auto-managed)

## Entity Relationship Diagram

```
┌─────────────────┐
│     cc_users    │
├─────────────────┤        ┌──────────────────────┐
│ PK id (uuid)    │        │    cc_staff_salary    │
│    first_name   │──┐     ├──────────────────────┤
│    last_name    │  ├────>│ FK user_id            │
│    email        │  │     │    amount, month      │
│    phone        │  │     └──────────────────────┘
│    password     │  │
│    role (enum)  │  │     ┌──────────────────────┐
│    status (enum)│  │     │ cc_stuff_attendance   │
│    base_salary  │  ├────>│ FK user_id            │
│    picture      │  │     └──────────────────────┘
│    nid_number   │  │
│    nid_front    │  │     ┌──────────────────────┐
│    nid_back     │  │     │   cc_stuff_leave      │
│    address      │  ├────>│ FK user_id            │
│    date_joined  │  │     └──────────────────────┘
└─────────────────┘  │
                     │     ┌──────────────────────┐
                     │     │    cc_expenses        │
                     └────>│ FK user_id            │
                           │ FK category_id        │──> cc_expense_categories
                           └──────────────────────┘

┌─────────────────┐        ┌──────────────────────┐
│  cc_customers   │        │    cc_orders          │
├─────────────────┤        ├──────────────────────┤
│ PK id (uuid)    │<───────│ FK customer_id        │
│    name         │        │ PK id (uuid)          │
│    phone        │        │    order_id (unique)   │
│    email        │        │    order_type (enum)   │
│    address      │        │    order_source (enum)  │ [NEW]
│    note         │        │    status (enum)       │
│    picture      │        │    sub_total           │
│    points       │        │    total_amount        │
│    balance      │        │    discount_amount     │
│    is_active    │        │    payment_method      │
│    password     │ [NEW]  │    completion_time     │
│    refresh_token│ [NEW]  │    delivery_address    │ [NEW]
│    is_verified  │ [NEW]  │    special_instructions│ [NEW]
│    otp          │ [NEW]  │    customer_phone      │ [NEW]
│    otp_expires  │ [NEW]  │ FK user_id (staff)     │
└─────────────────┘        │ FK discount_id         │──> cc_discounts
                           └──────────┬─────────────┘
                                      │
                    ┌─────────────────┼──────────────────┐
                    │                 │                  │
                    v                 v                  v
         ┌──────────────┐  ┌──────────────┐   ┌──────────────┐
         │cc_order_items│  │cc_order_tokens│   │  cc_tables   │
         ├──────────────┤  ├──────────────┤   ├──────────────┤
         │FK order_id   │  │FK order_id   │   │ PK id (uuid) │
         │FK item_id    │  │    token_num │   │    number    │
         │   quantity   │  └──────────────┘   │    seat      │
         │   unit_price │                     │    location  │
         │   total_price│                     │    status    │
         └──────────────┘                     └──────────────┘
              │                              (ManyToMany with orders)
              v
┌─────────────────┐        ┌──────────────────────┐
│    cc_items     │        │   cc_categories       │
├─────────────────┤        ├──────────────────────┤
│ PK id (uuid)    │        │ PK id (uuid)          │
│    name         │<──────>│    name               │
│    name_bn      │ M:N    │    name_bn            │
│    slug (unique)│        │    slug (unique)       │
│    description  │        │    description         │
│    type (enum)  │        │    icon               │
│    status (enum)│        └──────────────────────┘
│    regular_price│
│    sale_price   │
│    image        │
└─────────────────┘

┌──────────────────┐       ┌──────────────────────┐
│  cc_discounts    │       │cc_discount_application│
├──────────────────┤       ├──────────────────────┤
│ PK id (uuid)     │<──────│ FK discount_id        │
│    name          │       │ FK order_id           │
│    discount_type │       └──────────────────────┘
│    discount_value│
│    expiry_date   │
└──────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ cc_kitchen_items │  │cc_kitchen_orders │  │ cc_kitchen_stock │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ PK id (uuid)     │  │ PK id (uuid)     │  │ PK id (uuid)     │
│    ...           │  │    ...           │  │    ...           │
└──────────────────┘  └──────────────────┘  └──────────────────┘

┌──────────────────┐       ┌──────────────────┐  [NEW]
│    cc_banks      │       │    cc_cart        │
├──────────────────┤       ├──────────────────┤
│ PK id (uuid)     │       │ PK id (uuid)     │
│    ...           │       │ FK customer_id   │
└──────────────────┘       └──────┬───────────┘
                                  │
                                  v
                           ┌──────────────────┐  [NEW]
                           │  cc_cart_items    │
                           ├──────────────────┤
                           │ PK id (uuid)     │
                           │ FK cart_id       │
                           │ FK item_id       │
                           │    quantity      │
                           └──────────────────┘
```

## Entities

### cc_users

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| first_name | VARCHAR | No | - | First name |
| last_name | VARCHAR | No | - | Last name |
| email | VARCHAR | No | - | Email (unique) |
| phone | VARCHAR | Yes | - | Phone number |
| nid_number | VARCHAR | Yes | - | National ID number |
| nid_front_picture | VARCHAR | Yes | - | NID front image URL (Cloudinary) |
| nid_back_picture | VARCHAR | Yes | - | NID back image URL (Cloudinary) |
| address | VARCHAR | Yes | - | Address |
| date_joined | TIMESTAMP | Yes | - | Date employee joined |
| password | VARCHAR | No | - | Hashed password (bcrypt) |
| status | ENUM | No | ACTIVE | ACTIVE, INACTIVE |
| role | ENUM | No | STUFF | ADMIN, MANAGER, STUFF |
| picture | VARCHAR | Yes | - | Profile picture URL (Cloudinary) |
| base_salary | DECIMAL | Yes | - | Base salary amount |
| refresh_token | VARCHAR | Yes | - | JWT refresh token |
| created_at | TIMESTAMP | No | NOW() | Creation timestamp |
| updated_at | TIMESTAMP | No | NOW() | Update timestamp |

### cc_customers

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| name | VARCHAR | No | - | Customer name |
| phone | VARCHAR | No | - | Phone (unique) |
| email | VARCHAR | Yes | - | Email (unique) |
| address | VARCHAR | Yes | - | Address |
| note | TEXT | Yes | - | Notes about customer |
| picture | VARCHAR | Yes | - | Profile picture URL |
| points | DECIMAL | No | 0 | Loyalty points |
| balance | DECIMAL | No | 0 | Account balance |
| is_active | BOOLEAN | No | true | Active status |
| password | VARCHAR | Yes | - | Hashed password (for web login) [NEW] |
| refresh_token | VARCHAR | Yes | - | JWT refresh token [NEW] |
| is_verified | BOOLEAN | No | false | Phone/email verified [NEW] |
| otp | VARCHAR | Yes | - | One-time password [NEW] |
| otp_expires_at | TIMESTAMP | Yes | - | OTP expiration [NEW] |
| created_at | TIMESTAMP | No | NOW() | Creation timestamp |
| updated_at | TIMESTAMP | No | NOW() | Update timestamp |

### cc_items

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| name | VARCHAR | No | - | Item name |
| name_bn | VARCHAR | Yes | - | Bengali name |
| slug | VARCHAR | No | - | URL slug (unique) |
| description | TEXT | Yes | - | Description |
| type | ENUM | No | - | BAR, KITCHEN |
| status | ENUM | No | AVAILABLE | AVAILABLE, UNAVAILABLE |
| regular_price | DECIMAL | No | - | Regular price |
| sale_price | DECIMAL | Yes | - | Sale/discounted price |
| image | VARCHAR | Yes | - | Image URL (Cloudinary) |
| created_at | TIMESTAMP | No | NOW() | Creation timestamp |
| updated_at | TIMESTAMP | No | NOW() | Update timestamp |

**Relations:**
- ManyToMany with `cc_categories` (via junction table `cc_item_categories`)

### cc_categories

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| name | VARCHAR | No | - | Category name |
| name_bn | VARCHAR | Yes | - | Bengali name |
| slug | VARCHAR | No | - | URL slug (unique) |
| description | TEXT | Yes | - | Description |
| icon | VARCHAR | Yes | - | Icon image URL |
| created_at | TIMESTAMP | No | NOW() | Creation timestamp |
| updated_at | TIMESTAMP | No | NOW() | Update timestamp |

**Relations:**
- ManyToMany with `cc_items` (via junction table)

### cc_orders

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| order_id | VARCHAR | No | - | Human-readable order ID (unique) |
| order_type | ENUM | No | - | DINEIN, TAKEAWAY, DELIVERY |
| order_source | VARCHAR | No | pos | 'pos' or 'web' [NEW] |
| status | ENUM | No | PENDING | PENDING, PREPARING, COMPLETED, CANCELLED |
| sub_total | DECIMAL | No | - | Subtotal before discount |
| total_amount | DECIMAL | No | - | Total after discount |
| discount_amount | DECIMAL | Yes | 0 | Discount amount applied |
| completion_time | TIMESTAMP | Yes | - | When order was completed |
| payment_method | ENUM | Yes | - | CASH, BKASH, BANK, OTHER |
| delivery_address | VARCHAR | Yes | - | Delivery address [NEW] |
| special_instructions | TEXT | Yes | - | Special instructions [NEW] |
| customer_phone | VARCHAR | Yes | - | Customer phone [NEW] |
| customer_id | UUID (FK) | Yes | - | FK to cc_customers |
| user_id | UUID (FK) | Yes | - | FK to cc_users (staff who created) |
| discount_id | UUID (FK) | Yes | - | FK to cc_discounts |
| created_at | TIMESTAMP | No | NOW() | Creation timestamp |
| updated_at | TIMESTAMP | No | NOW() | Update timestamp |

**Relations:**
- ManyToOne with `cc_customers`
- ManyToOne with `cc_users` (staff)
- ManyToOne with `cc_discounts`
- OneToMany with `cc_order_items`
- OneToMany with `cc_order_tokens`
- ManyToMany with `cc_tables` (via junction table `cc_order_tables`)

### cc_order_items

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| quantity | INTEGER | No | - | Quantity ordered |
| unit_price | DECIMAL | No | - | Price per unit |
| total_price | DECIMAL | No | - | Line total (qty * unit_price) |
| order_id | UUID (FK) | No | - | FK to cc_orders |
| item_id | UUID (FK) | No | - | FK to cc_items |
| created_at | TIMESTAMP | No | NOW() | Creation timestamp |
| updated_at | TIMESTAMP | No | NOW() | Update timestamp |

### cc_tables

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| number | VARCHAR | No | - | Table number |
| seat | INTEGER | Yes | - | Number of seats |
| description | TEXT | Yes | - | Description |
| location | VARCHAR | Yes | - | Location (indoor/outdoor/etc) |
| status | ENUM | No | AVAILABLE | AVAILABLE, OCCUPIED, RESERVED, OUT_OF_SERVICE |
| created_at | TIMESTAMP | No | NOW() | Creation timestamp |
| updated_at | TIMESTAMP | No | NOW() | Update timestamp |

**Relations:**
- ManyToMany with `cc_orders` (via junction table)

### cc_discounts

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| name | VARCHAR | No | - | Discount name |
| discount_type | ENUM | No | - | PERCENTAGE, FIXED |
| discount_value | DECIMAL | No | - | Discount amount/percentage |
| expiry_date | TIMESTAMP | Yes | - | Expiration date |
| created_at | TIMESTAMP | No | NOW() | Creation timestamp |
| updated_at | TIMESTAMP | No | NOW() | Update timestamp |

### cc_expenses

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| title | VARCHAR | No | - | Expense title |
| description | TEXT | Yes | - | Description |
| amount | DECIMAL | No | - | Amount |
| user_id | UUID (FK) | Yes | - | FK to cc_users (who recorded) |
| category_id | UUID (FK) | Yes | - | FK to cc_expense_categories |
| created_at | TIMESTAMP | No | NOW() | Creation timestamp |
| updated_at | TIMESTAMP | No | NOW() | Update timestamp |

### cc_expense_categories

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| name | VARCHAR | No | - | Category name |
| description | TEXT | Yes | - | Description |
| created_at | TIMESTAMP | No | NOW() | Creation timestamp |
| updated_at | TIMESTAMP | No | NOW() | Update timestamp |

### cc_staff_salary

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| user_id | UUID (FK) | No | - | FK to cc_users |
| amount | DECIMAL | No | - | Salary amount |
| month | VARCHAR | No | - | Month (e.g., "2026-02") |
| status | VARCHAR | Yes | - | Payment status |
| created_at | TIMESTAMP | No | NOW() | Creation timestamp |
| updated_at | TIMESTAMP | No | NOW() | Update timestamp |

### cc_stuff_attendance

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| user_id | UUID (FK) | No | - | FK to cc_users |
| date | DATE | No | - | Attendance date |
| check_in | TIMESTAMP | Yes | - | Check-in time |
| check_out | TIMESTAMP | Yes | - | Check-out time |
| status | VARCHAR | Yes | - | Present/Absent/Late |
| created_at | TIMESTAMP | No | NOW() | Creation timestamp |
| updated_at | TIMESTAMP | No | NOW() | Update timestamp |

### cc_stuff_leave

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| user_id | UUID (FK) | No | - | FK to cc_users |
| start_date | DATE | No | - | Leave start date |
| end_date | DATE | No | - | Leave end date |
| reason | TEXT | Yes | - | Leave reason |
| status | VARCHAR | Yes | PENDING | Pending/Approved/Rejected |
| created_at | TIMESTAMP | No | NOW() | Creation timestamp |
| updated_at | TIMESTAMP | No | NOW() | Update timestamp |

### cc_banks

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| name | VARCHAR | No | - | Bank name |
| account_number | VARCHAR | No | - | Account number |
| branch | VARCHAR | Yes | - | Branch name |
| balance | DECIMAL | Yes | 0 | Current balance |
| created_at | TIMESTAMP | No | NOW() | Creation timestamp |
| updated_at | TIMESTAMP | No | NOW() | Update timestamp |

### cc_discount_application

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| discount_id | UUID (FK) | No | - | FK to cc_discounts |
| order_id | UUID (FK) | No | - | FK to cc_orders |
| amount_applied | DECIMAL | No | - | Actual discount amount applied |
| created_at | TIMESTAMP | No | NOW() | Creation timestamp |
| updated_at | TIMESTAMP | No | NOW() | Update timestamp |

### cc_order_tokens

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| order_id | UUID (FK) | No | - | FK to cc_orders |
| token_number | VARCHAR | No | - | Kitchen token number |
| created_at | TIMESTAMP | No | NOW() | Creation timestamp |
| updated_at | TIMESTAMP | No | NOW() | Update timestamp |

### cc_cart [NEW]

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| customer_id | UUID (FK) | No | - | FK to cc_customers (unique) |
| created_at | TIMESTAMP | No | NOW() | Creation timestamp |
| updated_at | TIMESTAMP | No | NOW() | Update timestamp |

**Relations:**
- ManyToOne with `cc_customers` (one cart per customer)
- OneToMany with `cc_cart_items`

### cc_cart_items [NEW]

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| cart_id | UUID (FK) | No | - | FK to cc_cart |
| item_id | UUID (FK) | No | - | FK to cc_items |
| quantity | INTEGER | No | 1 | Quantity |
| created_at | TIMESTAMP | No | NOW() | Creation timestamp |
| updated_at | TIMESTAMP | No | NOW() | Update timestamp |

### cc_kitchen_items

Kitchen inventory items (raw materials and supplies).

### cc_kitchen_orders

Kitchen order processing and tracking.

### cc_kitchen_stock

Kitchen stock level management.

### cc_reports

Report snapshots (sales, expenses, profit summaries).

## Key Relationships Summary

| Relationship | Type | Description |
|-------------|------|-------------|
| User -> Orders | OneToMany | Staff member who created orders |
| User -> Expenses | OneToMany | Staff who recorded expenses |
| User -> StaffSalary | OneToMany | Salary records per employee |
| User -> Attendance | OneToMany | Attendance records |
| User -> Leave | OneToMany | Leave requests |
| Customer -> Orders | OneToMany | Customer's orders |
| Customer -> Cart | OneToOne | Customer's shopping cart [NEW] |
| Order -> OrderItems | OneToMany | Line items in an order |
| Order -> OrderTokens | OneToMany | Kitchen tokens |
| Order -> Tables | ManyToMany | Tables assigned to dine-in order |
| Order -> Discount | ManyToOne | Discount applied to order |
| Item -> Categories | ManyToMany | Item categorization |
| Cart -> CartItems | OneToMany | Items in shopping cart [NEW] |
| CartItem -> Item | ManyToOne | Reference to menu item [NEW] |
| Expense -> ExpenseCategory | ManyToOne | Expense categorization |
| DiscountApplication -> Order | ManyToOne | Discount usage on order |
| DiscountApplication -> Discount | ManyToOne | Which discount was used |

## Migrations

```bash
# Run all pending migrations
cd backend && npm run migration:run

# Revert last migration
cd backend && npm run migration:revert

# Generate migration from entity changes
cd backend && npm run migration:generate -- src/migrations/MigrationName

# Create empty migration
cd backend && npm run migration:create -- src/migrations/MigrationName
```
