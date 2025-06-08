import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styles from './ReportsDashboard.module.css';
import { FaChartPie, FaChartBar, FaChartLine, FaClipboardList, FaRegClock, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaFileAlt, FaFileExport, FaAngleLeft } from 'react-icons/fa';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { generateDashboardReport } from './DashboardReportGenerator';

// استيراد actions من Redux slice
import {
    fetchStats,
    fetchDepartments,
    fetchTimeAnalysis,
    fetchRequestsCount,
    fetchCreatedRequests,
    fetchDepartmentStatus,
    setDateRange,
    setPieStatus
} from '../../../Redux/slices/reportDashboardSlice';

// تسجيل جميع مكونات Chart.js
Chart.register(...registerables);

// Make sure Chart.js is properly configured
Chart.defaults.scale.ticks.display = true;

const ReportsDashboard = () => {
    const dispatch = useDispatch();
    const { stats, dateRange, loading, error, pieStatus, departmentStatus, departments, timeAnalysis, requestsCount, createdRequests } = useSelector(state => state.reportDashboard);

    // تحويل سلاسل التواريخ إلى كائنات Date للاستخدام في DatePicker
    const [localDateRange, setLocalDateRange] = useState({
        startDate: dateRange.startDate ? new Date(dateRange.startDate) : null,
        endDate: dateRange.endDate ? new Date(dateRange.endDate) : null
    });

    // تتبع حالة إعادة ضبط البيانات
    const [isResetting, setIsResetting] = useState(false);
    const [resetMessage, setResetMessage] = useState('');

    // تسجيل البيانات المستلمة من Redux
    useEffect(() => {
        // console.log("📊 Redux State Data:", {
        //     stats: stats,
        //     dateRange: dateRange,
        //     pieStatus: pieStatus,
        //     departmentStatus: departmentStatus,
        //     departments: departments ? `${departments.length} items` : 'No departments',
        //     timeAnalysis: timeAnalysis,
        //     requestsCount: requestsCount,
        //     createdRequests: createdRequests,
        // });

        // فحص بيانات الإدارات بالتفصيل
        // if (departments && departments.length > 0) {
        //     console.log("📊 Departments data detailed:", {
        //         firstDepartment: departments[0],
        //         keys: Object.keys(departments[0]),
        //         departmentNames: departments.map(d => d.departmentName || d.name),
        //         departmentIds: departments.map(d => d.id)
        //     });
        // } else {
        //     console.log("📊 No departments data available");
        // }

        // التحقق من بنية البيانات المستلمة من API
        if (departmentStatus) {
            // console.log("📊 Department Status Structure:",
            //     {
            //         hasLabels: Boolean(departmentStatus.labels),
            //         labelsType: departmentStatus.labels ? typeof departmentStatus.labels : 'undefined',
            //         isLabelsArray: Array.isArray(departmentStatus.labels),
            //         labelsLength: departmentStatus.labels ? departmentStatus.labels.length : 0,
            //         hasData: Boolean(departmentStatus.data),
            //         dataType: departmentStatus.data ? typeof departmentStatus.data : 'undefined',
            //         isDataArray: Array.isArray(departmentStatus.data),
            //         dataLength: departmentStatus.data ? departmentStatus.data.length : 0,
            //     });
        }
    }, [stats, departmentStatus, departments, timeAnalysis, requestsCount, createdRequests, dateRange, pieStatus]);

    // تحديث DatePicker عند تغيير نطاق التواريخ
    const handleDateChange = (update) => {
        // لا نحتاج إلى تحديث Redux إذا لم يتغير التاريخ
        if (!update || !update[0]) return;

        // console.log("📅 Date picker update:", update);
        // console.log("📅 Original format:", {
        //     startDate: update[0],
        //     endDate: update[1] || update[0]
        // });

        // إذا كان تاريخ الانتهاء غير محدد، استخدم تاريخ البدء
        const newDateRange = {
            startDate: update[0],
            endDate: update[1] || update[0]
        };

        // تأكد من تضمين بداية ونهاية اليوم للتواريخ
        if (newDateRange.startDate) {
            const startDay = new Date(newDateRange.startDate);
            startDay.setHours(0, 0, 0, 0);
            newDateRange.startDate = startDay;
        }

        if (newDateRange.endDate) {
            const endDay = new Date(newDateRange.endDate);
            endDay.setHours(23, 59, 59, 999);
            newDateRange.endDate = endDay;
        }

        setLocalDateRange(newDateRange);

        // تحويل التواريخ إلى سلاسل نصية قبل إرسالها إلى Redux
        dispatch(setDateRange({
            startDate: newDateRange.startDate instanceof Date ? newDateRange.startDate.toISOString() : newDateRange.startDate,
            endDate: newDateRange.endDate instanceof Date ? newDateRange.endDate.toISOString() : newDateRange.endDate
        }));

        // إعادة تحميل البيانات مع نطاق التاريخ الجديد
        refreshData(newDateRange);
    };

    // إعادة تعيين نطاق التاريخ إلى القيمة الافتراضية
    const handleResetDateRange = () => {
        // عرض مؤشر إعادة الضبط
        setIsResetting(true);
        setResetMessage('جاري إعادة تحميل البيانات الافتراضية...');

        // إعداد تواريخ افتراضية - تاريخ اليوم فقط
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        const defaultRange = {
            startDate: null,
            endDate: null
        };

        setLocalDateRange(defaultRange);

        // تحويل التواريخ إلى سلاسل نصية قبل إرسالها إلى Redux
        dispatch(setDateRange({
            startDate: null,
            endDate: null
        }));

        // إعادة تحميل جميع البيانات بدون معايير تصفية
        dispatch(fetchStats());
        dispatch(fetchDepartments());
        dispatch(fetchTimeAnalysis());
        dispatch(fetchRequestsCount());
        dispatch(fetchCreatedRequests());
        dispatch(fetchDepartmentStatus({
            status: pieStatus
        }));

        // إخفاء مؤشر إعادة الضبط بعد 1.5 ثانية
        setTimeout(() => {
            setIsResetting(false);
            setResetMessage('تم إعادة ضبط البيانات بنجاح');

            // إخفاء رسالة النجاح بعد 3 ثواني
            setTimeout(() => {
                setResetMessage('');
            }, 3000);
        }, 1500);
    };

    // تحديث البيانات
    const refreshData = (dates = localDateRange) => {
        // تنسيق تواريخ العرض للتسجيل
        const displayStartDate = dates.startDate instanceof Date ?
            dates.startDate.toLocaleDateString() :
            dates.startDate ? new Date(dates.startDate).toLocaleDateString() : 'undefined';

        const displayEndDate = dates.endDate instanceof Date ?
            dates.endDate.toLocaleDateString() :
            dates.endDate ? new Date(dates.endDate).toLocaleDateString() : 'undefined';


        // تحويل التواريخ إلى سلاسل نصية
        const startDate = dates.startDate instanceof Date ? dates.startDate.toISOString() : dates.startDate;
        const endDate = dates.endDate instanceof Date ? dates.endDate.toISOString() : dates.endDate;


        dispatch(fetchStats({ startDate, endDate }));
        dispatch(fetchDepartments({ startDate, endDate }));
        dispatch(fetchTimeAnalysis({ startDate, endDate }));
        dispatch(fetchRequestsCount({ startDate, endDate }));
        dispatch(fetchCreatedRequests({ startDate, endDate }));
        dispatch(fetchDepartmentStatus({
            status: pieStatus,
            startDate,
            endDate
        }));
    };

    // تحميل البيانات عند تحميل المكون
    useEffect(() => {
        refreshData();
    }, []);

    // تحديث مخطط توزيع الإدارات عند تغيير حالة الفلتر
    useEffect(() => {
        // تحويل التواريخ إلى سلاسل نصية
        const startDate = localDateRange.startDate instanceof Date ?
            localDateRange.startDate.toISOString() : localDateRange.startDate;
        const endDate = localDateRange.endDate instanceof Date ?
            localDateRange.endDate.toISOString() : localDateRange.endDate;

        dispatch(fetchDepartmentStatus({
            status: pieStatus,
            startDate,
            endDate
        }));
    }, [pieStatus, dispatch, localDateRange.startDate, localDateRange.endDate]);

    // باليت الألوان الجديدة (نفس ألوان صفحة التفاصيل)
    const palette = [
        '#5bbefa',
        '#b6b6f7',
        '#6ee7e7',
        '#ffe066',
        '#f4511e',
        '#00b894',
        '#e17055',
    ];
    const colors = {
        background: '#f8fafc',
        text: '#2c3e50',
        white: '#ffffff',
        border: '#e0e3e7',
        accent: '#5bbefa',
        primary: palette[0],
        secondary: palette[1],
        success: palette[2],
        warning: palette[3],
        danger: palette[4],
        info: palette[5],
        dark: palette[6],
    };

    // تحديث البيانات عند تحميل الصفحة
    useEffect(() => {
        dispatch(fetchStats());
        dispatch(fetchDepartments());

        // تحميل البيانات الأولية مع نطاق التاريخ الافتراضي
        dispatch(fetchTimeAnalysis({
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
        }));
        dispatch(fetchRequestsCount({
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
        }));
        dispatch(fetchCreatedRequests({
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
        }));
        // جلب بيانات حالة الإدارات
        dispatch(fetchDepartmentStatus({
            status: pieStatus,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
        }));
    }, [dispatch]);

    // تحديث البيانات عند تغيير نطاق التاريخ أو حالة الطلب المختارة للمخطط الدائري
    useEffect(() => {
        if (localDateRange.startDate && localDateRange.endDate) {
            // تحديث Redux بنطاق التاريخ الجديد
            dispatch(setDateRange({
                startDate: localDateRange.startDate instanceof Date ? localDateRange.startDate.toISOString() : localDateRange.startDate,
                endDate: localDateRange.endDate instanceof Date ? localDateRange.endDate.toISOString() : localDateRange.endDate
            }));

            // إعادة جلب البيانات بناءً على نطاق التاريخ الجديد
            dispatch(fetchTimeAnalysis({
                startDate: localDateRange.startDate instanceof Date ? localDateRange.startDate.toISOString() : localDateRange.startDate,
                endDate: localDateRange.endDate instanceof Date ? localDateRange.endDate.toISOString() : localDateRange.endDate
            }));
            dispatch(fetchRequestsCount({
                startDate: localDateRange.startDate instanceof Date ? localDateRange.startDate.toISOString() : localDateRange.startDate,
                endDate: localDateRange.endDate instanceof Date ? localDateRange.endDate.toISOString() : localDateRange.endDate
            }));
            dispatch(fetchCreatedRequests({
                startDate: localDateRange.startDate instanceof Date ? localDateRange.startDate.toISOString() : localDateRange.startDate,
                endDate: localDateRange.endDate instanceof Date ? localDateRange.endDate.toISOString() : localDateRange.endDate
            }));
            // جلب بيانات حالة الإدارات
            dispatch(fetchDepartmentStatus({
                status: pieStatus,
                startDate: localDateRange.startDate instanceof Date ? localDateRange.startDate.toISOString() : localDateRange.startDate,
                endDate: localDateRange.endDate instanceof Date ? localDateRange.endDate.toISOString() : localDateRange.endDate
            }));
        }
    }, [localDateRange.startDate, localDateRange.endDate, pieStatus, dispatch]);

    // معالج تغيير حالة مخطط الدائرة
    const handlePieStatusChange = (e) => {
        const newStatus = e.target.value;

        // تحديث الحالة في Redux
        dispatch(setPieStatus(newStatus));

        // إعادة تحميل بيانات المخطط الدائري مع الحالة الجديدة
        dispatch(fetchDepartmentStatus({
            status: newStatus,
            startDate: localDateRange.startDate,
            endDate: localDateRange.endDate
        }));
    };

    // تحديث ألوان الكروت بنفس الترتيب
    const statsCards = [
        { id: 1, title: 'إجمالي عدد الطلبات', value: stats.totalRequests, icon: <FaFileAlt />, color: palette[0] },
        { id: 2, title: 'قيد التنفيذ', value: stats.pendingRequests, icon: <FaRegClock />, color: palette[3] },
        { id: 3, title: 'متاخر', value: stats.delayedRequests, icon: <FaExclamationTriangle />, color: palette[1] },
        { id: 4, title: 'مقبول', value: stats.approvedRequests, icon: <FaCheckCircle />, color: palette[5] },
        { id: 5, title: 'مرفوض', value: stats.rejectedRequests, icon: <FaTimesCircle />, color: palette[4] },
    ];

    // إعداد بيانات مخطط الدائرة بناءً على البيانات من API فقط
    const getPieChartData = () => {
        // console.log(" Department Status original data:", departmentStatus);
        // console.log(" Pie Status:", pieStatus);
        // console.log(" Departments list:", departments);

        // قائمة الإدارات (استخدم الإدارات الفعلية إذا كانت متوفرة)
        const departmentNames = departments.length ? departments.map(d => d.name) : [];

        // تحقق مما إذا كانت البيانات متوفرة
        if (!departmentStatus || !departmentStatus.data) {
            // إرجاع بيانات فارغة إذا لم تكن البيانات متوفرة
            return {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [],
                    borderWidth: 1,
                    borderColor: 'white'
                }]
            };
        }

        // تعديل البيانات إذا كانت الحالة هي "قيد التنفيذ"
        let displayLabels = departmentStatus.labels || departmentNames;
        let displayValues = [...(departmentStatus.data || [])];

        // إذا كانت الحالة هي "قيد التنفيذ"، نحتاج إلى الحصول على عدد الطلبات المتأخرة لكل إدارة
        if (pieStatus === 'pending') {
            // هنا نفترض أن البيانات الواردة من API تشمل بالفعل الطلبات المتأخرة
            // لذلك لا نحتاج إلى تعديل البيانات، لأن الخدمة الخلفية يجب أن تكون قد قامت بالفعل بالحساب الصحيح
            // إذا كنت تريد تعديل البيانات هنا، فأنت بحاجة إلى بيانات إضافية عن الطلبات المتأخرة لكل إدارة
        }

        // تحقق مما إذا كانت جميع البيانات صفرية
        const isAllZeros = displayValues && displayValues.every(value => value === 0);

        // إذا كانت كل القيم صفراً، استخدم قيمة 1 لكل عنصر لإظهار المخطط بشكل متساوٍ مع نمط شفاف
        if (isAllZeros) {
            displayValues = displayValues.map(() => 1);
        }

        // تخصيص ألوان للإدارات - إذا كانت جميع القيم صفرية استخدم ألوان باهتة
        const departmentColors = displayLabels.map((_, index) => {
            const color = palette[index % palette.length];
            return isAllZeros ? `${color}50` : color; // إضافة شفافية للألوان إذا كانت جميع القيم صفرية
        });

        // إنشاء بيانات المخطط
        const chartData = {
            labels: displayLabels,
            datasets: [{
                data: displayValues,
                backgroundColor: departmentColors,
                borderWidth: isAllZeros ? 0.5 : 1,
                borderColor: isAllZeros ? '#e0e0e0' : 'white',
                hoverBorderColor: isAllZeros ? '#ccc' : 'white',
                hoverBorderWidth: isAllZeros ? 1 : 2,
            }]
        };

        return chartData;
    };

    // إعداد بيانات مخطط الأعمدة لمتوسط وقت المعالجة
    const getProcessingTimeData = () => {
        if (!departments.length || !timeAnalysis.data) {
            return {
                labels: [],
                datasets: [{
                    label: 'متوسط وقت المعالجة',
                    data: [],
                    backgroundColor: [],
                    borderWidth: 1,
                }]
            };
        }

        // تخصيص ألوان للإدارات
        const departmentColors = departments.map((_, index) => palette[index % palette.length]);

        return {
            labels: timeAnalysis.labels,
            datasets: [{
                label: 'متوسط وقت المعالجة',
                data: timeAnalysis.data,
                backgroundColor: departmentColors,
                borderWidth: 1,
            }]
        };
    };

    // إعداد بيانات مخطط الخط للطلبات المنشأة
    const getCreatedRequestsLineData = () => {
        if (!createdRequests.labels || !createdRequests.data) {
            return {
                labels: [],
                datasets: [{
                    label: 'عدد الطلبات المنشأة',
                    data: [],
                    borderColor: palette[0],
                    backgroundColor: `${palette[0]}20`,
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: palette[0],
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            };
        }

        return {
            labels: createdRequests.labels,
            datasets: [{
                label: 'عدد الطلبات المنشأة',
                data: createdRequests.data,
                borderColor: palette[0],
                backgroundColor: `${palette[0]}20`,
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: palette[0],
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        };
    };

    // بيانات مخطط الأعمدة لعدد الطلبات لكل إدارة
    const getDepartmentRequestsData = () => {
        if (!departments.length || !requestsCount.data) {
            return {
                labels: [],
                datasets: [{
                    label: 'عدد الطلبات',
                    data: [],
                    backgroundColor: [],
                    borderWidth: 1,
                }]
            };
        }

        // تخصيص ألوان للإدارات
        const departmentColors = departments.map((_, index) => palette[index % palette.length]);

        return {
            labels: requestsCount.labels,
            datasets: [{
                label: 'عدد الطلبات',
                data: requestsCount.data,
                backgroundColor: departmentColors,
                borderColor: departmentColors.map(color => color + '80'), // إضافة حدود شفافة
                borderWidth: 1,
            }]
        };
    };

    // خيارات المخططات
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                align: 'center',
                display: true,
                labels: {
                    font: {
                        family: 'Cairo, sans-serif',
                        size: 13,
                        weight: 'bold'
                    },
                    color: '#000000',
                    boxWidth: 15,
                    padding: 15,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            tooltip: {
                titleFont: {
                    family: 'Cairo, sans-serif',
                    size: 14
                },
                bodyFont: {
                    family: 'Cairo, sans-serif',
                    size: 13
                },
                backgroundColor: `${colors.text}e0`,
                titleColor: 'white',
                bodyColor: 'white',
                borderColor: palette[0],
                borderWidth: 1,
                padding: 12
            }
        },
        layout: {
            padding: {
                left: 20,
                right: 20,
                top: 20,
                bottom: 120 // زيادة المساحة للـ legend
            }
        }
    };

    // تعريف خيارات مخطط الأعمدة
    const barChartOptions = {
        ...chartOptions,
        plugins: {
            ...chartOptions.plugins,
            legend: {
                ...chartOptions.plugins.legend,
                position: 'bottom',
                display: true
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: `${colors.text}20`,
                },
                ticks: {
                    font: {
                        family: 'Cairo, sans-serif',
                        size: 14,
                        weight: 'bold'
                    },
                    color: '#000000'
                }
            },
            x: {
                grid: {
                    color: `${colors.text}10`,
                },
                ticks: {
                    font: {
                        family: 'Cairo, sans-serif',
                        size: 14,
                        weight: 'bold'
                    },
                    color: '#000000'
                }
            }
        }
    };

    // Pie Chart options
    const pieChartOptions = {
        ...chartOptions,
        plugins: {
            ...chartOptions.plugins,
            legend: {
                position: 'bottom',
                align: 'center',
                display: true,
                rtl: true,
                labels: {
                    font: {
                        family: 'Cairo, sans-serif',
                        size: 12,
                        weight: 'bold'
                    },
                    color: '#000000',
                    boxWidth: 12,
                    padding: 10,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            tooltip: {
                ...chartOptions.plugins.tooltip,
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';

                        // التحقق مما إذا كانت جميع البيانات صفرية
                        const isAllZeros = departmentStatus.data && departmentStatus.data.every(value => value === 0);

                        // إذا كانت كل القيم صفراً، أظهر "لا توجد طلبات" بدلاً من الصفر
                        const value = isAllZeros ?
                            "لا توجد طلبات" :
                            (departmentStatus.data && departmentStatus.data[context.dataIndex] || 0) + " طلب";

                        return `${label}: ${value}`;
                    }
                }
            },
            datalabels: {
                display: false // إخفاء تسميات البيانات داخل المخطط
            }
        },
        layout: {
            padding: {
                left: 10,
                right: 10,
                top: 20,
                bottom: 20
            }
        },
        animation: {
            animateScale: true,
            animateRotate: true
        },
        cutout: '30%', // جعل المخطط أكثر سمكاً
        radius: '85%'  // تقليل حجم المخطط قليلاً للحصول على مظهر أفضل
    };

    // مراجع للمخططات البيانية (للتقرير)
    const pieChartRef = React.useRef(null);
    const barChartRef = React.useRef(null);
    const lineChartRef = React.useRef(null);
    const timeLineChartRef = React.useRef(null);

    // خيارات حالة الطلبات
    const statusOptions = [
        { value: 'delayed', label: 'متأخره' },
        { value: 'rejected', label: 'مرفوض' },
        { value: 'approved', label: 'مقبول' },
        { value: 'pending', label: 'قيد التنفيذ' },
    ];

    // دالة توليد التقرير
    const handleGenerateReport = async () => {
        try {
            const chartRefs = {
                pieChartRef,
                barChartRef,
                lineChartRef,
                timeLineChartRef
            };

            // جمع البيانات اللازمة للتقرير
            const reportData = {
                departments: departments,
                stats: stats,
                timeAnalysis: timeAnalysis,
                requestsCount: requestsCount,
                createdRequests: createdRequests,
                dateRange: [localDateRange.startDate, localDateRange.endDate],
                pieStatus: pieStatus
            };

            await generateDashboardReport(
                localDateRange,
                departments,
                chartRefs,
                pieStatus,
                reportData
            );
        } catch (error) {
            console.error('خطأ في توليد التقرير:', error);
        }
    };

    // عرض شاشة التحميل
    const isLoading = loading.stats || loading.departments || loading.timeAnalysis ||
        loading.requestsCount || loading.createdRequests;

    if (isLoading && (!departments.length || !stats.totalRequests)) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loader}></div>
                <p>جاري تحميل البيانات...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>
                    <FaClipboardList className={styles.titleIcon} /> إدارة التقارير
                </h1>
                <p className={styles.pageDescription}>
                    مرحباً بك في لوحة تحكم التقارير والإحصائيات العامة للنظام
                </p>
            </div>

            <div className={styles.departmentsSection}>
                <h2 className={styles.sectionTitle}>الإدارات</h2>
                {error.departments ? (
                    <div style={{
                        padding: '20px',
                        backgroundColor: '#fff3f3',
                        border: '1px solid #ffcdd2',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        <p style={{ color: '#f44336', marginBottom: '10px' }}>
                            <FaExclamationTriangle style={{ marginLeft: '8px' }} />
                            حدث خطأ أثناء جلب بيانات الإدارات
                        </p>
                        <button
                            onClick={() => dispatch(fetchDepartments())}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#5bbefa',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            إعادة المحاولة
                        </button>
                    </div>
                ) : loading.departments ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <div className={styles.loader}></div>
                        <p>جاري تحميل بيانات الإدارات...</p>
                    </div>
                ) : (
                    <div className={styles.departmentsGrid}>
                        {departments && departments.length > 0 ? (
                            departments.map(dept => (
                                <Link to={`/reports/department/${dept.id}`} key={dept.id} className={styles.departmentCard}>
                                    <h3 className={styles.departmentName}>
                                        {dept.name}
                                        <FaAngleLeft className={styles.arrowIcon} />
                                    </h3>
                                </Link>
                            ))
                        ) : (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: '#666' }}>
                                <p>لا توجد إدارات للعرض</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className={styles.statsCardsContainer}>
                <h2 className={styles.sectionTitle}>احصائيات عامه عن السيستم</h2>
                <div className={styles.departmentsGrid}>
                    {statsCards.map(card => (
                        <div key={card.id} className={styles.statBox} style={{ border: `2px solid ${card.color}` }}>
                            <div className={styles.iconContainer} style={{ background: card.color, color: '#fff' }}>
                                {card.icon}
                            </div>
                            <div className={styles.statDetails}>
                                <span className={styles.value}>{card.value !== undefined ? card.value : 0}</span>
                                <span className={styles.title}>{card.title}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.filtersSection}>
                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>الفترة الزمنية:</label>
                    <div className={styles.dateRangeContainer}>
                        <div className={styles.dateInputGroup}>
                            <span className={styles.dateLabel}>من:</span>
                            <DatePicker
                                selected={localDateRange.startDate}
                                onChange={(date) => {
                                    const newRange = { ...localDateRange, startDate: date };
                                    if (date > localDateRange.endDate) {
                                        newRange.endDate = date;
                                    }
                                    handleDateChange([newRange.startDate, newRange.endDate]);
                                }}
                                className={styles.datePicker}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="تاريخ البداية"
                                isClearable={false}
                                showMonthDropdown
                                showYearDropdown
                                dropdownMode="select"
                                disabled={isResetting}
                            />
                        </div>
                        <div className={styles.dateInputGroup}>
                            <span className={styles.dateLabel}>إلى:</span>
                            <DatePicker
                                selected={localDateRange.endDate}
                                onChange={(date) => {
                                    const newRange = { ...localDateRange, endDate: date };
                                    if (date < localDateRange.startDate) {
                                        newRange.startDate = date;
                                    }
                                    handleDateChange([newRange.startDate, newRange.endDate]);
                                }}
                                className={styles.datePicker}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="تاريخ النهاية"
                                isClearable={false}
                                showMonthDropdown
                                showYearDropdown
                                dropdownMode="select"
                                minDate={localDateRange.startDate}
                                disabled={isResetting}
                            />
                        </div>
                        <button
                            onClick={handleResetDateRange}
                            className={`${styles.resetFilterButton} ${isResetting ? styles.resetting : ''}`}
                            title="إعادة تعيين فلتر التاريخ"
                            disabled={isResetting}
                        >
                            {isResetting ? 'جاري المسح...' : 'مسح'}
                        </button>
                    </div>
                    {resetMessage && (
                        <div className={`${styles.resetMessage} ${isResetting ? styles.loading : styles.success}`}>
                            {resetMessage}
                        </div>
                    )}
                </div>

                <button
                    className={styles.generateReportButton}
                    // onClick={handleGenerateReport} // تم تعطيل دالة توليد التقرير مؤقتًا
                    disabled={isResetting}
                >
                    <FaFileExport className={styles.buttonIcon} /> توليد تقرير
                </button>
            </div>

            {/* قسم المخططات */}
            <h2 className={styles.sectionTitle}>المخططات البيانية</h2>
            <div className={styles.chartsGrid}>
                {/* Pie Chart */}
                <div className={styles.chartCard} style={{ margin: '0 auto', maxWidth: 600 }}>
                    <div className={styles.chartTitle}>
                        <FaChartPie className={styles.chartIcon} /> توزيع الطلبات {pieStatus === 'delayed' ? 'المتأخره' : pieStatus === 'rejected' ? 'المرفوضه' : pieStatus === 'approved' ? 'المقبوله' : 'قيد التنفيذ'} حسب الإدارة
                    </div>

                    {/* عنوان فرعي يوضح حالة البيانات */}
                    {!loading.departmentStatus && !error.departmentStatus && departmentStatus.data && departmentStatus.data.every(value => value === 0) && (
                        <div style={{
                            textAlign: 'center',
                            padding: '5px 10px',
                            margin: '5px 0 15px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '4px',
                            color: '#6c757d',
                            fontSize: '12px'
                        }}>
                            لا توجد طلبات بهذه الحالة في الفترة المحددة
                        </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <label style={{ fontWeight: 600, fontSize: 14 }}>الحالة:</label>
                        <select
                            value={pieStatus}
                            onChange={handlePieStatusChange}
                            style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #e6e9ef', fontSize: 14 }}
                        >
                            {statusOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.chartWrapperLarge} style={{ height: '350px', position: 'relative' }}>
                        {loading.departmentStatus && (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                zIndex: 10
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div className={styles.loader} style={{
                                        width: '40px',
                                        height: '40px',
                                        border: '5px solid #f3f3f3',
                                        borderTop: '5px solid #5bbefa',
                                        borderRadius: '50%',
                                        margin: '0 auto 10px',
                                        animation: 'spin 1s linear infinite'
                                    }}></div>
                                    <p style={{ fontSize: '14px', fontWeight: 'bold' }}>جاري تحميل البيانات...</p>
                                </div>
                            </div>
                        )}

                        {error.departmentStatus && !loading.departmentStatus && (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                zIndex: 10
                            }}>
                                <div style={{ textAlign: 'center', padding: '20px' }}>
                                    <div style={{ color: '#f4511e', fontSize: '24px', marginBottom: '10px' }}>
                                        <FaExclamationTriangle />
                                    </div>
                                    <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#f4511e' }}>
                                        حدث خطأ أثناء تحميل البيانات
                                    </p>
                                    <button
                                        onClick={() => dispatch(fetchDepartmentStatus({
                                            status: pieStatus,
                                            startDate: localDateRange.startDate,
                                            endDate: localDateRange.endDate
                                        }))}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#5bbefa',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            marginTop: '10px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        إعادة المحاولة
                                    </button>
                                </div>
                            </div>
                        )}

                        {!loading.departmentStatus && !error.departmentStatus &&
                            ((!departmentStatus.data || departmentStatus.data.length === 0) || departmentStatus.data.every(value => value === 0)) && (
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    zIndex: 10
                                }}>
                                    <div style={{ textAlign: 'center', padding: '20px' }}>
                                        <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#666' }}>
                                            لا توجد طلبات بحالة "{pieStatus === 'delayed' ? 'متاخر' : pieStatus === 'rejected' ? 'مرفوض' : pieStatus === 'approved' ? 'مقبول' : 'قيد التنفيذ'}"
                                        </p>
                                        <p style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                                            يرجى تحديد حالة أخرى أو تغيير نطاق التاريخ
                                        </p>
                                    </div>
                                </div>
                            )}

                        <Pie ref={pieChartRef} data={getPieChartData()} options={pieChartOptions} />
                    </div>
                </div>

                {/* Bar Chart - متوسط وقت المعالجة */}
                <div className={styles.chartCard} style={{ margin: '0 auto', maxWidth: 600 }}>
                    <div className={styles.chartTitle}>
                        <FaChartBar className={styles.chartIcon} /> متوسط وقت المعالجة
                    </div>
                    <div className={styles.barChartContainer}>
                        <div className={styles.barChartWrapper} style={{ height: '450px' }}>
                            <Bar ref={barChartRef} data={getProcessingTimeData()} options={{
                                ...barChartOptions,
                                maintainAspectRatio: false,
                                layout: {
                                    padding: {
                                        left: 20,
                                        right: 20,
                                        top: 20,
                                        bottom: 20
                                    }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        grid: {
                                            color: `${colors.text}20`,
                                        },
                                        ticks: {
                                            font: {
                                                family: 'Cairo, sans-serif',
                                                size: 13,
                                                weight: 'bold'
                                            },
                                            color: '#000000',
                                            padding: 10
                                        }
                                    },
                                    x: {
                                        grid: {
                                            color: `${colors.text}10`,
                                        },
                                        ticks: {
                                            font: {
                                                family: 'Cairo, sans-serif',
                                                size: 13,
                                                weight: 'bold'
                                            },
                                            color: '#000000',
                                            padding: 5
                                        }
                                    }
                                }
                            }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Line Chart - عدد الطلبات المنشأة */}
            <div className={styles.chartCard} style={{ maxWidth: '100%' }}>
                <div className={styles.chartTitle}>
                    <FaChartLine className={styles.chartIcon} /> عدد الطلبات المنشأة
                </div>
                <div className={styles.chartWrapper} style={{ height: '450px' }}>
                    <Line
                        ref={lineChartRef}
                        data={getCreatedRequestsLineData()}
                        options={{
                            ...chartOptions,
                            scales: {
                                x: {
                                    grid: {
                                        color: `${colors.text}15`,
                                    },
                                    ticks: {
                                        font: {
                                            family: 'Cairo, sans-serif',
                                            size: 13,
                                            weight: 'bold'
                                        },
                                        color: '#000000'
                                    }
                                },
                                y: {
                                    grid: {
                                        color: `${colors.text}15`,
                                    },
                                    ticks: {
                                        font: {
                                            family: 'Cairo, sans-serif',
                                            size: 13,
                                            weight: 'bold'
                                        },
                                        color: '#000000'
                                    }
                                }
                            }
                        }}
                    />
                </div>
            </div>

            {/* Bar Chart - عدد الطلبات لكل إدارة */}
            <div className={styles.chartCard}>
                <div className={styles.chartTitle}>
                    <FaChartBar className={styles.chartIcon} /> عدد الطلبات لكل إدارة
                </div>
                <div className={styles.chartWrapper} style={{ height: '500px' }}>
                    <Bar
                        ref={timeLineChartRef}
                        data={getDepartmentRequestsData()}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            indexAxis: 'y',
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                    align: 'center',
                                    onClick: null,
                                    labels: {
                                        font: {
                                            family: 'Cairo, sans-serif',
                                            size: 13,
                                            weight: 'bold'
                                        },
                                        color: '#000000',
                                        boxWidth: 15,
                                        padding: 20,
                                        usePointStyle: true,
                                        pointStyle: 'circle'
                                    }
                                },
                                tooltip: {
                                    titleFont: {
                                        family: 'Cairo, sans-serif'
                                    },
                                    bodyFont: {
                                        family: 'Cairo, sans-serif'
                                    },
                                    backgroundColor: 'rgba(44, 62, 80, 0.9)',
                                    titleColor: colors.white,
                                    bodyColor: colors.white,
                                    borderColor: colors.primary,
                                    borderWidth: 1,
                                    padding: 10,
                                    displayColors: true,
                                    callbacks: {
                                        label: function (context) {
                                            return ` ${context.parsed.x} طلب`;
                                        }
                                    }
                                }
                            },
                            layout: {
                                padding: {
                                    left: 20,
                                    right: 20,
                                    top: 10,
                                    bottom: 30
                                }
                            },
                            scales: {
                                x: {
                                    beginAtZero: true,
                                    grid: {
                                        color: `${colors.text}15`,
                                    },
                                    ticks: {
                                        font: {
                                            family: 'Cairo, sans-serif',
                                            size: 13,
                                            weight: 'bold'
                                        },
                                        color: '#000000',
                                        padding: 10
                                    }
                                },
                                y: {
                                    grid: {
                                        display: false,
                                    },
                                    ticks: {
                                        font: {
                                            family: 'Cairo, sans-serif',
                                            size: 13,
                                            weight: 'bold'
                                        },
                                        color: '#000000',
                                        padding: 20
                                    }
                                }
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ReportsDashboard;
