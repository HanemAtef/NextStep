import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = ({ allowedRole, redirectPath = "/login" }) => {
  const token = sessionStorage.getItem("token");
  const userRole = sessionStorage.getItem("role");
  const location = useLocation();

  useEffect(() => {
    // console.log("ProtectedRoute: Current Role:", userRole);
    // console.log("ProtectedRoute: Allowed Role:", allowedRole);
  }, [userRole, allowedRole]);

  if (!token) {
    // console.log("No token found, redirecting to login");
    return <Navigate to={redirectPath} replace />;
  }

  if (allowedRole) {
    if (allowedRole === "ادمن" && userRole !== "ادمن") {
      return <Navigate to="/inbox" replace />;
    }

    if (allowedRole === "Employee") {
      const userRoles = JSON.parse(sessionStorage.getItem("roles") || "[]");
      const restrictedRoles = ["مجلس الكليه", "لجنه الدرسات العليا"];

      if (location.pathname === "/create") {
        if (userRoles.some(role => restrictedRoles.includes(role))) {
          return <Navigate to="/inbox" replace />;
        }
      }

      return <Outlet />;
    }

    if (allowedRole === "ReportsManager") {
      if (userRole !== "مدير التقارير" && userRole !== "اداره التقارير") {
        const defaultPath =
          userRole === "ادمن"
            ? "/admin"
            : userRole?.includes("موظف")
              ? "/inbox"
              : "/login";
        return <Navigate to={defaultPath} replace />;
      }
      return <Outlet />;
    }

    if (allowedRole === "مدير التقارير") {
      if (userRole !== "مدير التقارير" && userRole !== "اداره التقارير") {
        const defaultPath =
          userRole === "ادمن"
            ? "/admin"
            : userRole?.includes("موظف")
              ? "/inbox"
              : "/login";
        return <Navigate to={defaultPath} replace />;
      }
      return <Outlet />;
    }

    if (allowedRole === "RegularEmployee") {
      const userRoles = JSON.parse(sessionStorage.getItem("roles") || "[]");
      const restrictedRoles = ["مجلس الكليه", "لجنه الدرسات العليا"];

      if (location.pathname === "/create") {
        if (userRoles.some(role => restrictedRoles.includes(role))) {
          return <Navigate to="/inbox" replace />;
        }
      }

      return <Outlet />;
    }

    if (userRole !== allowedRole) {
      const normalizedUserRole = userRole?.trim();
      const normalizedAllowedRole = allowedRole?.trim();

      if (normalizedUserRole === normalizedAllowedRole) {
        return <Outlet />;
      }

      const defaultPath = userRole === "ادمن" ? "/admin" : "/inbox";
      return <Navigate to={defaultPath} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
