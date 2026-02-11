import { route, index } from "@react-router/dev/routes";

export const publicRoutes = [
  index("pages/home.tsx"),
  route("about", "pages/public/about.tsx"),
  route("terms", "pages/public/terms-service.tsx"),
  route("privacy", "pages/public/privacy-policy.tsx"),
];