import { Outlet } from "react-router";
import { AuthRedirect } from "~/hooks/auth/AuthRedirect";

export default function AuthLayout() {
  return (
    <div className="bg-gradient-to-br from-yellow-50 via-white to-orange-100">
      <div className="container mx-auto">
        <Outlet />
      </div>
    </div>
  );
}