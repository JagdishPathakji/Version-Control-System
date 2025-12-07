import { Navigate, Outlet } from "react-router-dom";

interface Props {
  isAuthenticated: boolean;
}

export default function ProtectedRoute({ isAuthenticated }: Props) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
