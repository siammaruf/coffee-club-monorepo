import { index, route } from "@react-router/dev/routes";

export const protectedRoutes = [
  index("pages/dashboard/index.tsx"),
  route("profile", "pages/dashboard/profile.tsx"),

  route("employees", "pages/dashboard/employees/index.tsx"),
  route("employees/create", "pages/dashboard/employees/create.tsx"),
  route("employees/edit/:id", "pages/dashboard/employees/edit.tsx"),
  route("employees/:id", "pages/dashboard/employees/details.tsx"),


  route("products", "pages/dashboard/products/index.tsx"),
  route("products/create", "pages/dashboard/products/create.tsx"),
  route("products/edit/:id", "pages/dashboard/products/edit.tsx"),
  route("products/:id", "pages/dashboard/products/details.tsx"),

  route("orders", "pages/dashboard/orders/index.tsx"),
  route("orders/edit/:id", "pages/dashboard/orders/edit.tsx"),
  route("orders/:id", "pages/dashboard/orders/details.tsx"),
  route("orders/create", "pages/dashboard/orders/create.tsx"),

  route("salary", "pages/dashboard/salary/index.tsx"),
  route("salary/create", "pages/dashboard/salary/create.tsx"),

  route("reports/sales", "pages/dashboard/reports/sales.tsx"),
  route("reports/financial-summary", "pages/dashboard/reports/financialSummary.tsx"),

  route("customers", "pages/dashboard/customers/index.tsx"),
  route("categories", "pages/dashboard/categories/index.tsx"),
  route("discounts", "pages/dashboard/discount/index.tsx"),
  route("expenses", "pages/dashboard/expenses/index.tsx"),
  route("kitchen-items", "pages/dashboard/kitchen-items/index.tsx"),
  route("tokens", "pages/dashboard/tokens/index.tsx"),
  route("attendance", "pages/dashboard/attendance/index.tsx"),
  route("tables", "pages/dashboard/tables/index.tsx"),
  route("expenses/categories", "pages/dashboard/expense-categories/index.tsx"),
  route("data-management", "pages/dashboard/data-management/index.tsx"),
  route("website", "pages/dashboard/website/index.tsx"),
  route("blog", "pages/dashboard/blog/index.tsx"),
  route("reservations", "pages/dashboard/reservations/index.tsx"),
  route("contact-messages", "pages/dashboard/contact-messages/index.tsx"),
  route("partners", "pages/dashboard/partners/index.tsx"),
];