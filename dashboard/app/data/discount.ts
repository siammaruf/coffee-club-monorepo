import type { Discount } from "~/types/discount";

export const initialDiscounts: Discount[] = [
  {
    id: "1",
    name: "Summer Sale",
    discount_type: "percentage",
    discount_value: 20,
    description: "Get 20% off on all summer items",
    expiry_date: "2025-08-31T23:59:59.000Z",
  },
  {
    id: "2",
    name: "New Customer",
    discount_type: "fixed",
    discount_value: 50,
    description: "Fixed $50 discount for new customers",
    expiry_date: "2025-12-31T23:59:59.000Z",
  },
  {
    id: "3",
    name: "Coffee Lover",
    discount_type: "percentage",
    discount_value: 15,
    description: "15% off on all coffee products",
    expiry_date: "2025-07-15T23:59:59.000Z",
  },
];