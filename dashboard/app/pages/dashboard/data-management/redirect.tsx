import { Navigate } from "react-router";

export default function DataManagementRedirect() {
  return <Navigate to="/dashboard?tab=data-management" replace />;
}
