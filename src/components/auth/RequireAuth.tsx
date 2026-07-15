import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Spin } from "antd";
import { useEffect } from "react";
import { useAuthStore } from "../../stores/AuthStore";

export default function RequireAuth() {
  const location = useLocation();
  const { user, loading, checkSession } = useAuthStore();

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}