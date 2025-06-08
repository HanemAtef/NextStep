import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRole, redirectPath = "/login" }) => {
    const token = sessionStorage.getItem("token");
    const userRole = sessionStorage.getItem("role");

    useEffect(() => {
        console.log("ProtectedRoute: Current Role:", userRole);
        console.log("ProtectedRoute: Allowed Role:", allowedRole);
    }, [userRole, allowedRole]);

    if (!token) {
        console.log("No token found, redirecting to login");
        return <Navigate to={redirectPath} replace />;
    }

    if (allowedRole) {
        if (allowedRole === "ادمن" && userRole !== "ادمن") {
            console.log("Role mismatch: User is not an Admin");
            return <Navigate to="/inbox" replace />;
        }

        if (allowedRole === "Employee") {
            if (!userRole || !userRole.includes("موظف")) {
                console.log("Role mismatch: User is not an Employee");
                const defaultPath = userRole === "ادمن" ? "/admin" : "/login";
                return <Navigate to={defaultPath} replace />;
            }
            return <Outlet />;
        }

        if (allowedRole === "ReportsManager") {
            if (userRole !== "مدير التقارير") {
                console.log("Role mismatch: User is not a Reports Manager");
                const defaultPath = userRole === "ادمن" ? "/admin" :
                    userRole?.includes("موظف") ? "/inbox" : "/login";
                return <Navigate to={defaultPath} replace />;
            }
            return <Outlet />;
        }

        if (allowedRole === "مدير التقارير") {
            console.log("Checking Reports Manager access for role:", userRole);
            console.log("Is role matching?", userRole === "مدير التقارير" || userRole === "اداره التقارير");

            if (userRole !== "مدير التقارير" && userRole !== "اداره التقارير") {
                console.log("Role mismatch: User is not a Reports Manager");
                const defaultPath = userRole === "ادمن" ? "/admin" :
                    userRole?.includes("موظف") ? "/inbox" : "/login";
                return <Navigate to={defaultPath} replace />;
            }
            console.log("Access granted to Reports Manager route");
            return <Outlet />;
        }

        if (allowedRole === "RegularEmployee") {
            console.log("Checking RegularEmployee access for role:", userRole);

            if (!userRole || !userRole.includes("موظف")) {
                console.log("Role mismatch: User is not an Employee");
                const defaultPath = userRole === "ادمن" ? "/admin" : "/login";
                return <Navigate to={defaultPath} replace />;
            }

            const isCommitteeOrCouncil =
                (userRole.includes("لجنه") || userRole.includes("لجنة")) ||
                userRole.includes("مجلس");

            console.log("Is user in committee or council?", isCommitteeOrCouncil);
            console.log("Department restriction details:", {
                hasCommittee: userRole.includes("لجنه") || userRole.includes("لجنة"),
                hasCouncil: userRole.includes("مجلس")
            });

            if (isCommitteeOrCouncil) {
                console.log("Role mismatch: Employee is from a restricted department");
                return <Navigate to="/inbox" replace />;
            }

            console.log("Access granted to RegularEmployee route");
            return <Outlet />;
        }

        if (userRole !== allowedRole) {
            console.log(`Role mismatch: User has "${userRole}" but route requires "${allowedRole}"`);

            const normalizedUserRole = userRole?.trim();
            const normalizedAllowedRole = allowedRole?.trim();

            if (normalizedUserRole === normalizedAllowedRole) {
                console.log("Roles match after normalization, allowing access");
                return <Outlet />;
            }

            const defaultPath = userRole === "ادمن" ? "/admin" : "/inbox";
            return <Navigate to={defaultPath} replace />;
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;
