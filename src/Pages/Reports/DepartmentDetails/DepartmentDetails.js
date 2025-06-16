import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FaArrowRight,
  FaChartBar,
  FaChartLine,
  FaChartPie,
  FaFileAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaRegClock,
  FaInbox,
  FaShare,
  FaFileExport,
  FaSync,
} from "react-icons/fa";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { FaList } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./DepartmentDetails.module.css";
import { generateDepartmentReport } from "./DepartmentReportGenerator";
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
  selectError,
} from "../../../Redux/slices/departmentDetailsSlice";

// تسجيل جميع مكونات Chart.js
Chart.register(...registerables);

const DepartmentDetails = () => {
  const pieChartRef = useRef(null);
  const processingTimeChartRef = useRef(null);
  const requestsCountChartRef = useRef(null);
  const timeAnalysisChartRef = useRef(null);
  const rejectionChartRef = useRef(null);

  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // const reduxState = useSelector((state) => state);
  const department = useSelector((state) =>
    state.departmentDetails ? selectDepartment(state) : null
  );
  const stats = useSelector((state) =>
    state.departmentDetails ? selectStats(state) : {}
  );
  const processingTimeStats = useSelector((state) =>
    state.departmentDetails
      ? selectProcessingTimeStats(state)
      : { labels: [], data: [] }
  );
  const requestsCountByType = useSelector((state) =>
    state.departmentDetails
      ? selectRequestsCountByType(state)
      : { labels: [], data: [] }
  );
  const rejectionReasons = useSelector((state) =>
    state.departmentDetails
      ? selectRejectionReasons(state)
      : { labels: [], data: [] }
  );
  const timeAnalysis = useSelector((state) =>
    state.departmentDetails
      ? selectTimeAnalysis(state)
      : { labels: [], receivedData: [], processedData: [] }
  );
  const statusPieChart = useSelector((state) =>
    state.departmentDetails
      ? selectStatusPieChart(state)
      : { labels: [], data: [] }
  );
  const dateRangeFromRedux = useSelector((state) =>
    state.departmentDetails
      ? selectDateRange(state)
      : {
          startDate: null,
          endDate: null,
        }
  );
  const loading = useSelector((state) =>
    state.departmentDetails ? selectLoading(state) : {}
  );
  const errors = useSelector((state) =>
    state.departmentDetails ? selectError(state) : {}
  );

  const [dateRange, setLocalDateRange] = useState([
    dateRangeFromRedux?.startDate
      ? new Date(dateRangeFromRedux.startDate)
      : null,
    dateRangeFromRedux?.endDate ? new Date(dateRangeFromRedux.endDate) : null,
  ]);
  const [startDate, endDate] = dateRange;

  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!id || !dispatch) {
        // console.log('No id or dispatch available, skipping data fetch');
        return;
      }

      // console.log('Fetching initial data for department:', id);

      try {
        await dispatch(fetchDepartmentDetails(id)).unwrap();

        const formatDate = (date) => {
          if (!date) return null;
          const d = new Date(date);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(d.getDate()).padStart(2, "0")}`;
        };

        const params = {
          id: id,
          startDate: startDate ? formatDate(startDate) : null,
          endDate: endDate ? formatDate(endDate) : null,
        };

        // console.log('Fetching department data with params:', params);

        await Promise.all([
          dispatch(fetchDepartmentStats(params)),
          dispatch(fetchProcessingTimeStats(params)),
          dispatch(fetchRequestsCountByType(params)),
          dispatch(fetchRejectionReasons(params)),
          dispatch(fetchTimeAnalysis(params)),
          dispatch(
            fetchStatusPieChart({
              id: id,
              startDate: params.startDate,
              endDate: params.endDate,
            })
          ),
        ]);
      } catch (error) {
        console.error("Error fetching department data:", error);
      }
    };

    fetchInitialData();
  }, [id, dispatch]);

  useEffect(() => {
    if (!department || !id) {
      // console.log('No department or id available, skipping data update');
      return;
    }

    if (dispatch && id && (startDate || endDate)) {
      const formatDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(d.getDate()).padStart(2, "0")}`;
      };

      const params = {
        id: id,
        startDate: startDate ? formatDate(startDate) : null,
        endDate: endDate ? formatDate(endDate) : null,
      };

      // console.log('Updating data for department:', id, 'with params:', params);

      dispatch(fetchDepartmentStats(params));
      dispatch(fetchProcessingTimeStats(params));
      dispatch(fetchRequestsCountByType(params));
      dispatch(fetchRejectionReasons(params));
      dispatch(fetchTimeAnalysis(params));
      dispatch(
        fetchStatusPieChart({
          id: id,
          startDate: params.startDate,
          endDate: params.endDate,
        })
      );
    }
  }, [dispatch, id, startDate, endDate, department]);

  useEffect(() => {
    if (dispatch) {
      const serializedDateRange = {
        startDate:
          startDate instanceof Date ? startDate.toISOString() : startDate,
        endDate: endDate instanceof Date ? endDate.toISOString() : endDate,
      };
      dispatch(setReduxDateRange(serializedDateRange));
    }
  }, [dispatch, startDate, endDate]);

  useEffect(() => {
    const interval = setInterval(() => {
      handleRefreshData();
    }, 30000); // كل 30 ثانية

    return () => clearInterval(interval);
  }, [id, startDate, endDate]);
  
  const statusData = useMemo(
    () => ({
      labels: [
        "منشأة قيد التنفيذ",
        "منشأة متأخرة",
        "منشأة مقبولة",
        "منشأة مرفوضة",
        "مستلمة قيد التنفيذ",
        "مستلمة متأخرة",
        "مستلمة مقبولة",
        "مستلمة مرفوضة",
      ],
      datasets: [
        {
          data: [
            stats?.createdByDepartment?.inProgress || 0,
            stats?.createdByDepartment?.delayed || 0,
            stats?.createdByDepartment?.acceptedByOthers || 0,
            stats?.createdByDepartment?.rejectedByOthers || 0,
            stats?.receivedFromOthers?.inProgress || 0,
            stats?.receivedFromOthers?.delayed || 0,
            stats?.receivedFromOthers?.acceptedByDepartment || 0,
            stats?.receivedFromOthers?.rejectedByDepartment || 0,
          ],
          backgroundColor: [
            "#ffe066",
            "#b6b6f7",
            "#00b894",
            "#f4511e",
            "#3498db",
            "#9b59b6",
            "#2ecc71",
            "#e74c3c",
          ],
          borderWidth: 1,
        },
      ],
    }),
    [stats]
  );

  const handleResetDateRange = () => {
    // console.log('Resetting date range');
    setLocalDateRange([null, null]);

    if (dispatch && id) {
      const params = {
        id: id,
        startDate: null,
        endDate: null,
      };

      dispatch(fetchDepartmentStats(params));
      dispatch(fetchProcessingTimeStats(params));
      dispatch(fetchRequestsCountByType(params));
      dispatch(fetchRejectionReasons(params));
      dispatch(fetchTimeAnalysis(params));
      dispatch(
        fetchStatusPieChart({
          id: id,
          startDate: null,
          endDate: null,
        })
      );
    }
  };

  const handleRefreshData = () => {
    // console.log('Refreshing data with current date range:', { startDate, endDate });
    if (!id || !dispatch) return;

    const formatDate = (date) => {
      if (!date) return null;
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`;
    };

    const params = {
      id: id,
      startDate: startDate ? formatDate(startDate) : null,
      endDate: endDate ? formatDate(endDate) : null,
    };

    // console.log('Refreshing with formatted params:', params);

    dispatch(fetchDepartmentStats(params));
    dispatch(fetchProcessingTimeStats(params));
    dispatch(fetchRequestsCountByType(params));
    dispatch(fetchRejectionReasons(params));
    dispatch(fetchTimeAnalysis(params));
    dispatch(
      fetchStatusPieChart({
        id: id,
        startDate: params.startDate,
        endDate: params.endDate,
      })
    );
  };

  // باليت الألوان
  const palette = [
    "#5bbefa",
    "#b6b6f7",
    "#6ee7e7",
    "#ffe066",
    "#f4511e",
    "#00b894",
    "#e17055",
  ];

  const colors = {
    primary: palette[0],
    secondary: palette[1],
    success: palette[2],
    warning: palette[3],
    danger: palette[4],
    info: palette[5],
    dark: palette[6],
    background: "#f8fafc",
  };

  // بيانات مخطط أوقات المعالجة
  const processingTimeData = {
    labels:
      processingTimeStats?.labels?.map((label) =>
        label.replace("الخاص بـ", "").trim()
      ) || [],
    datasets: [
      {
        label: "متوسط وقت المعالجة (بالأيام)",
        data: processingTimeStats?.data || [],
        backgroundColor: palette[1],
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  // بيانات مخطط عدد الطلبات لكل نوع
  const requestsCountData = {
    labels:
      requestsCountByType?.labels?.map((label) =>
        label.replace("الخاص بـ", "").trim()
      ) || [],
    datasets: [
      {
        label: "عدد الطلبات",
        data: requestsCountByType?.data || [],
        backgroundColor: palette[2],
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  // بيانات مخطط أسباب الرفض
  const rejectionData = {
    labels:
      rejectionReasons?.labels?.map((label) =>
        label.replace("الخاص بـ", "").trim()
      ) || [],
    datasets: [
      {
        data: rejectionReasons?.data || [],
        backgroundColor: [
          "#f4511e",
          "#e17055",
          "#d63031",
          "#e84393",
          "#6c5ce7",
        ],
        borderWidth: 1,
      },
    ],
  };

  // بيانات مخطط التحليل الزمني
  const timeAnalysisData = {
    labels:
      timeAnalysis?.labels?.map((label) =>
        label.replace("الخاص بـ", "").trim()
      ) || [],
    datasets: [
      {
        label: "الطلبات المستلمة",
        data: timeAnalysis?.receivedData || [],
        borderColor: palette[0],
        backgroundColor: "rgba(91, 190, 250, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "الطلبات المعالجة",
        data: timeAnalysis?.processedData || [],
        borderColor: palette[5],
        backgroundColor: "rgba(0, 184, 148, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // خيارات المخطط الدائري
  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
        labels: {
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.raw || 0;
            const total = context.dataset.data.reduce(
              (acc, val) => acc + (val || 0),
              0
            );
            const percentage =
              total > 0 ? Math.round((value / total) * 100) : 0;
            return `${context.label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
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
          text: "متوسط وقت المعالجة",
          font: {
            size: 15,
            weight: "bold",
          },
        },
        ticks: {
          font: {
            size: 13,
            weight: "bold",
          },
          padding: 10,
        },
      },
      x: {
        ticks: {
          font: {
            size: 13,
            weight: "bold",
          },
          maxRotation: 45,
          minRotation: 45,
          padding: 15,
          autoSkip: false,
          callback: function (value, index, values) {
            const label = this.getLabelForValue(value);
            const parts = label.split(" - ");
            if (parts.length > 1) {
              return parts[1];
            }
            return label;
          },
        },
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        padding: 12,
        titleFont: {
          size: 13,
          weight: "bold",
        },
        bodyFont: {
          size: 13,
          weight: "bold",
        },
        callbacks: {
          title: function (tooltipItems) {
            const label = tooltipItems[0].label;
            const parts = label.split(" - ");
            if (parts.length > 1) {
              return parts[1];
            }
            return label;
          },
        },
      },
    },
    layout: {
      padding: {
        left: 15,
        right: 15,
        top: 15,
        bottom: 40,
      },
    },
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
          text: "عدد الطلبات",
          font: {
            size: 15,
            weight: "bold",
          },
        },
        ticks: {
          font: {
            size: 13,
            weight: "bold",
          },
          padding: 10,
        },
      },
      x: {
        ticks: {
          font: {
            size: 13,
            weight: "bold",
          },
          maxRotation: 45,
          minRotation: 45,
          padding: 15,
          autoSkip: false,
          callback: function (value, index, values) {
            const label = this.getLabelForValue(value);
            const parts = label.split(" - ");
            if (parts.length > 1) {
              return parts[1];
            }
            return label;
          },
        },
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        padding: 12,
        titleFont: {
          size: 13,
          weight: "bold",
        },
        bodyFont: {
          size: 13,
          weight: "bold",
        },
        callbacks: {
          title: function (tooltipItems) {
            const label = tooltipItems[0].label;
            const parts = label.split(" - ");
            if (parts.length > 1) {
              return parts[1];
            }
            return label;
          },
        },
      },
    },
    layout: {
      padding: {
        left: 15,
        right: 15,
        top: 15,
        bottom: 40,
      },
    },
  };

  // خيارات مخطط أسباب الرفض
  const rejectionChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
        labels: {
          font: {
            size: 13,
            weight: "bold",
          },
          padding: 15,
        },
      },
    },
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
          text: "عدد الطلبات",
          font: {
            size: 15,
            weight: "bold",
          },
        },
        ticks: {
          font: {
            size: 13,
            weight: "bold",
          },
        },
      },
      x: {
        ticks: {
          font: {
            size: 13,
            weight: "bold",
          },
          maxRotation: 45,
          minRotation: 45,
          padding: 15,
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 13,
            weight: "bold",
          },
          padding: 15,
        },
      },
    },
  };

  const quickStats = [
    {
      id: 1,
      title: "إجمالي الطلبات",
      value: stats?.totalRequests || 0,
      icon: <FaList />,
      color: colors.primary,
    },
    {
      id: 2,
      title: "إجمالي الطلبات المنشأة",
      value: stats?.createdByDepartment?.total || 0,
      icon: <FaShare />,
      color: colors.info,
    },
    {
      id: 3,
      title: "منشأة قيد التنفيذ",
      value: stats?.createdByDepartment?.inProgress || 0,
      icon: <FaRegClock />,
      color: colors.warning,
    },
    {
      id: 4,
      title: "منشأة متأخرة",
      value: stats?.createdByDepartment?.delayed || 0,
      icon: <FaExclamationTriangle />,
      color: colors.secondary,
    },
    {
      id: 5,
      title: "منشأة مقبولة",
      value: stats?.createdByDepartment?.acceptedByOthers || 0,
      icon: <FaCheckCircle />,
      color: colors.success,
    },
    {
      id: 6,
      title: "منشأة مرفوضة",
      value: stats?.createdByDepartment?.rejectedByOthers || 0,
      icon: <FaTimesCircle />,
      color: colors.danger,
    },
    {
      id: 7,
      title: "مستلمة قيد التنفيذ",
      value: stats?.receivedFromOthers?.inProgress || 0,
      icon: <FaInbox />,
      color: colors.warning,
    },
    {
      id: 8,
      title: "مستلمة متأخرة",
      value: stats?.receivedFromOthers?.delayed || 0,
      icon: <FaExclamationTriangle />,
      color: colors.secondary,
    },
    {
      id: 9,
      title: "مستلمة مقبولة",
      value: stats?.receivedFromOthers?.acceptedByDepartment || 0,
      icon: <FaCheckCircle />,
      color: colors.success,
    },
    {
      id: 10,
      title: "مستلمة مرفوضة",
      value: stats?.receivedFromOthers?.rejectedByDepartment || 0,
      icon: <FaTimesCircle />,
      color: colors.danger,
    },
  ];

  const handleGenerateReport = async () => {
    try {
      if (!department) {
        alert("لا يمكن إنشاء التقرير: بيانات الإدارة غير متوفرة");
        return;
      }

      setIsGeneratingReport(true);

      alert("جاري إنشاء التقرير... قد يستغرق هذا بضع ثوان");

      const chartRefs = {
        pieChartRef,
        processingTimeChartRef,
        requestsCountChartRef,
        timeAnalysisChartRef,
        rejectionChartRef,
      };

      const reportData = {
        pieChartData: statusPieChart || { labels: [], data: [] },
        processingTimeStats: processingTimeStats || { labels: [], data: [] },
        requestsCountByType: requestsCountByType || { labels: [], data: [] },
        timeAnalysis: timeAnalysis || {
          labels: [],
          receivedData: [],
          processedData: [],
        },
        rejectionReasons: rejectionReasons || { labels: [], data: [] },
      };

      const success = await generateDepartmentReport(
        department,
        stats || {},
        chartRefs,
        [startDate, endDate],
        reportData
      );

      if (success) {
        alert("تم إنشاء التقرير بنجاح وحفظه على جهازك");
      } else {
        alert("حدث خطأ أثناء إنشاء التقرير، يرجى المحاولة مرة أخرى");
      }
    } catch (error) {
      console.error("خطأ في إنشاء التقرير:", error);
      alert("حدث خطأ أثناء إنشاء التقرير، يرجى المحاولة مرة أخرى");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // عرض شاشة التحميل إذا كانت البيانات قيد التحميل
  const isPageLoading =
    isInitialLoading ||
    (loading &&
      (loading.department ||
        loading.stats ||
        loading.processingTime ||
        loading.requestsCount ||
        loading.timeAnalysis ||
        loading.statusPieChart));

  if (isPageLoading && !department) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>جاري تحميل بيانات الإدارة...</p>
      </div>
    );
  }

  if (!department && !isPageLoading) {
    return (
      <div className={styles.errorContainer}>
        <FaExclamationTriangle className={styles.errorIcon} />
        <h2>الإدارة غير موجودة</h2>
        <p>لم يتم العثور على بيانات لهذه الإدارة (ID: {id})</p>
        <button
          className={styles.backButton}
          onClick={() => navigate("/reports")}
        >
          العودة للصفحه الرئيسيه
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container} style={{ marginTop: "10px" }}>
      <div
        className={styles.pageHeader}
        style={{ borderColor: department?.color || colors.primary }}
      >
        <div>
          <h1 className={styles.pageTitle}>
            تقارير {department?.name || "الإدارة"}
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
              // تحديث البيانات مباشرة
              if (dispatch && id) {
                const [newStartDate, newEndDate] = update;
                const formatDate = (date) => {
                  if (!date) return null;
                  const d = new Date(date);
                  return `${d.getFullYear()}-${String(
                    d.getMonth() + 1
                  ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                };

                const params = {
                  id: id,
                  startDate: newStartDate ? formatDate(newStartDate) : null,
                  endDate: newEndDate ? formatDate(newEndDate) : null,
                };

                dispatch(fetchDepartmentStats(params));
                dispatch(fetchProcessingTimeStats(params));
                dispatch(fetchRequestsCountByType(params));
                dispatch(fetchRejectionReasons(params));
                dispatch(fetchTimeAnalysis(params));
                dispatch(
                  fetchStatusPieChart({
                    id: id,
                    startDate: params.startDate,
                    endDate: params.endDate,
                  })
                );
              }
            }}
            className={styles.datePicker}
            dateFormat="yyyy/MM/dd"
            placeholderText="اختر فترة زمنية"
          />
          <button
            className={styles.resetButton}
            onClick={handleResetDateRange}
            disabled={!startDate && !endDate} // تعطيل الزر فقط إذا لم يكن هناك تواريخ محددة
            title="إعادة تعيين الفترة الزمنية"
          >
            إعادة تعيين
          </button>
        </div>

        <div className={styles.actionsGroup}>
          <button
            className={styles.refreshButton}
            onClick={handleRefreshData}
            disabled={loading?.department || loading?.stats}
            title="تحديث البيانات"
          >
            <FaSync
              className={
                loading?.department || loading?.stats ? styles.spinning : ""
              }
            />
          </button>
          
          <button
            className={styles.generateReportButton}
            onClick={handleGenerateReport}
            disabled={
              !department ||
              isGeneratingReport ||
              loading?.department ||
              loading?.stats
            }
          >
            <FaFileExport className={styles.buttonIcon} /> إنشاء تقرير
          </button>
        </div>
      </div>

      {/* عرض أخطاء API إذا وجدت */}
      {errors && Object.values(errors).some((error) => error) && (
        <div className={styles.errorAlert}>
          <FaExclamationTriangle />
          <span>
            حدثت مشكلة أثناء تحميل بعض البيانات. يرجى التحقق من اتصالك بالإنترنت
            والمحاولة مرة أخرى.
          </span>
        </div>
      )}

      {/* إجمالي الطلبات */}
      <div className={styles.statsSection}>
        <div className={styles.statsCards}>
          <div className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ backgroundColor: colors.primary }}
            >
              <FaList />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {stats?.totalRequests || 0}
              </span>
              <span className={styles.statLabel}>إجمالي الطلبات</span>
            </div>
          </div>
        </div>
      </div>

      {/* الطلبات المنشأة من الإدارة */}
      <div className={styles.statsSection}>
        <h3 className={styles.sectionSubTitle}>
          <FaShare className={styles.sectionIcon} /> الطلبات المنشأة من الإدارة
        </h3>
        <div className={styles.statsCards}>
          <div className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ backgroundColor: colors.info }}
            >
              <FaShare />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {stats?.createdByDepartment?.total || 0}
              </span>
              <span className={styles.statLabel}>إجمالي الطلبات المنشأة</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ backgroundColor: colors.warning }}
            >
              <FaRegClock />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {stats?.createdByDepartment?.inProgress || 0}
              </span>
              <span className={styles.statLabel}>قيد التنفيذ</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ backgroundColor: colors.secondary }}
            >
              <FaExclamationTriangle />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {stats?.createdByDepartment?.delayed || 0}
              </span>
              <span className={styles.statLabel}>متأخرة</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ backgroundColor: colors.success }}
            >
              <FaCheckCircle />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {stats?.createdByDepartment?.acceptedByOthers || 0}
              </span>
              <span className={styles.statLabel}>مقبولة</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ backgroundColor: colors.danger }}
            >
              <FaTimesCircle />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {stats?.createdByDepartment?.rejectedByOthers || 0}
              </span>
              <span className={styles.statLabel}>مرفوضة</span>
            </div>
          </div>
        </div>
      </div>

      {/* الطلبات المستلمة من الإدارات الأخرى */}
      <div className={styles.statsSection}>
        <h3 className={styles.sectionSubTitle}>
          <FaInbox className={styles.sectionIcon} /> الطلبات المستلمة من
          الإدارات الأخرى
        </h3>
        <div className={styles.statsCards}>
          <div className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ backgroundColor: colors.warning }}
            >
              <FaRegClock />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {stats?.receivedFromOthers?.inProgress || 0}
              </span>
              <span className={styles.statLabel}>قيد التنفيذ</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ backgroundColor: colors.secondary }}
            >
              <FaExclamationTriangle />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {stats?.receivedFromOthers?.delayed || 0}
              </span>
              <span className={styles.statLabel}>متأخرة</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ backgroundColor: colors.success }}
            >
              <FaCheckCircle />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {stats?.receivedFromOthers?.acceptedByDepartment || 0}
              </span>
              <span className={styles.statLabel}>مقبولة</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ backgroundColor: colors.danger }}
            >
              <FaTimesCircle />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {stats?.receivedFromOthers?.rejectedByDepartment || 0}
              </span>
              <span className={styles.statLabel}>مرفوضة</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.chartsContainer}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>
            <FaChartPie className={styles.chartIcon} /> حالات الطلبات
          </h3>
          <div
            className={styles.chartWrapper}
            style={{ height: "400px" }}
            ref={pieChartRef}
          >
            {loading?.statusPieChart ? (
              <div className={styles.chartLoading}>
                <div className={styles.loader}></div>
                <p>جاري تحميل البيانات...</p>
              </div>
            ) : (
              <Pie
                data={statusData}
                options={pieChartOptions}
                key={`pie-${startDate}-${endDate}`}
              />
            )}
          </div>
        </div>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>
            <FaChartBar className={styles.chartIcon} /> متوسط وقت المعالجة
          </h3>
          <div
            className={styles.chartWrapper}
            style={{ height: "400px" }}
            ref={processingTimeChartRef}
          >
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
            <FaChartBar className={styles.chartIcon} /> عدد الطلبات التي وصلت
            للإدارة
          </h3>
          <div
            className={styles.chartWrapper}
            style={{ height: "400px" }}
            ref={requestsCountChartRef}
          >
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
          <div
            className={styles.chartWrapper}
            style={{ height: "400px" }}
            ref={rejectionChartRef}
          >
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
      <div className={styles.chartCard} style={{ marginBottom: "30px" }}>
        <h3 className={styles.chartTitle}>
          <FaChartLine className={styles.chartIcon} /> تطور أعداد الطلبات
        </h3>
        <div
          className={styles.chartWrapper}
          style={{ height: "400px" }}
          ref={timeAnalysisChartRef}
        >
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
