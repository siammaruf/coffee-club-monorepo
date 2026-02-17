import { route, index } from "@react-router/dev/routes";

export const authRoutes = [
  index("pages/auth/login.tsx"),
  route("login", "pages/auth/login.tsx"),
  route("forgot-password", "pages/auth/forgot-password.tsx"),
  route("verify-otp", "pages/auth/verify-otp.tsx"),
  route("reset-password", "pages/auth/reset-password.tsx"),
];