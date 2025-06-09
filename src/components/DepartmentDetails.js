import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    selectDepartment,
    selectStats,
    selectProcessingTimeStats,
    selectRequestsCountByType,
    selectRejectionReasons,
    selectTimeAnalysis,
    selectStatusPieChart,
    selectDateRange,
    selectLoading,
    selectError,
    setDateRange,
    fetchDepartment,
    fetchDepartmentStats,
    fetchProcessingTimeStats,
    fetchRequestsCountByType,
    fetchRejectionReasons,
    fetchTimeAnalysis,
    fetchStatusPieChart
} from '../Redux/slices/departmentDetailsSlice';
import DateRangePicker from './common/DateRangePicker';
import { Card, Row, Col, Spinner, Alert, Container, Button } from 'react-bootstrap';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
ChartJS.register(...registerables);

// دالة مساعدة لتحويل سلاسل ISO إلى كائنات Date
const parseISODate = (isoString) => {
    return isoString ? new Date(isoString) : null;
};

function DepartmentDetails() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // استخراج البيانات من ريدكس
    const department = useSelector(selectDepartment);
    const stats = useSelector(selectStats);
    const processingTimeStats = useSelector(selectProcessingTimeStats);
    const requestsCountByType = useSelector(selectRequestsCountByType);
    const rejectionReasons = useSelector(selectRejectionReasons);
    const timeAnalysis = useSelector(selectTimeAnalysis);
    const statusPieChart = useSelector(selectStatusPieChart);
    const dateRangeFromStore = useSelector(selectDateRange);
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);

    // تحويل سلاسل التاريخ المخزنة في المتجر إلى كائنات Date لاستخدامها في واجهة المستخدم
    const dateRange = {
        startDate: parseISODate(dateRangeFromStore.startDate),
        endDate: parseISODate(dateRangeFromStore.endDate)
    };

    useEffect(() => {
        if (!id) {
            console.log('No id available, skipping data fetch');
            return;
        }
        dispatch(fetchDepartment(id));
        fetchDepartmentData();
    }, [dispatch, id, dateRangeFromStore]);

    const fetchDepartmentData = () => {
        if (!id) {
            console.log('No id available, skipping data fetch');
            return;
        }
        dispatch(fetchDepartmentStats({ id: id, dateRange: dateRangeFromStore }));
        dispatch(fetchProcessingTimeStats({ id: id, dateRange: dateRangeFromStore }));
        dispatch(fetchRequestsCountByType({ id: id, dateRange: dateRangeFromStore }));
        dispatch(fetchRejectionReasons({ id: id, dateRange: dateRangeFromStore }));
        dispatch(fetchTimeAnalysis({ id: id, dateRange: dateRangeFromStore }));
        dispatch(fetchStatusPieChart({
            id: id,
            startDate: dateRangeFromStore.startDate,
            endDate: dateRangeFromStore.endDate
        }));
    };

    // التعامل مع تغيير نطاق التاريخ
    const handleDateRangeChange = (newDateRange) => {
        // تحويل كائنات Date إلى سلاسل نصية قبل إرسالها إلى Redux
        const serializedDateRange = {
            startDate: newDateRange.startDate instanceof Date ? newDateRange.startDate.toISOString() : newDateRange.startDate,
            endDate: newDateRange.endDate instanceof Date ? newDateRange.endDate.toISOString() : newDateRange.endDate
        };
        dispatch(setDateRange(serializedDateRange));
    };

    if (loading.department) {
        return <Spinner animation="border" />;
    }

    if (error.department) {
        return <Alert variant="danger">حدث خطأ: {error.department}</Alert>;
    }

    return (
        <Container className="mt-4">
            <Button variant="secondary" className="mb-3" onClick={() => navigate(-1)}>
                العودة
            </Button>

            <h2 className="mb-4">{department?.name} - التفاصيل</h2>

            <Row className="mb-4">
                <Col>
                    <DateRangePicker
                        dateRange={dateRange}
                        onChange={handleDateRangeChange}
                    />
                </Col>
            </Row>

            {/* بقية مكونات الصفحة والرسوم البيانية ستضاف هنا */}

        </Container>
    );
}

export default DepartmentDetails; 