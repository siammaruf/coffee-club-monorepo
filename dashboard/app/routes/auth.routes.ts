import { route } from "@react-router/dev/routes";

export const authRoutes = [
  route("login", "pages/auth/login.tsx"),
  route("/auth/forgot-password", "pages/auth/forgot-password.tsx"),
  route("/auth/verify-otp", "pages/auth/verify-otp.tsx"),
  route("/auth/reset-password", "pages/auth/reset-password.tsx"),
];