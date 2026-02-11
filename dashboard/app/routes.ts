import { type RouteConfig, layout, prefix } from "@react-router/dev/routes";
import { publicRoutes } from "./routes/public.routes";
import { authRoutes } from "./routes/auth.routes";
import { protectedRoutes } from "./routes/protected.routes";

export default [
  layout("pages/layout.tsx", publicRoutes),
  layout("pages/auth/layout.tsx", authRoutes),
  ...prefix("dashboard", [
   layout("pages/dashboard/layout.tsx", protectedRoutes),
  ]),
] satisfies RouteConfig;
