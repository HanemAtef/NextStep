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

export default function AppRoutes() {
    const navigate = useNavigate();
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const currentRequest = useSelector(selectCurrentInboxRequest);
    const userRole = sessionStorage.getItem("role");
    useEffect(() => {
        const token = sessionStorage.getItem('token');
        const userRole = sessionStorage.getItem("role");

        console.log("AppRoutes: Token exists:", !!token);
        console.log("AppRoutes: User role:", userRole);

        if (!token) {
            navigate('/login');
        } else {
            setRole(userRole);
        }
        setLoading(false);
    }, [navigate]);

    if (loading) {
        return <div>Loading...</div>; // Show loading screen until role is fetched
    }

    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={
                role ? (
                    role === "ادمن" ? <Navigate to="/admin" replace /> : <Navigate to="/inbox" replace />
                ) : <Navigate to="/login" replace />
            } />

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

            <Route element={<ProtectedRoute allowedRole="Employee" />}>
                <Route element={<DashLayout title={userRole} />}>
                    <Route path="/inbox" element={<Inbox />} />
                    <Route path="/outbox" element={<Outbox />} />
                    <Route
                        path="/inbox/new/:id"
                        element={<ApplicationPreview request={currentRequest} onBack={() => navigate('/inbox')} />}
                    />
                    <Route path="/inbox/response/:id" element={<ApplicationHistory />} />
                    <Route path="/outbox/:id" element={<ApplicationHistory />} />
                    <Route path="/user" element={<UserInfo />} />
                </Route>
            </Route>

            {/* مسار إنشاء الطلبات - متاح فقط للموظفين ماعدا لجنة الدراسات العليا ومجلس الكلية */}
            <Route element={<ProtectedRoute allowedRole="RegularEmployee" />}>
                <Route element={<DashLayout title={userRole} />}>
                    <Route path="/create" element={<CreateReq />} />
                </Route>
            </Route>

            {/* 404 Route */}
            <Route path="/NotFound" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/NotFound" replace />} />
        </Routes>
    );
}
