import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = ({ allowedRole, redirectPath = "/login" }) => {
  const token = sessionStorage.getItem("token");
  const userRole = sessionStorage.getItem("role");
  const location = useLocation();

  const isKnownRole = (role) => {
    const knownRoles = [
      "ادمن",
      "مدير التقارير",
      "اداره التقارير",
      "مجلس الكليه",
      "ذكاء اصطناعي",
      "علوم حاسب",
      "نظم المعلومات",
      "لجنه الدرسات العليا",
      "حسابات علميه",
      "إدارة الدرسات العليا"
    ];
    return knownRoles.includes(role);
  };

  useEffect(() => {
    // console.log("ProtectedRoute: Current Role:", userRole);
    // console.log("ProtectedRoute: Allowed Role:", allowedRole);
  }, [userRole, allowedRole]);

  if (!token) {
    // console.log("No token found, redirecting to login");
    return <Navigate to={redirectPath} replace />;
  }

  if (!isKnownRole(userRole)) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole) {
    if (allowedRole === "ادمن" && userRole !== "ادمن") {
      // console.log("Role mismatch: User is not an Admin");
      return <Navigate to="/inbox" replace />;
    }

    if (allowedRole === "Employee") {
      const allowedRoles = [
        "مجلس الكليه",
        "ذكاء اصطناعي",
        "علوم حاسب",
        "نظم المعلومات",
        "لجنه الدرسات العليا",
        "حسابات علميه",
        "إدارة الدرسات العليا",
      ];

      if (!userRole || !allowedRoles.includes(userRole)) {
        // console.log("Role mismatch: User is not an Employee");
        const defaultPath = userRole === "ادمن" ? "/admin" : "/login";
        return <Navigate to={defaultPath} replace />;
      }
      return <Outlet />;
    }

    if (allowedRole === "ReportsManager") {
      if (userRole !== "مدير التقارير" && userRole !== "اداره التقارير") {
        // console.log("Role mismatch: User is not a Reports Manager");
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
        if (userRoles.some((role) => restrictedRoles.includes(role))) {
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
