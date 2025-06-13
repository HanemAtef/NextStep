import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Inbox from "../Pages/Requests/Inbox/Inbox";
import Outbox from "../Pages/Requests/Outbox/Outbox";
import CreateReq from "../Pages/Requests/CreateReq/CreateReq";
import UserInfo from "../Pages/Auth/UserInfo/UserInfo";
import DashLayout from "../Pages/Dashboards/DashLayout/DashLayout";
import ApplicationHistory from "../Pages/Requests/ApplicationHistory/ApplicationHistory";
import ApplicationPreview from "../Pages/Requests/ApplicationPreview/ApplicationPreview";
import NotFound from "./NotFound";
import AdminDash from "../Pages/Dashboards/Admin/Dashboard/AdminDash";
import RequestList from "../Pages/Dashboards/Admin/Requests/RequestList/RequestList";
import AddRequest from "../Pages/Dashboards/Admin/Requests/AddRequest/AddRequest";
import EditRequest from "../Pages/Dashboards/Admin/Requests/EditRequest/EditRequest";
import DeptList from "../Pages/Dashboards/Admin/Departments/DeptList/DeptList";
import AddDept from "../Pages/Dashboards/Admin/Departments/CreateDept/CreateDept";
import UsersList from "../Pages/Dashboards/Admin/Users/UserList/UserList";
import AddUser from "../Pages/Dashboards/Admin/Users/AddUser/AddUser";
import EditUser from "../Pages/Dashboards/Admin/Users/EditUser/EditUser";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../Pages/Auth/Login/Login";
import { useSelector } from "react-redux";
import { selectCurrentInboxRequest } from "../Redux/slices/inboxSlice";
import ReportsDashboard from "../Pages/Reports/Dashboard/ReportsDashboard";
import DepartmentDetails from "../Pages/Reports/DepartmentDetails/DepartmentDetails";
import ReportsDash from "../Pages/Dashboards/Reports/Dashboard/ReportsDash";
import Nav from "../Component/Nav/Nav";

// مكون مستقل لصفحة المستخدم مع شريط التنقل فقط
const UserPageWithNav = () => (
  <>
    <Nav />
    <div style={{ marginTop: "80px" }}>
      <UserInfo />
    </div>
  </>
);

export default function AppRoutes() {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentRequest = useSelector(selectCurrentInboxRequest);
  const userRole = sessionStorage.getItem("role");
  const userRoles = JSON.parse(sessionStorage.getItem("roles") || "[]");

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const userRole = sessionStorage.getItem("role");
    const userRoles = JSON.parse(sessionStorage.getItem("roles") || "[]");

    if (!token) {
      navigate("/login");
    } else {
      setRole(userRole);
    }
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const isEmployeeRole = (role) => {
    const employeeRoles = [
      "مجلس الكليه",
      "ذكاء اصطناعي",
      "علوم حاسب",
      "نظم المعلومات",
      "لجنه الدرسات العليا",
      "حسابات علميه",
      "إدارة الدرسات العليا",
    ];
    return employeeRoles.includes(role);
  };

  const canCreateRequest = () => {
    const roles = JSON.parse(sessionStorage.getItem("roles") || "[]");
    const restrictedRoles = ["مجلس الكليه", "لجنه الدرسات العليا"];
    return roles.length > 0 && !roles.some(role => restrictedRoles.includes(role));
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          role ? (
            role === "ادمن" ? (
              <Navigate to="/admin" replace />
            ) : role === "مدير التقارير" || role === "اداره التقارير" ? (
              <Navigate to="/reports" replace />
            ) : isEmployeeRole(role) ? (
              <Navigate to="/inbox" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route element={<ProtectedRoute allowedRole="ادمن" />}>
        <Route path="/admin" element={<AdminDash title=" الادمن " />}>
          <Route index element={<div>مرحبًا بك في لوحة تحكم المسؤول</div>} />
          <Route path="department" element={<DeptList />} />
          <Route path="department/add" element={<AddDept />} />
          <Route path="users" element={<UsersList />} />
          <Route path="users/add" element={<AddUser />} />
          <Route path="users/edit/:id" element={<EditUser />} />
          <Route path="requests" element={<RequestList />} />
          <Route path="requests/add" element={<AddRequest />} />
          <Route path="requests/edit/:id" element={<EditRequest />} />
          <Route path="user" element={<UserInfo />} />
        </Route>
      </Route>

      <Route path="/user-direct" element={<UserInfo />} />

      <Route element={<ProtectedRoute allowedRole="مدير التقارير" />}>
        <Route
          path="/reports"
          element={<ReportsDash title=" إدارة التقارير " />}
        >
          <Route index element={<ReportsDashboard />} />
          <Route path="department/:id" element={<DepartmentDetails />} />
        </Route>
        <Route path="/reports/user" element={<UserPageWithNav />} />
      </Route>

      <Route path="/reports-direct" element={<ReportsDashboard />} />

      <Route element={<ProtectedRoute allowedRole="Employee" />}>
        <Route element={<DashLayout title={userRole} />}>
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/outbox" element={<Outbox />} />
          <Route path="/inbox/new/:id" element={<ApplicationPreview />} />
          <Route path="/inbox/response/:id" element={<ApplicationHistory />} />
          <Route path="/outbox/:id" element={<ApplicationHistory />} />
          <Route path="/user" element={<UserInfo />} />
          <Route path="/create" element={<CreateReq />} />
        </Route>
      </Route>

      <Route path="/NotFound" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/NotFound" replace />} />
    </Routes>
  );
}
