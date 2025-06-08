import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchStats,
    fetchDepartments,
    fetchTimeAnalysis,
    fetchRequestsCount,
    fetchCreatedRequests,
    fetchDepartmentStatus,
    setDateRange,
    setPieStatus
} from '../Redux/slices/reportDashboardSlice';
import {
    selectStats,
    selectDepartments,
    selectTimeAnalysis,
    selectRequestsCount,
    selectCreatedRequests,
    selectDepartmentStatus,
    selectDateRange,
    selectPieStatus,
    selectLoading,
    selectError
} from '../Redux/slices/reportDashboardSlice';
import { Container, Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Bar, Pie, Line } from 'react-chartjs-2';
import DateRangePicker from './common/DateRangePicker';
import { Chart as ChartJS, registerables } from 'chart.js';
ChartJS.register(...registerables);

// دالة مساعدة لتحويل سلاسل ISO إلى كائنات Date
const parseISODate = (isoString) => {
    return isoString ? new Date(isoString) : null;
};

function ReportsDashboard() {
    const dispatch = useDispatch();
    const stats = useSelector(selectStats);
    const departments = useSelector(selectDepartments);
    const timeAnalysis = useSelector(selectTimeAnalysis);
    const requestsCount = useSelector(selectRequestsCount);
    const createdRequests = useSelector(selectCreatedRequests);
    const departmentStatus = useSelector(selectDepartmentStatus);
    const dateRangeFromStore = useSelector(selectDateRange);
    const pieStatus = useSelector(selectPieStatus);
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);

    // تحويل سلاسل التاريخ المخزنة في المتجر إلى كائنات Date لاستخدامها في واجهة المستخدم
    const dateRange = {
        startDate: parseISODate(dateRangeFromStore.startDate),
        endDate: parseISODate(dateRangeFromStore.endDate)
    };

    useEffect(() => {
        dispatch(fetchDepartments());
        fetchDashboardData();
    }, [dispatch, dateRangeFromStore, pieStatus]);

    const fetchDashboardData = () => {
        dispatch(fetchStats(dateRangeFromStore));
        dispatch(fetchTimeAnalysis(dateRangeFromStore));
        dispatch(fetchRequestsCount(dateRangeFromStore));
        dispatch(fetchCreatedRequests(dateRangeFromStore));
        dispatch(fetchDepartmentStatus({ dateRange: dateRangeFromStore, status: pieStatus }));
    };

    // التعامل مع تغيير نطاق التاريخ
    const handleDateRangeChange = (newDateRange) => {
        dispatch(setDateRange(newDateRange));
    };

    const handlePieStatusChange = (status) => {
        dispatch(setPieStatus(status));
    };

    return (
        <Container fluid>
            <h1 className="my-4">لوحة التقارير</h1>

            <Row className="mb-4">
                <Col>
                    <DateRangePicker
                        dateRange={dateRange}
                        onChange={handleDateRangeChange}
                    />
                </Col>
            </Row>

            {/* باقي محتوى الصفحة */}

        </Container>
    );
}

export default ReportsDashboard; 