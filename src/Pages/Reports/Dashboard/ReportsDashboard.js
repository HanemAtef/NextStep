import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './ReportsDashboard.module.css';
import { FaChartPie, FaChartBar, FaChartLine, FaClipboardList, FaRegClock, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaFileAlt, FaInbox, FaShare, FaFileExport, FaArrowLeft, FaAngleLeft } from 'react-icons/fa';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { generateDashboardReport } from './DashboardReportGenerator';

// تسجيل جميع مكونات Chart.js
Chart.register(...registerables);

// Make sure Chart.js is properly configured
Chart.defaults.scale.ticks.display = true;

const ReportsDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState([new Date(new Date().setMonth(new Date().getMonth() - 1)), new Date()]);
    const [startDate, endDate] = dateRange;
    const [pieStatus, setPieStatus] = useState('delayed');

    // بيانات ديناميكية للرسومات حسب التاريخ
    const [chartsData, setChartsData] = useState({
        pie: [],
        barProcessing: [],
        barCreated: [],
        lineReceived: [],
        lineProcessed: [],
    });


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

    // بيانات الإدارات مع توزيع الألوان الجديدة (بدون تكرار)
    const departments = [
        { id: 1, name: 'إدارة الدراسات العليا', requests: 78, delayed: 12, rejected: 7, approved: 50, pending: 9, processingTime: 3.2, color: palette[0] },
        { id: 2, name: 'لجنة الدراسات العليا', requests: 65, delayed: 8, rejected: 5, approved: 40, pending: 12, processingTime: 2.7, color: palette[1] },
        { id: 3, name: 'قسم علوم الحاسب', requests: 94, delayed: 15, rejected: 10, approved: 60, pending: 9, processingTime: 4.1, color: palette[2] },
        { id: 4, name: 'قسم نظم المعلومات', requests: 56, delayed: 9, rejected: 6, approved: 30, pending: 11, processingTime: 3.8, color: palette[3] },
        { id: 5, name: 'قسم حسابات علمية', requests: 42, delayed: 5, rejected: 3, approved: 28, pending: 6, processingTime: 2.3, color: palette[4] },
        { id: 6, name: 'قسم الذكاء الاصطناعي', requests: 36, delayed: 4, rejected: 2, approved: 25, pending: 5, processingTime: 3.5, color: palette[5] },
        { id: 7, name: 'مجلس الكلية', requests: 27, delayed: 3, rejected: 2, approved: 18, pending: 4, processingTime: 2.9, color: palette[6] },
    ];

    // إحصائيات الطلبات
    const requestStats = {
        totalRequests: 398,
        pendingRequests: 87,
        delayedRequests: 56,
        approvedRequests: 183,
        rejectedRequests: 72,
        createdRequests: 127,
        receivedRequests: 271
    };

    // تحديث ألوان الكروت بنفس الترتيب
    const statsCards = [
        { id: 1, title: 'إجمالي عدد الطلبات', value: requestStats.totalRequests, icon: <FaFileAlt />, color: palette[0] },
        { id: 2, title: 'قيد التنفيذ', value: requestStats.pendingRequests, icon: <FaRegClock />, color: palette[3] },
        { id: 3, title: 'متأخرة', value: requestStats.delayedRequests, icon: <FaExclamationTriangle />, color: palette[1] },
        { id: 4, title: 'مقبولة', value: requestStats.approvedRequests, icon: <FaCheckCircle />, color: palette[5] },
        { id: 5, title: 'مرفوضة', value: requestStats.rejectedRequests, icon: <FaTimesCircle />, color: palette[4] },
    ];

    // البيانات لمخطط الدائرة لحالات الطلبات
    const requestStatusData = {
        labels: ['قيد التنفيذ', 'متأخرة', 'مقبولة', 'مرفوضة'],
        datasets: [
            {
                data: [requestStats.pendingRequests, requestStats.delayedRequests, requestStats.approvedRequests, requestStats.rejectedRequests],
                backgroundColor: [palette[1], palette[2], palette[3], palette[4]],
                borderWidth: 1,
            },
        ],
    };

    // بيانات المخططات حسب التبويب
    const dailyLabels = Array.from({ length: 30 }, (_, i) => `${i + 1}`);
    const monthlyLabels = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const yearlyLabels = ['2022', '2023', '2024'];

    // بيانات عشوائية
    const getRandomArray = (len, min = 10, max = 100) => Array.from({ length: len }, () => Math.floor(Math.random() * (max - min + 1)) + min);

    // استخدام البيانات الشهرية بشكل ثابت
    const timeLabels = monthlyLabels;
    const receivedData = getRandomArray(12, 40, 90);
    const processedData = getRandomArray(12, 30, 80);

    // بيانات مستقلة لكل رسم
    const [pieData, setPieData] = useState([]);
    const [processingBarData, setProcessingBarData] = useState([]);
    const [createdLineData, setCreatedLineData] = useState([]);
    const [timeLineData, setTimeLineData] = useState({ received: [], processed: [] });

    // منطق الفلترة حسب الفترة الزمنية
    function getDateSeed() {
        // استخدم تاريخ البداية والنهاية كـ seed لتوليد بيانات مختلفة
        return (startDate?.getTime() || 0) + (endDate?.getTime() || 0);
    }
    function seededRandom(seed) {
        // دالة توليد رقم عشوائي ثابت بناءً على seed
        var x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    // دالة لتوليد تسميات الوقت بناءً على نطاق التاريخ
    const generateTimeLabels = (start, end) => {
        if (!start || !end) return monthlyLabels;

        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 31) {
            // عرض يومي
            const days = [];
            let currentDate = new Date(start);
            while (currentDate <= end) {
                days.push(`${currentDate.getDate()}/${currentDate.getMonth() + 1}`);
                currentDate.setDate(currentDate.getDate() + 1);
            }
            return days;
        } else if (diffDays <= 365) {
            // عرض شهري
            const months = new Set();
            let currentDate = new Date(start);
            while (currentDate <= end) {
                const monthName = new Intl.DateTimeFormat('ar', { month: 'long' }).format(currentDate);
                months.add(`${monthName} ${currentDate.getFullYear()}`);
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
            return Array.from(months);
        } else {
            // عرض سنوي
            const years = new Set();
            let currentDate = new Date(start);
            while (currentDate <= end) {
                years.add(currentDate.getFullYear().toString());
                currentDate.setFullYear(currentDate.getFullYear() + 1);
            }
            return Array.from(years);
        }
    };

    // توليد بيانات Pie عند تغيير الزمن أو الحالة فقط
    useEffect(() => {
        const seed = getDateSeed();
        let data;
        if (pieStatus === 'delayed') {
            data = departments.map((_, i) => Math.floor(seededRandom(seed + i + 1000) * 100) + 50);
        } else if (pieStatus === 'rejected') {
            data = departments.map((_, i) => Math.floor(seededRandom(seed + i + 2000) * 100) + 50);
        } else if (pieStatus === 'approved') {
            data = departments.map((_, i) => Math.floor(seededRandom(seed + i + 3000) * 100) + 50);
        } else if (pieStatus === 'pending') {
            data = departments.map((_, i) => Math.floor(seededRandom(seed + i + 4000) * 100) + 50);
        }
        setPieData(data);
    }, [pieStatus, startDate, endDate]);

    // توليد بيانات Bar (متوسط وقت المعالجة) عند تغيير الزمن فقط
    useEffect(() => {
        const seed = getDateSeed();
        const data = departments.map((_, i) => (seededRandom(seed + i + 50) * 5 + 1).toFixed(1));
        setProcessingBarData(data);
    }, [startDate, endDate]);

    // توليد بيانات Line (عدد الطلبات المنشأة) عند تغيير الزمن فقط
    useEffect(() => {
        if (!startDate || !endDate) return;

        const labels = generateTimeLabels(startDate, endDate);
        const seed = getDateSeed();
        const data = Array.from({ length: labels.length }, (_, i) =>
            Math.floor(seededRandom(seed + i) * 200) + 50
        );
        setCreatedLineData({ labels, data });
    }, [startDate, endDate]);

    // // توليد بيانات Line (التحليل الزمني) عند تغيير الزمن فقط
    // useEffect(() => {
    //     if (!startDate || !endDate) return;

    //     const labels = generateTimeLabels(startDate, endDate);
    //     const seed = getDateSeed();
    //     const received = Array.from({ length: labels.length }, (_, i) =>
    //         Math.floor(seededRandom(seed + i) * 90) + 40
    //     );
    //     const processed = Array.from({ length: labels.length }, (_, i) =>
    //         Math.floor(seededRandom(seed + i + 100) * 80) + 30
    //     );
    //     setTimeLineData({ labels, received, processed });
    // }, [startDate, endDate]);

    // // بيانات Pie Chart
    const dynamicPieData = {
        labels: departments.map(d => d.name),
        datasets: [
            {
                data: pieData,
                backgroundColor: departments.map(d => d.color),
                borderWidth: 1,
            },
        ],
    };
    // بيانات Bar Chart
    const processingTimeData = {
        labels: departments.map(d => d.name),
        datasets: [
            {
                label: 'متوسط وقت المعالجة',
                data: processingBarData,
                backgroundColor: departments.map(d => d.color),
                borderWidth: 1,
            },
        ],
    };
    // بيانات Line Chart - عدد الطلبات المنشأة
    const createdRequestsLineLabels = createdLineData.labels || [];
    const createdRequestsLineData = createdLineData.data || [];
    // بيانات Line Chart - التحليل الزمني
    // const timeAnalysisData = {
    //     labels: timeLineData.labels || [],
    //     datasets: [
    //         {
    //             label: 'الطلبات المستلمة',
    //             data: timeLineData.received || [],
    //             borderColor: colors.primary,
    //             backgroundColor: `${colors.primary}33`,
    //             fill: true,
    //         },
    //         {
    //             label: 'الطلبات المعالجة',
    //             data: timeLineData.processed || [],
    //             borderColor: colors.secondary,
    //             backgroundColor: `${colors.secondary}33`,
    //             fill: true,
    //         },
    //     ],
    // };

    // خيارات المخططات
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                align: 'center',
                onClick: null,
                display: true,
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
                },
                title: {
                    display: true,
                    font: {
                        family: 'Cairo, sans-serif',
                        size: 14,
                        weight: 'bold'
                    },
                    color: '#000000',
                    padding: 20
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
                bottom: 60 // زيادة المساحة أسفل المخطط للـ legend
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
                        size: 13,
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
                        size: 13,
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
                position: 'right',
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
                    boxWidth: 15,
                    padding: 15,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            }
        },
        layout: {
            padding: {
                left: 10,
                right: 40,
                top: 20,
                bottom: 20
            }
        }
    };

    // خيارات Bar Chart أفقي لعدد الطلبات المنشأة
    const barCreatedHorizontalOptions = {
        ...barChartOptions,
        indexAxis: 'y',
    };

    // مراجع للمخططات البيانية
    const pieChartRef = React.useRef(null);
    const barChartRef = React.useRef(null);
    const lineChartRef = React.useRef(null);
    const timeLineChartRef = React.useRef(null);

    // دالة توليد التقرير
    const handleGenerateReport = async () => {
        try {
            const chartRefs = {
                pieChartRef,
                barChartRef,
                lineChartRef,
                timeLineChartRef
            };

            // توليد تواريخ الفترات
            const periods = createdLineData.labels.map((label, index) => {
                // حساب التاريخ بناءً على نوع العرض
                const diffTime = Math.abs(endDate - startDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                let currentDate = new Date(startDate);
                if (diffDays <= 31) {
                    // عرض يومي
                    currentDate.setDate(currentDate.getDate() + index);
                    return {
                        start: new Date(currentDate),
                        end: new Date(currentDate)
                    };
                } else if (diffDays <= 365) {
                    // عرض شهري
                    currentDate.setMonth(startDate.getMonth() + index);
                    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                    return {
                        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
                        end: endOfMonth
                    };
                } else {
                    // عرض سنوي
                    const year = parseInt(label);
                    return {
                        start: new Date(year, 0, 1),
                        end: new Date(year, 11, 31)
                    };
                }
            });

            // استخراج بيانات الإدارات من departmentRequestsData
            const departmentCounts = departmentRequestsData.datasets[0].data;

            await generateDashboardReport(
                dateRange,
                departments,
                chartRefs,
                pieStatus,
                {
                    pie: pieData,
                    barProcessing: processingBarData,
                    barCreated: createdRequestsLineData,
                    lineReceived: timeLineData.received,
                    lineProcessed: timeLineData.processed,
                    periods: periods,
                    departmentCounts: departmentCounts, // إضافة بيانات عدد الطلبات لكل إدارة
                    totalRequests: requestStats.totalRequests,
                    pendingRequests: requestStats.pendingRequests,
                    delayedRequests: requestStats.delayedRequests,
                    approvedRequests: requestStats.approvedRequests,
                    rejectedRequests: requestStats.rejectedRequests
                }
            );
        } catch (error) {
            console.error('خطأ في توليد التقرير:', error);
        }
    };

    // خيارات الحالات
    const statusOptions = [
        { value: 'delayed', label: 'متأخرة' },
        { value: 'rejected', label: 'مرفوضة' },
        { value: 'approved', label: 'مقبولة' },
        { value: 'pending', label: 'قيد التنفيذ' },
    ];

    // محاكاة لتحميل البيانات
    useEffect(() => {
        // إذا كانت بيانات الرسوم البيانية فارغة، املأها من بيانات الإدارات
        if (
            chartsData.pie.length === 0 ||
            chartsData.barProcessing.length === 0 ||
            chartsData.barCreated.length === 0
        ) {
            setChartsData({
                pie: departments.map(d => d.requests),
                barProcessing: departments.map(d => d.processingTime),
                barCreated: departments.map(d => d.requests),
                lineReceived: [],
                lineProcessed: []
            });
        }
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    // Bar Chart عدد الطلبات المنشأة
    const createdRequestsData = {
        labels: departments.map(d => d.name),
        datasets: [
            {
                label: 'عدد الطلبات المنشأة',
                data: chartsData.barCreated,
                backgroundColor: departments.map(d => d.color),
                borderWidth: 1,
            },
        ],
    };

    // بيانات الطلبات لكل إدارة تتغير بتغير الزمن
    const [departmentRequestsData, setDepartmentRequestsData] = useState({
        labels: departments.map(d => d.name),
        datasets: [
            {
                label: 'عدد الطلبات',
                data: departments.map(d => d.requests),
                backgroundColor: departments.map(d => d.color),
                borderWidth: 1,
            },
        ],
    });

    // تحديث بيانات الطلبات لكل إدارة عند تغيير الزمن
    useEffect(() => {
        const seed = getDateSeed();
        // استخدام بيانات شهرية بشكل ثابت
        const data = departments.map((d, i) => Math.floor(seededRandom(seed + i + 5000) * 50) + Math.floor(d.requests * 0.7));

        // استخدام باليت الألوان من صفحة التفاصيل
        const barColors = [
            palette[0], // أزرق فاتح
            palette[1], // بنفسجي فاتح
            palette[2], // أخضر فيروزي
            palette[3], // أصفر
            palette[4], // برتقالي غامق
            palette[5], // أخضر زمردي
            palette[6], // أحمر برتقالي
        ];

        setDepartmentRequestsData({
            labels: departments.map(d => d.name),
            datasets: [
                {
                    label: 'عدد الطلبات',
                    data: data,
                    backgroundColor: barColors,
                    borderWidth: 1,
                    borderColor: barColors.map(color => color + '80'), // إضافة حدود شفافة
                },
            ],
        });
    }, [startDate, endDate]);

    if (loading) {
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
                <div className={styles.departmentsGrid}>
                    {departments.map(dept => (
                        <Link to={`/reports/department/${dept.id}`} key={dept.id} className={styles.departmentCard}
                        >
                            <h3 className={styles.departmentName}>{dept.name} <FaAngleLeft className={styles.arrowIcon} /></h3>
                        </Link>
                    ))}
                </div>
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
                                <span className={styles.value}>{card.value}</span>
                                <span className={styles.title}>{card.title}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.filtersSection}>
                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>الفترة الزمنية:</label>
                    <DatePicker
                        selectsRange={true}
                        startDate={startDate}
                        endDate={endDate}
                        onChange={(update) => setDateRange(update)}
                        className={styles.datePicker}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="اختر فترة زمنية"
                        style={{ fontWeight: 500, fontSize: 13 }}
                    />
                </div>

                <button className={styles.generateReportButton} onClick={handleGenerateReport}>
                    <FaFileExport className={styles.buttonIcon} /> توليد تقرير
                </button>
            </div>

            {/* قسم المخططات */}
            <h2 className={styles.sectionTitle}>المخططات البيانية</h2>
            <div className={styles.chartsGrid}>
                {/* Pie Chart */}
                <div className={styles.chartCard} style={{ margin: '0 auto', maxWidth: 600 }}>
                    <div className={styles.chartTitle}>
                        <FaChartPie className={styles.chartIcon} /> توزيع الطلبات حسب الإدارة
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <label style={{ fontWeight: 600, fontSize: 14 }}>الحالة:</label>
                        <select
                            value={pieStatus}
                            onChange={e => setPieStatus(e.target.value)}
                            style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #e6e9ef', fontSize: 14 }}
                        >
                            {statusOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.chartWrapperLarge} style={{ height: '350px' }}>
                        <Pie ref={pieChartRef} data={dynamicPieData} options={pieChartOptions} />
                    </div>
                </div>
                {/* Bar Chart - متوسط وقت المعالجة */}
                <div className={styles.chartCard} style={{ margin: '0 auto', maxWidth: 600 }}>
                    <div className={styles.chartTitle}>
                        <FaChartBar className={styles.chartIcon} /> متوسط وقت المعالجة
                    </div>
                    <div className={styles.barChartContainer}>
                        <div className={styles.barChartWrapper} style={{ height: '450px' }}>
                            <Bar ref={barChartRef} data={processingTimeData} options={{
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
                        data={{
                            labels: createdRequestsLineLabels,
                            datasets: [
                                {
                                    label: 'عدد الطلبات المنشأة',
                                    data: createdRequestsLineData,
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
                                }
                            ]
                        }}
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
                        data={departmentRequestsData}
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