import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaArrowRight, FaChartBar, FaChartLine, FaChartPie, FaFileAlt, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaRegClock, FaInbox, FaShare, FaFileExport, FaSync } from 'react-icons/fa';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './DepartmentDetails.module.css';
import { generateDepartmentReport } from './DepartmentReportGenerator';
import {
    fetchDepartmentDetails,
    fetchDepartmentStats,
    fetchProcessingTimeStats,
    fetchRequestsCountByType,
    fetchRejectionReasons,
    fetchTimeAnalysis,
    fetchStatusPieChart,
    setDateRange as setReduxDateRange,
    selectDepartment,
    selectStats,
    selectProcessingTimeStats,
    selectRequestsCountByType,
    selectRejectionReasons,
    selectTimeAnalysis,
    selectStatusPieChart,
    selectDateRange,
    selectLoading,
    selectError
} from '../../../Redux/slices/departmentDetailsSlice';

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
    const dispatch = useDispatch();

    // حالة تحميل محلية قبل استخدام React-Redux
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    // استخدام React-Redux للوصول إلى البيانات من المخزن مع التحقق من وجود المخزن
    const reduxState = useSelector(state => state);
    const department = useSelector(state => state.departmentDetails ? selectDepartment(state) : null);
    const stats = useSelector(state => state.departmentDetails ? selectStats(state) : {});
    const processingTimeStats = useSelector(state => state.departmentDetails ? selectProcessingTimeStats(state) : { labels: [], data: [] });
    const requestsCountByType = useSelector(state => state.departmentDetails ? selectRequestsCountByType(state) : { labels: [], data: [] });
    const rejectionReasons = useSelector(state => state.departmentDetails ? selectRejectionReasons(state) : { labels: [], data: [] });
    const timeAnalysis = useSelector(state => state.departmentDetails ? selectTimeAnalysis(state) : { labels: [], receivedData: [], processedData: [] });
    const statusPieChart = useSelector(state => state.departmentDetails ? selectStatusPieChart(state) : { labels: [], data: [] });
    const dateRangeFromRedux = useSelector(state => state.departmentDetails ? selectDateRange(state) : {
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        endDate: new Date()
    });
    const loading = useSelector(state => state.departmentDetails ? selectLoading(state) : {});
    const errors = useSelector(state => state.departmentDetails ? selectError(state) : {});

    // حالة محلية لتاريخ البداية والنهاية مع التحقق من صحة البيانات
    const defaultStartDate = new Date(new Date().setMonth(new Date().getMonth() - 1));
    const defaultEndDate = new Date();

    const [dateRange, setLocalDateRange] = useState([
        dateRangeFromRedux?.startDate || defaultStartDate,
        dateRangeFromRedux?.endDate || defaultEndDate
    ]);
    const [startDate, endDate] = dateRange;

    // حالة تحميل محلية
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    // التحقق من وجود شريحة departmentDetails في المخزن
    useEffect(() => {
        if (reduxState && reduxState.departmentDetails) {
            setIsInitialLoading(false);
        }
    }, [reduxState]);

    // تحديث حالة التاريخ في Redux عند تغييرها محلياً
    useEffect(() => {
        if (startDate && endDate && dispatch) {
            // تحويل كائنات Date إلى سلاسل نصية قبل إرسالها إلى Redux
            const serializedDateRange = {
                startDate: startDate instanceof Date ? startDate.toISOString() : startDate,
                endDate: endDate instanceof Date ? endDate.toISOString() : endDate
            };
            dispatch(setReduxDateRange(serializedDateRange));
        }
    }, [dispatch, startDate, endDate]);

    // جلب البيانات من API عند تحميل الصفحة أو تغيير التاريخ
    useEffect(() => {
        const fetchAllData = async () => {
            if (!id || !dispatch) return;

            try {
                // جلب تفاصيل الإدارة
                dispatch(fetchDepartmentDetails(id));

                // جلب باقي البيانات مع نطاق التاريخ
                const params = {
                    departmentId: id,
                    startDate: startDate instanceof Date ? startDate.toISOString() : startDate,
                    endDate: endDate instanceof Date ? endDate.toISOString() : endDate
                };

                dispatch(fetchDepartmentStats(params));
                dispatch(fetchProcessingTimeStats(params));
                dispatch(fetchRequestsCountByType(params));
                dispatch(fetchRejectionReasons(params));
                dispatch(fetchTimeAnalysis(params));
                dispatch(fetchStatusPieChart(params));
            } catch (error) {
                console.error("خطأ في جلب البيانات:", error);
            }
        };

        fetchAllData();
    }, [dispatch, id, startDate, endDate]);

    // إعادة تحميل البيانات
    const handleRefreshData = () => {
        if (!id || !dispatch) return;

        try {
            const params = {
                departmentId: id,
                startDate: startDate instanceof Date ? startDate.toISOString() : startDate,
                endDate: endDate instanceof Date ? endDate.toISOString() : endDate
            };

            dispatch(fetchDepartmentStats(params));
            dispatch(fetchProcessingTimeStats(params));
            dispatch(fetchRequestsCountByType(params));
            dispatch(fetchRejectionReasons(params));
            dispatch(fetchTimeAnalysis(params));
            dispatch(fetchStatusPieChart(params));
        } catch (error) {
            console.error("خطأ في تحديث البيانات:", error);
        }
    };

    // إعادة تعيين نطاق التاريخ
    const handleResetDateRange = () => {
        const newStartDate = new Date(new Date().setMonth(new Date().getMonth() - 1));
        const newEndDate = new Date();
        setLocalDateRange([newStartDate, newEndDate]);
    };

    // باليت الألوان
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

    // تحديث بيانات مخطط الدائرة
    const statusData = {
        labels: statusPieChart?.labels || ['قيد التنفيذ', 'متاخر', 'مقبول', 'مرفوض'],
        datasets: [
            {
                data: statusPieChart?.data || [0, 0, 0, 0],
                backgroundColor: ['#ffe066', '#b6b6f7', '#00b894', '#f4511e'],
                borderWidth: 1,
            },
        ],
    };

    // بيانات مخطط أوقات المعالجة
    const processingTimeData = {
        labels: processingTimeStats?.labels || [],
        datasets: [
            {
                label: 'متوسط وقت المعالجة (بالأيام)',
                data: processingTimeStats?.data || [],
                backgroundColor: palette[1],
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    // بيانات مخطط عدد الطلبات لكل نوع
    const requestsCountData = {
        labels: requestsCountByType?.labels || [],
        datasets: [
            {
                label: 'عدد الطلبات',
                data: requestsCountByType?.data || [],
                backgroundColor: palette[2],
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
            },
        ],
    };

    // بيانات مخطط أسباب الرفض
    const rejectionData = {
        labels: rejectionReasons?.labels || [],
        datasets: [
            {
                data: rejectionReasons?.data || [],
                backgroundColor: [
                    '#f4511e',
                    '#e17055',
                    '#d63031',
                    '#e84393',
                    '#6c5ce7'
                ],
                borderWidth: 1,
            },
        ],
    };

    // بيانات مخطط التحليل الزمني
    const timeAnalysisData = {
        labels: timeAnalysis?.labels || [],
        datasets: [
            {
                label: 'الطلبات المستلمة',
                data: timeAnalysis?.receivedData || [],
                borderColor: palette[0],
                backgroundColor: 'rgba(91, 190, 250, 0.2)',
                tension: 0.4,
                fill: true
            },
            {
                label: 'الطلبات المعالجة',
                data: timeAnalysis?.processedData || [],
                borderColor: palette[5],
                backgroundColor: 'rgba(0, 184, 148, 0.2)',
                tension: 0.4,
                fill: true
            }
        ],
    };

    // خيارات المخطط الدائري
    const pieChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    font: {
                        size: 14,
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((acc, val) => acc + (val || 0), 0);
                        const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                        return `${context.label}: ${value} (${percentage}%)`;
                    }
                }
            }
        }
    };

    // خيارات مخطط الأعمدة
    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'متوسط وقت المعالجة (بالأيام)',
                    font: {
                        size: 14,
                    }
                }
            },
            x: {
                ticks: {
                    font: {
                        size: 12,
                    },
                    maxRotation: 90,
                    minRotation: 80
                }
            }
        },
        plugins: {
            legend: {
                display: false
            }
        }
    };

    // خيارات مخطط عدد الطلبات
    const requestsCountOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'عدد الطلبات',
                    font: {
                        size: 14,
                    }
                }
            },
            x: {
                ticks: {
                    font: {
                        size: 12,
                    },
                    maxRotation: 90,
                    minRotation: 80
                }
            }
        },
        plugins: {
            legend: {
                display: false
            }
        }
    };

    // خيارات مخطط أسباب الرفض
    const rejectionChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    font: {
                        size: 14,
                    }
                }
            }
        }
    };

    // خيارات مخطط التحليل الزمني
    const timeAnalysisOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'عدد الطلبات',
                    font: {
                        size: 14,
                    }
                }
            }
        },
        plugins: {
            legend: {
                position: 'top'
            }
        }
    };

    // البيانات السريعة في بطاقات
    const quickStats = [
        {
            id: 1,
            title: 'إجمالي الطلبات',
            value: stats?.totalRequests || 0,
            icon: <FaInbox />,
            color: colors.primary
        },
        {
            id: 2,
            title: 'قيد التنفيذ',
            value: stats?.pendingRequests || 0,
            icon: <FaRegClock />,
            color: colors.warning
        },
        {
            id: 3,
            title: 'متأخرة',
            value: stats?.delayedRequests || 0,
            icon: <FaExclamationTriangle />,
            color: colors.secondary
        },
        {
            id: 4,
            title: 'تمت الموافقة',
            value: stats?.approvedRequests || 0,
            icon: <FaCheckCircle />,
            color: colors.success
        },
        {
            id: 5,
            title: 'مرفوضة',
            value: stats?.rejectedRequests || 0,
            icon: <FaTimesCircle />,
            color: colors.danger
        }
    ];

    // إنشاء تقرير بناءً على البيانات الحالية
    const handleGenerateReport = async () => {
        try {
            if (!department) {
                alert('لا يمكن إنشاء التقرير: بيانات الإدارة غير متوفرة');
                return;
            }

            setIsGeneratingReport(true);

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

            // إضافة البيانات المطلوبة للتقرير
            const reportData = {
                pieChartData: statusPieChart || { labels: [], data: [] },
                processingTimeStats: processingTimeStats || { labels: [], data: [] },
                requestsCountByType: requestsCountByType || { labels: [], data: [] },
                timeAnalysis: timeAnalysis || { labels: [], receivedData: [], processedData: [] },
                rejectionReasons: rejectionReasons || { labels: [], data: [] }
            };

            // استدعاء وظيفة إنشاء التقرير
            const success = await generateDepartmentReport(
                department,
                stats || {},
                chartRefs,
                [startDate, endDate],
                reportData
            );

            // إظهار رسالة نجاح أو فشل
            if (success) {
                alert('تم إنشاء التقرير بنجاح وحفظه على جهازك');
            } else {
                alert('حدث خطأ أثناء إنشاء التقرير، يرجى المحاولة مرة أخرى');
            }
        } catch (error) {
            console.error('خطأ في إنشاء التقرير:', error);
            alert('حدث خطأ أثناء إنشاء التقرير، يرجى المحاولة مرة أخرى');
        } finally {
            setIsGeneratingReport(false);
        }
    };

    // عرض شاشة التحميل إذا كانت البيانات قيد التحميل
    const isPageLoading = isInitialLoading ||
        (loading && (loading.department || loading.stats || loading.processingTime ||
            loading.requestsCount || loading.timeAnalysis || loading.statusPieChart));

    if (isPageLoading && !department) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loader}></div>
                <p>جاري تحميل البيانات...</p>
            </div>
        );
    }

    if (!department && !isPageLoading) {
        return (
            <div className={styles.errorContainer}>
                <FaExclamationTriangle className={styles.errorIcon} />
                <h2>الإدارة غير موجودة</h2>
                <p>لم يتم العثور على بيانات لهذه الإدارة</p>
                <button
                    className={styles.backButton}
                    onClick={() => navigate('/reports')}
                >
                    العودة للصفحه الرئيسيه
                </button>
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ marginTop: '10px' }}>
            <div className={styles.pageHeader} style={{ borderColor: department?.color || colors.primary }}>
                <div>
                    <h1 className={styles.pageTitle}>
                        تقارير {department?.name || 'الإدارة'}
                    </h1>
                    <p className={styles.pageDescription}>
                        إحصائيات وتحليلات أداء الإدارة ومتابعة الطلبات
                    </p>
                </div>
                <Link to="/reports" className={styles.backButton}>
                    <FaArrowRight />
                    <span>العودة للصفحه الرئيسيه</span>
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
                            setLocalDateRange(update);
                        }}
                        className={styles.datePicker}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="اختر فترة زمنية"
                    />
                    <button
                        className={styles.resetButton}
                        onClick={handleResetDateRange}
                        title="إعادة تعيين الفترة الزمنية"
                    >
                        إعادة تعيين
                    </button>
                </div>

                <div className={styles.actionsGroup}>
                    <button
                        className={styles.refreshButton}
                        onClick={handleRefreshData}
                        disabled={isPageLoading}
                        title="تحديث البيانات"
                    >
                        <FaSync className={isPageLoading ? styles.spinning : ''} />
                    </button>

                    <button
                        className={styles.generateReportButton}
                        onClick={handleGenerateReport}
                        disabled={isGeneratingReport || isPageLoading || !department}
                    >
                        <FaFileExport className={styles.buttonIcon} /> إنشاء تقرير
                    </button>
                </div>
            </div>

            {/* عرض أخطاء API إذا وجدت */}
            {errors && Object.values(errors).some(error => error) && (
                <div className={styles.errorAlert}>
                    <FaExclamationTriangle />
                    <span>
                        حدثت مشكلة أثناء تحميل بعض البيانات. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.
                    </span>
                </div>
            )}

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
                        {loading?.statusPieChart ? (
                            <div className={styles.chartLoading}>
                                <div className={styles.loader}></div>
                                <p>جاري تحميل البيانات...</p>
                            </div>
                        ) : (
                            <Pie data={statusData} options={pieChartOptions} />
                        )}
                    </div>
                </div>
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>
                        <FaChartBar className={styles.chartIcon} /> متوسط وقت المعالجة
                    </h3>
                    <div className={styles.chartWrapper} ref={processingTimeChartRef}>
                        {loading?.processingTime ? (
                            <div className={styles.chartLoading}>
                                <div className={styles.loader}></div>
                                <p>جاري تحميل البيانات...</p>
                            </div>
                        ) : (
                            <Bar data={processingTimeData} options={barChartOptions} />
                        )}
                    </div>
                </div>
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>
                        <FaChartBar className={styles.chartIcon} /> عدد الطلبات التي وصلت للإدارة
                    </h3>
                    <div className={styles.chartWrapper} ref={requestsCountChartRef}>
                        {loading?.requestsCount ? (
                            <div className={styles.chartLoading}>
                                <div className={styles.loader}></div>
                                <p>جاري تحميل البيانات...</p>
                            </div>
                        ) : (
                            <Bar data={requestsCountData} options={requestsCountOptions} />
                        )}
                    </div>
                </div>
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>
                        <FaChartPie className={styles.chartIcon} /> نسب أسباب الرفض
                    </h3>
                    <div className={styles.chartWrapper} style={{ height: '300px' }} ref={rejectionChartRef}>
                        {loading?.rejectionReasons ? (
                            <div className={styles.chartLoading}>
                                <div className={styles.loader}></div>
                                <p>جاري تحميل البيانات...</p>
                            </div>
                        ) : (
                            <Pie data={rejectionData} options={rejectionChartOptions} />
                        )}
                    </div>
                </div>
            </div>

            <h2 className={styles.sectionTitle}>التحليل الزمني</h2>
            <div className={styles.chartCard} style={{ marginBottom: '30px' }}>
                <h3 className={styles.chartTitle}>
                    <FaChartLine className={styles.chartIcon} /> تطور أعداد الطلبات خلال السنة
                </h3>
                <div className={styles.chartWrapper} style={{ height: '400px' }} ref={timeAnalysisChartRef}>
                    {loading?.timeAnalysis ? (
                        <div className={styles.chartLoading}>
                            <div className={styles.loader}></div>
                            <p>جاري تحميل البيانات...</p>
                        </div>
                    ) : (
                        <Line data={timeAnalysisData} options={timeAnalysisOptions} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default DepartmentDetails;

