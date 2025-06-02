import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaArrowRight, FaChartBar, FaChartLine, FaChartPie, FaFileAlt, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaRegClock, FaInbox, FaShare, FaFileExport } from 'react-icons/fa';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './DepartmentDetails.module.css';
import { generateDepartmentReport } from './DepartmentReportGenerator';

// تسجيل جميع مكونات Chart.js
Chart.register(...registerables);

const DepartmentDetails = () => {
    // إنشاء مراجع للمخططات لاستخدامها في إنشاء التقرير
    const pieChartRef = useRef(null);
    const processingTimeChartRef = useRef(null);
    const requestsCountChartRef = useRef(null);
    const timeAnalysisChartRef = useRef(null);
    const rejectionChartRef = useRef(null);
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [department, setDepartment] = useState(null);
    const [dateRange, setDateRange] = useState([new Date(new Date().setMonth(new Date().getMonth() - 1)), new Date()]);
    const [startDate, endDate] = dateRange;
    const [stats, setStats] = useState({
        totalRequests: 142,
        pendingRequests: 45,
        delayedRequests: 12,
        approvedRequests: 67,
        rejectedRequests: 18,
        createdRequests: 53,
        receivedRequests: 89
    });

    // إضافة state جديد لبيانات مخطط الدائرة
    const [pieChartData, setPieChartData] = useState({
        pending: 45,
        delayed: 12,
        approved: 67,
        rejected: 18
    });

    // باليت الألوان الجديدة (نفس ألوان الإدارات في Dashboard)
    const palette = [
        '#5bbefa', // أزرق فاتح
        '#b6b6f7', // بنفسجي فاتح
        '#6ee7e7', // أخضر فيروزي
        '#ffe066', // أصفر
        '#f4511e', // برتقالي غامق
        '#00b894', // أخضر زمردي
        '#e17055', // أحمر برتقالي
    ];
    const colors = {
        primary: palette[0],
        secondary: palette[1],
        success: palette[2],
        warning: palette[3],
        danger: palette[4],
        info: palette[5],
        dark: palette[6],
        background: '#f8fafc',
    };

    // قائمة الإدارات بنفس ترتيب الألوان الجديد
    const departments = [
        { id: "1", name: 'إدارة الدراسات العليا', requests: 78, delayed: 12, color: palette[0] },
        { id: "2", name: 'لجنة الدراسات العليا', requests: 65, delayed: 8, color: palette[1] },
        { id: "3", name: 'قسم علوم الحاسب', requests: 94, delayed: 15, color: palette[2] },
        { id: "4", name: 'قسم نظم المعلومات', requests: 56, delayed: 9, color: palette[3] },
        { id: "5", name: 'قسم حسابات علمية', requests: 42, delayed: 5, color: palette[4] },
        { id: "6", name: 'قسم الذكاء الاصطناعي', requests: 36, delayed: 4, color: palette[5] },
        { id: "7", name: 'مجلس الكلية', requests: 27, delayed: 3, color: palette[6] },
    ];

    // تحديث بيانات مخطط الدائرة عند تغيير التاريخ
    useEffect(() => {
        const updatePieChartData = () => {
            // استخدام نفس دالة توليد البيانات العشوائية
            const seed = getDateSeed();

            // توليد بيانات جديدة بناءً على التاريخ
            const newData = {
                pending: Math.floor(seededRandom(seed + 1) * 50) + 20,
                delayed: Math.floor(seededRandom(seed + 2) * 30) + 10,
                approved: Math.floor(seededRandom(seed + 3) * 70) + 40,
                rejected: Math.floor(seededRandom(seed + 4) * 25) + 15
            };

            setPieChartData(newData);

            // تحديث الإحصائيات العامة أيضاً
            setStats(prevStats => ({
                ...prevStats,
                pendingRequests: newData.pending,
                delayedRequests: newData.delayed,
                approvedRequests: newData.approved,
                rejectedRequests: newData.rejected,
                totalRequests: newData.pending + newData.delayed + newData.approved + newData.rejected
            }));
        };

        updatePieChartData();
    }, [startDate, endDate]);

    // تحديث بيانات مخطط الدائرة
    const statusData = {
        labels: ['قيد التنفيذ', 'متأخر', 'مقبول', 'مرفوض'],
        datasets: [
            {
                data: [
                    pieChartData.pending,
                    pieChartData.delayed,
                    pieChartData.approved,
                    pieChartData.rejected
                ],
                backgroundColor: ['#ffe066', '#b6b6f7', '#00b894', '#f4511e'],
                borderWidth: 1,
            },
        ],
    };

    // بيانات المخططات
    const monthlyLabels = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

    // دالة لتوليد بيانات عشوائية ثابتة بناءً على البذرة
    function getDateSeed() {
        // استخدم تاريخ البداية والنهاية كـ seed لتوليد بيانات مختلفة
        return (startDate?.getTime() || 0) + (endDate?.getTime() || 0);
    }

    function seededRandom(seed) {
        // دالة توليد رقم عشوائي ثابت بناءً على seed
        var x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    // توليد بيانات عشوائية
    const getRandomArray = (len, min = 10, max = 100, seed = 0) =>
        Array.from({ length: len }, (_, i) => Math.floor(seededRandom(seed + i) * (max - min + 1)) + min);

    // بذرة ثابتة للأرقام العشوائية
    const staticSeed = 12345;

    // دالة لتوليد تسميات محور X بناءً على نطاق التاريخ
    const generateTimeLabels = (start, end) => {
        if (!start || !end) return monthlyLabels;

        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + endDate.getMonth() - startDate.getMonth() + 1;

        if (diffMonths <= 1) {
            // إذا كان الفرق شهر أو أقل، اعرض الأيام
            const days = [];
            const currentDate = new Date(startDate);
            while (currentDate <= endDate) {
                days.push(currentDate.getDate().toString());
                currentDate.setDate(currentDate.getDate() + 1);
            }
            return days;
        } else if (diffMonths <= 12) {
            // إذا كان الفرق سنة أو أقل، اعرض الشهور
            const months = [];
            const currentDate = new Date(startDate);
            while (currentDate <= endDate) {
                months.push(monthlyLabels[currentDate.getMonth()]);
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
            return months;
        } else {
            // إذا كان الفرق أكثر من سنة، اعرض السنوات
            const years = [];
            const currentDate = new Date(startDate);
            while (currentDate <= endDate) {
                const year = currentDate.getFullYear().toString();
                if (!years.includes(year)) {
                    years.push(year);
                }
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
            return years;
        }
    };

    // استخدام useMemo لتوليد البيانات بناءً على نطاق التاريخ
    const chartData = useMemo(() => {
        // بيانات افتراضية إذا لم يتم تحديد نطاق التاريخ
        if (!startDate || !endDate) {
            return {
                timeLabels: monthlyLabels,
                receivedData: getRandomArray(12, 40, 90, staticSeed),
                processedData: getRandomArray(12, 30, 80, staticSeed + 100),
                processingTimes: Array.from({ length: 5 }, (_, i) =>
                    (seededRandom(staticSeed + i + 500) * 7 + 2).toFixed(1)),
                requestsCount: Array.from({ length: 5 }, (_, i) =>
                    Math.floor(seededRandom(staticSeed + i + 800) * 100) + 20)
            };
        }

        // توليد تسميات وبيانات جديدة بناءً على نطاق التاريخ
        const labels = generateTimeLabels(startDate, endDate);
        const dateSeed = new Date(startDate).getTime() + new Date(endDate).getTime();

        return {
            timeLabels: labels,
            receivedData: getRandomArray(labels.length, 40, 90, dateSeed),
            processedData: getRandomArray(labels.length, 30, 80, dateSeed + 100),
            processingTimes: Array.from({ length: 5 }, (_, i) =>
                (seededRandom(dateSeed + i + 500) * 7 + 2).toFixed(1)),
            requestsCount: Array.from({ length: 5 }, (_, i) =>
                Math.floor(seededRandom(dateSeed + i + 800) * 100) + 20)
        };
    }, [startDate, endDate, monthlyLabels]); // إعادة حساب البيانات فقط عند تغيير نطاق التاريخ

    // بيانات مخطط الخط للتحليل الزمني - تتغير بناءً على نطاق التاريخ
    const timeAnalysisData = {
        labels: chartData.timeLabels,
        datasets: [
            {
                label: 'الطلبات المستلمة',
                data: chartData.receivedData,
                borderColor: colors.primary,
                backgroundColor: `${colors.primary}20`,
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
            {
                label: 'الطلبات المعالجة',
                data: chartData.processedData,
                borderColor: colors.success,
                backgroundColor: `${colors.success}20`,
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    };

    // الخيارات المشتركة لجميع المخططات
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                align: 'start',
                labels: {
                    boxWidth: 15,
                    padding: 15,
                    font: {
                        family: 'Cairo, sans-serif',
                        size: 12,
                        weight: 'bold'
                    },
                    color: '#000000'
                }
            },
            title: {
                display: false,
                text: 'العنوان',
                font: {
                    family: 'Cairo, sans-serif',
                    size: 14,
                    weight: 'bold'
                },
                color: '#000000',
                padding: 10
            },
            tooltip: {
                titleFont: {
                    family: 'Cairo, sans-serif'
                },
                bodyFont: {
                    family: 'Cairo, sans-serif'
                },
                backgroundColor: 'rgba(44, 62, 80, 0.9)',
                titleColor: 'white',
                bodyColor: 'white',
                borderColor: colors.primary,
                borderWidth: 1,
                padding: 10,
                displayColors: true
            }
        },
    };

    // خيارات مخطط عدد الطلبات
    const requestsCountOptions = {
        ...chartOptions,
        indexAxis: 'x',
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: `${colors.dark}20`,
                },
                ticks: {
                    font: {
                        family: 'Cairo, sans-serif',
                        size: 12,
                        weight: 'bold'
                    },
                    color: '#000000',
                    padding: 10
                }
            },
            x: {
                grid: {
                    color: `${colors.dark}10`,
                    display: false,
                },
                ticks: {
                    font: {
                        family: 'Cairo, sans-serif',
                        size: 12,
                        weight: 'bold'
                    },
                    color: '#000000',
                    padding: 10
                }
            }
        },
        plugins: {
            ...chartOptions.plugins,
            tooltip: {
                ...chartOptions.plugins.tooltip,
                callbacks: {
                    label: function (context) {
                        return `عدد الطلبات: ${context.parsed.y} طلب`;
                    }
                }
            }
        }
    };

    // خيارات مخطط التحليل الزمني
    const timeAnalysisOptions = {
        ...chartOptions,
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: `${colors.dark}20`,
                },
                ticks: {
                    font: {
                        family: 'Cairo, sans-serif',
                        size: 12,
                        weight: 'bold'
                    },
                    color: '#000000',
                    padding: 10
                }
            },
            x: {
                grid: {
                    color: `${colors.dark}10`,
                    display: false,
                },
                ticks: {
                    font: {
                        family: 'Cairo, sans-serif',
                        size: 12,
                        weight: 'bold'
                    },
                    color: '#000000',
                    padding: 10,
                    maxRotation: 45, // تدوير النص لتجنب التداخل
                    autoSkip: true, // تخطي بعض التسميات لتجنب الازدحام
                    autoSkipPadding: 10 // المسافة بين التسميات المعروضة
                }
            }
        },
        plugins: {
            ...chartOptions.plugins,
            tooltip: {
                ...chartOptions.plugins.tooltip,
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += context.parsed.y + ' طلب';
                        }
                        return label;
                    }
                }
            }
        },
        interaction: {
            mode: 'index',
            intersect: false
        }
    };

    // أنواع الطلبات المحددة
    const requestTypes = ['طلب التحاق', 'ايقاف قيد', 'الغاء تسجيل', 'طلب مد', 'طلب منح'];

    // أسباب الرفض وبياناتها
    const rejectionData = {
        labels: ['نقص في الأوراق', 'انتهاء معاد القيد', 'لم يجتاز', 'أسباب أخرى'],
        datasets: [
            {
                data: [40, 25, 20, 15], // النسب المئوية لكل سبب
                backgroundColor: [palette[0], palette[2], palette[4], palette[6]],
                borderWidth: 1,
            },
        ],
    };

    // بيانات مخطط الأعمدة لمتوسط وقت المعالجة وعدد الطلبات ستتحدث من خلال useEffect

    // بيانات مخطط الأعمدة لمتوسط وقت المعالجة
    const processingTimeData = {
        labels: requestTypes,
        datasets: [
            {
                label: 'متوسط وقت المعالجة ',
                data: chartData.processingTimes,
                backgroundColor: [palette[0], palette[2], palette[4], palette[3], palette[5]],
                borderColor: [palette[0], palette[2], palette[4], palette[3], palette[5]],
                borderWidth: 1,
                barPercentage: 0.6,
                categoryPercentage: 0.8,
            },
        ],
    };

    // بيانات مخطط الأعمدة لعدد الطلبات التي وصلت للإدارة
    const requestsCountData = {
        labels: requestTypes,
        datasets: [
            {
                label: 'عدد الطلبات',
                data: chartData.requestsCount,
                backgroundColor: [palette[0], palette[2], palette[4], palette[3], palette[5]],
                borderColor: [palette[0], palette[2], palette[4], palette[3], palette[5]],
                borderWidth: 1,
                barPercentage: 0.6,
                categoryPercentage: 0.8,
            },
        ],
    };

    // إحصائيات سريعة بنفس الألوان الجديدة
    const quickStats = [
        { id: 1, title: 'إجمالي الطلبات', value: stats.totalRequests, icon: <FaFileAlt />, color: palette[0] },
        { id: 2, title: 'قيد التنفيذ', value: stats.pendingRequests, icon: <FaRegClock />, color: palette[3] },
        { id: 3, title: 'متأخرة', value: stats.delayedRequests, icon: <FaExclamationTriangle />, color: palette[1] },
        { id: 4, title: 'مقبولة', value: stats.approvedRequests, icon: <FaCheckCircle />, color: palette[5] },
        { id: 5, title: 'مرفوضة', value: stats.rejectedRequests, icon: <FaTimesCircle />, color: palette[4] },
        { id: 6, title: 'تم إنشاؤها', value: stats.createdRequests, icon: <FaShare />, color: palette[0] },
        { id: 7, title: 'مستقبلة', value: stats.receivedRequests, icon: <FaInbox />, color: palette[2] },
    ];

    // خيارات مخطط الدائرة
    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                align: 'center',
                onClick: null, // تعطيل وظيفة النقر التي تخفي البيانات
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
                },
                title: {
                    display: false,
                    font: {
                        family: 'Cairo, sans-serif',
                        size: 14,
                        weight: 'bold'
                    },
                    color: '#000000',
                    padding: 10
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
                titleColor: 'white',
                bodyColor: 'white',
                borderColor: colors.primary,
                borderWidth: 1,
                padding: 10,
                displayColors: true
            }
        },
    };

    const barChartOptions = {
        ...chartOptions,
        indexAxis: 'x', // للتأكد من أنه عمودي (كولوم)
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: `${colors.dark}20`,
                },
                ticks: {
                    font: {
                        family: 'Cairo, sans-serif',
                        size: 12,
                        weight: 'bold'
                    },
                    color: '#000000',
                    padding: 10
                }
            },
            x: {
                grid: {
                    color: `${colors.dark}10`,
                    display: false,
                },
                ticks: {
                    font: {
                        family: 'Cairo, sans-serif',
                        size: 12,
                        weight: 'bold'
                    },
                    color: '#000000',
                    padding: 10,
                    maxRotation: 45, // تدوير النص لتجنب التداخل
                    autoSkip: true, // تخطي بعض التسميات لتجنب الازدحام
                    autoSkipPadding: 10 // المسافة بين التسميات المعروضة
                }
            }
        },
        plugins: {
            ...chartOptions.plugins,
            tooltip: {
                ...chartOptions.plugins.tooltip,
                callbacks: {
                    label: function (context) {
                        return `متوسط وقت المعالجة: ${context.parsed.y} يوم`;
                    }
                }
            }
        },
        // إضافة خيارات لتحسين عرض المخطط
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false
        }
    };

    // خيارات مخطط أسباب الرفض
    const rejectionChartOptions = {
        ...chartOptions,
        plugins: {
            ...chartOptions.plugins,
            legend: {
                position: 'left',
                align: 'start',
                labels: {
                    padding: 10,
                    font: {
                        size: 13,
                        weight: 'bold',
                        family: 'Cairo, sans-serif'
                    },
                    boxWidth: 15,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `${context.label}: ${context.parsed}%`;
                    }
                }
            }
        }
    };

    const handleGenerateReport = async () => {
        // إظهار رسالة للمستخدم
        alert('جاري إنشاء التقرير... قد يستغرق هذا بضع ثوان');

        // إنشاء كائن يحتوي على جميع مراجع المخططات
        const chartRefs = {
            pieChartRef,
            processingTimeChartRef,
            requestsCountChartRef,
            timeAnalysisChartRef,
            rejectionChartRef
        };

        // استدعاء وظيفة إنشاء التقرير
        const success = await generateDepartmentReport(
            department,
            stats,
            chartRefs,
            dateRange,
            chartData
        );

        // إظهار رسالة نجاح أو فشل
        if (success) {
            alert('تم إنشاء التقرير بنجاح وحفظه على جهازك');
        } else {
            alert('حدث خطأ أثناء إنشاء التقرير، يرجى المحاولة مرة أخرى');
        }
    };

    useEffect(() => {
        // محاكاة جلب البيانات من API
        const fetchDepartmentData = async () => {
            try {
                // جلب معلومات الإدارة باستخدام المعرف
                const dept = departments.find(d => d.id === id);

                if (dept) {
                    setDepartment(dept);
                } else {
                    console.error('الإدارة غير موجودة');
                }
            } catch (error) {
                console.error('حدث خطأ أثناء جلب بيانات الإدارة', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDepartmentData();
    }, [id]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loader}></div>
                <p>جاري تحميل البيانات...</p>
            </div>
        );
    }

    if (!department) {
        return <div>الإدارة غير موجودة</div>;
    }

    return (
        <div className={styles.container} style={{ marginTop: '10px' }}>
            <div className={styles.pageHeader} style={{ borderColor: department.color }}>

                <div>
                    <h1 className={styles.pageTitle}>
                        تقارير {department.name}
                    </h1>
                    <p className={styles.pageDescription}>
                        إحصائيات وتحليلات أداء الإدارة ومتابعة الطلبات
                    </p>
                </div>
                <Link to="/reports" className={styles.backButton}>
                    <FaArrowRight />
                    <span>العودة للتقارير</span>
                </Link>
            </div>

            <div className={styles.filtersSection}>
                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>الفترة الزمنية:</label>
                    <DatePicker
                        selectsRange={true}
                        startDate={startDate}
                        endDate={endDate}
                        onChange={(update) => {
                            setDateRange(update);
                        }}
                        className={styles.datePicker}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="اختر فترة زمنية"
                    />
                </div>



                <button className={styles.generateReportButton} onClick={handleGenerateReport}>
                    <FaFileExport className={styles.buttonIcon} /> إنشاء تقرير
                </button>
            </div>

            <div className={styles.statsCards}>
                {quickStats.map(stat => (
                    <div key={stat.id} className={styles.statCard}>
                        <div className={styles.statIcon} style={{ backgroundColor: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{stat.value}</span>
                            <span className={styles.statLabel}>{stat.title}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.chartsContainer}>
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>
                        <FaChartPie className={styles.chartIcon} /> حالات الطلبات
                    </h3>
                    <div className={styles.chartWrapper} ref={pieChartRef}>
                        <Pie data={statusData} options={pieChartOptions} />
                    </div>
                </div>
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>
                        <FaChartBar className={styles.chartIcon} /> متوسط وقت المعالجة
                    </h3>
                    <div className={styles.chartWrapper} ref={processingTimeChartRef}>
                        <Bar data={processingTimeData} options={barChartOptions} />
                    </div>
                </div>
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>
                        <FaChartBar className={styles.chartIcon} /> عدد الطلبات التي وصلت للإدارة
                    </h3>
                    <div className={styles.chartWrapper} ref={requestsCountChartRef}>
                        <Bar data={requestsCountData} options={requestsCountOptions} />
                    </div>
                </div>
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>
                        <FaChartPie className={styles.chartIcon} /> نسب أسباب الرفض
                    </h3>
                    <div className={styles.chartWrapper} style={{ height: '300px' }}>
                        <Pie data={rejectionData} options={rejectionChartOptions} ref={rejectionChartRef} />
                    </div>
                </div>
            </div>

            <h2 className={styles.sectionTitle}>التحليل الزمني</h2>
            <div className={styles.chartCard} style={{ marginBottom: '30px' }}>
                <h3 className={styles.chartTitle}>
                    <FaChartLine className={styles.chartIcon} /> تطور أعداد الطلبات خلال السنة
                </h3>
                <div className={styles.chartWrapper} style={{ height: '400px' }} ref={timeAnalysisChartRef}>
                    <Line data={timeAnalysisData} options={timeAnalysisOptions} />
                </div>
            </div>
        </div>
    );
};

export default DepartmentDetails; 