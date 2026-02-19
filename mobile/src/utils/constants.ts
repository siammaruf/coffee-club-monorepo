// App-wide constants

export const APP_NAME = 'Coffee Club Go';

export const ORDER_STATUS = {
    PENDING: 'PENDING',
    PREPARING: 'PREPARING',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
} as const;

export const ORDER_TYPE = {
    DINE_IN: 'DINE_IN',
    TAKEAWAY: 'TAKEAWAY',
} as const;

export const PAYMENT_METHOD = {
    CASH: 'CASH',
    BKASH: 'BKASH',
    NAGAD: 'NAGAD',
    CARD: 'CARD',
    CREDIT: 'CREDIT',
} as const;

export const TABLE_STATUS = {
    AVAILABLE: 'AVAILABLE',
    OCCUPIED: 'OCCUPIED',
    RESERVED: 'RESERVED',
} as const;

export const USER_ROLES = {
    MANAGER: 'manager',
    STAFF: 'staff',
    WAITER: 'waiter',
    CHEF: 'chef',
    BARISTA: 'barista',
} as const;

export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
} as const;
