// Order Status Enum
export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Order Type Enum
export enum OrderType {
  DINEIN = 'DINEIN',
  TAKEAWAY = 'TAKEAWAY',
}

// Payment Method Enum
export enum PaymentMethod {
  CASH = 'CASH',
  BKASH = 'BKASH',
  BANK = 'BANK',
  OTHER = 'OTHER'
}
