import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiInbox, FiFilter, FiSearch } from "react-icons/fi";
import { FaExternalLinkAlt, FaRegCalendarAlt } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import ApplicationHistory from "../ApplicationHistory/ApplicationHistory";
import ApplicationPreview from "../ApplicationPreview/ApplicationPreview";
import styles from "./Inbox.module.css";
import CustomSelect from '../../../Component/CustomSelect/CustomSelect';

import {
  fetchInboxRequests,
  setPage,
  setCurrentInboxRequest,
  selectInboxRequests,
  selectInboxLoading,
  selectInboxError,
  selectInboxStats,
  selectInboxPage,
  selectInboxPageSize,
  selectInboxTotalCount
} from "../../../Redux/slices/inboxSlice";

const APPLICATION_TYPES = [
  { id: 2, name: "طلب الالتحاق الخاص بقسم نظم المعلومات" },
  { id: 3, name: "طلب الالتحاق الخاص بقسم حسابات علميه" },
  { id: 4, name: "طلب الالتحاق الخاص بقسم ذكاء اصطناعي" },
  { id: 5, name: "طلب مد الخاص بقسم علوم حاسب" },
  { id: 6, name: "طلب مد الخاص بقسم نظم المعلومات" },
  { id: 8, name: "طلب مد الخاص بقسم ذكاء اصطناعي" },
  { id: 9, name: "ايقاف قيد الخاص بقسم علوم حاسب" },
  { id: 10, name: "ايقاف قيد الخاص بقسم نظم المعلومات" },
  { id: 11, name: "ايقاف قيد الخاص بقسم حسابات علميه" },
  { id: 12, name: "ايقاف قيد الخاص بقسم ذكاء اصطناعي" },
  { id: 13, name: "الغاء تسجيل الخاص بقسم علوم حاسب" },
  { id: 14, name: "الغاء تسجيل الخاص بقسم نظم المعلومات" },
  { id: 15, name: "الغاء تسجيل الخاص بقسم حسابات علميه" },
  { id: 16, name: "الغاء تسجيل الخاص بقسم ذكاء اصطناعي" },
  { id: 17, name: "سيمنار 1 تعيين لجنة الاشراف والخطه البحثيه الخاص بقسم علوم حاسب" },
  { id: 18, name: "سيمنار 1 تعيين لجنة الاشراف والخطه البحثيه الخاص بقسم نظم المعلومات" },
  { id: 19, name: "سيمنار 1 تعيين لجنة الاشراف والخطه البحثيه الخاص بقسم حسابات علميه" },
  { id: 20, name: "سيمنار 1 تعيين لجنة الاشراف والخطه البحثيه الخاص بقسم ذكاء اصطناعي" },
  { id: 21, name: "سيمنار 2 صلاحية الخاص بقسم علوم حاسب" },
  { id: 22, name: "سيمنار 2 صلاحية الخاص بقسم نظم المعلومات" },
  { id: 23, name: "سيمنار 2 صلاحية الخاص بقسم حسابات علميه" },
  { id: 24, name: "سيمنار 2 صلاحية الخاص بقسم ذكاء اصطناعي" },
  { id: 25, name: "تشكيل لجنة حكم الخاص بقسم علوم حاسب" },
  { id: 26, name: "تشكيل لجنة حكم الخاص بقسم نظم المعلومات" },
  { id: 27, name: "تشكيل لجنة حكم الخاص بقسم حسابات علميه" },
  { id: 28, name: "تشكيل لجنة حكم الخاص بقسم ذكاء اصطناعي" },
  { id: 29, name: "سيمنار مناقشة الخاص بقسم علوم حاسب" },
  { id: 30, name: "سيمنار مناقشة الخاص بقسم نظم المعلومات" },
  { id: 31, name: "سيمنار مناقشة الخاص بقسم حسابات علميه" },
  { id: 32, name: "سيمنار مناقشة الخاص بقسم ذكاء اصطناعي" },
  { id: 33, name: "منح الخاص بقسم علوم حاسب" },
  { id: 34, name: "منح الخاص بقسم نظم المعلومات" },
  { id: 35, name: "منح الخاص بقسم حسابات علميه" },
  { id: 36, name: "منح الخاص بقسم ذكاء اصطناعي" },
  { id: 39, name: "الغاء تسجيل الخاص بقسم علوم حاسب" },
  { id: 40, name: "الغاء تسجيل الخاص بقسم حسابات علميه" },
  { id: 41, name: "الغاء تسجيل الخاص بقسم نظم المعلومات" },
  { id: 42, name: "الغاء تسجيل الخاص بقسم ذكاء اصطناعي" },
  { id: 92, name: "طلب الالتحاق الخلص بقسم علوم الحاسب" }
];

export default function Inbox() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const requests = useSelector(selectInboxRequests);
  const isLoading = useSelector(selectInboxLoading);
  const error = useSelector(selectInboxError);
  const stats = useSelector(selectInboxStats);
  const currentPage = useSelector(selectInboxPage);
  const pageSize = useSelector(selectInboxPageSize);
  const totalCount = useSelector(selectInboxTotalCount);

  const role = sessionStorage.getItem("role") || "";
  const [userRole, setUserRole] = useState("");
  const [departmentName, setDepartmentName] = useState("");

  useEffect(() => {
    setUserRole(role);

    if (role && role.includes("موظف")) {
      const deptName = role.replace("موظف", "").trim();
      setDepartmentName(deptName);
    }
  }, []);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchID, setSearchID] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [filteredRequests, setFilteredRequests] = useState([]);

  const totalPages = Math.ceil(totalCount / pageSize);

  useEffect(() => {
    let filtered = [...requests];
    // console.log("Current requests:", requests);
    // console.log("Current filters:", { statusFilter, searchID, typeFilter });

    if (statusFilter) {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    if (searchID) {
      const searchTerm = searchID.toLowerCase();
      filtered = filtered.filter(req =>
        req.id.toString().includes(searchTerm) ||
        (req.type && req.type.toLowerCase().includes(searchTerm))
      );
    }

    if (typeFilter) {
      // console.log("Filtering by type:", typeFilter);
      filtered = filtered.filter(req => {
        // console.log("Request type:", req.type, "ApplicationTypeId:", req.applicationTypeId);
        return req.applicationTypeId === parseInt(typeFilter);
      });
    }

    // console.log("Filtered requests:", filtered);
    setFilteredRequests(filtered);
  }, [requests, searchID, statusFilter, typeFilter]);

  useEffect(() => {
    const loadData = async () => {
      try {
        await dispatch(fetchInboxRequests({
          page: currentPage,
          pageSize,
          searchID,
          status: statusFilter,
          type: typeFilter,
          department: departmentName
        }));
      } catch (error) {
        // console.error('Error loading inbox data:', error);
      }
    };
    loadData();
  }, [dispatch, currentPage, pageSize, searchID, statusFilter, typeFilter, departmentName]);

  const formatDate = (dateString) => {
    if (!dateString) return "غير معروف";
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleClearFilters = () => {
    setSearchID("");
    setStatusFilter("");
    setTypeFilter("");
  };

  const handleSelectRequest = (req) => {
    dispatch(setCurrentInboxRequest(req));

    if (req.status === "طلب_جديد") {
      navigate(`/inbox/new/${req.id}`, { replace: true });
    } else if (req.status === "مقبول" || req.status === "مرفوض") {
      navigate(`/inbox/response/${req.id}`, { replace: true });
    }
  };

  const handleBack = () => {
    setSelectedRequest(null);
  };

  const getStatusDisplay = (req) => {
    if (!req || !req.status) return "غير معروف";

    const status = req.status.trim();

    switch (status) {
      case "طلب_جديد":
        return "طلب جديد";
      case "قيد_التنفيذ":
        return "قيد التنفيذ";
      case "مقبول":
        return "مقبول";
      case "مرفوض":
        return "مرفوض";
      default:
        return status;
    }
  };

  const getStatusClass = (req) => {
    if (!req || !req.status) return "";

    const status = req.status.trim();

    switch (status) {
      case "طلب_جديد":
        return styles.newRequest;
      case "قيد_التنفيذ":
        return styles.inprogress;
      case "مقبول":
        return styles.accepted;
      case "مرفوض":
        return styles.rejected;
      default:
        return "";
    }
  };

  if (isLoading && !requests.length) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>جاري تحميل البيانات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>حدث خطأ أثناء تحميل البيانات: {error}</p>
        <button
          className={styles.retryButton}
          onClick={() => dispatch(fetchInboxRequests({
            page: currentPage,
            pageSize,
            searchID,
            status: statusFilter,
            requestType: typeFilter,
            department: departmentName
          }))}
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className={styles.inboxContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <FiInbox className={styles.titleIcon} /> الطلبات الواردة
        </h2>
        <div className={styles.statsSection}>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>إجمالي الطلبات</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{stats.new}</span>
            <span className={styles.statLabel}>طلبات جديدة</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{stats.inProgress}</span>
            <span className={styles.statLabel}>ردود</span>
          </div>
        </div>
      </div>

      <div className={styles.filtersSection}>
        <div className={styles.filterTitle}>
          <FiFilter className={styles.filterIcon} />
          <span>الفلاتر</span>
        </div>

        <div className={styles.filtersContainer}>
          <div className={styles.searchContainer}>
            <input
              id="filter"
              type="text"
              placeholder=" بحث..."
              className={styles.searchBox}
              value={searchID}
              onChange={(e) => setSearchID(e.target.value)}
            />
          </div>
          <div className={styles.filters}>
            <div className={styles.selectBox}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">كل الحالات</option>
                <option value="طلب_جديد">طلب جديد</option>
                <option value="قيد_التنفيذ">قيد التنفيذ</option>
                <option value="مقبول">مقبول</option>
                <option value="مرفوض">مرفوض</option>
              </select>
            </div>
            <div className={styles.selectBox}>
              <CustomSelect
                options={APPLICATION_TYPES.map(type => ({
                  value: type.id,
                  label: type.name
                }))}
                value={typeFilter}
                onChange={(value) => {
                  setTypeFilter(value);
                  dispatch(setPage(1));
                }}
                placeholder="اختر نوع الطلب"
                searchable={true}
              />
            </div>
          </div>
          {(searchID || statusFilter || typeFilter) && (
            <button className={styles.clearFiltersBtn} onClick={handleClearFilters}>
              مسح الفلاتر
            </button>
          )}
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className={styles.noResults}>
          <div className={styles.emptyInboxIcon}>
            <FiInbox size={48} />
          </div>
          <h3>لا توجد طلبات متاحة</h3>
          <p>لا توجد طلبات تطابق معايير البحث الحالية</p>
          {(searchID || statusFilter || typeFilter) && (
            <button className={styles.clearFiltersBtn} onClick={handleClearFilters}>
              مسح معايير التصفية
            </button>
          )}
        </div>
      ) : (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>رقم الطلب</th>
                  <th>نوع الطلب</th>
                  <th>الجهة المرسلة</th>
                  <th>تاريخ الاستلام</th>
                  <th>الحالة</th>
                  <th>التفاصيل</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req, index) => (
                  <tr key={req.id} className={styles.tableRow} style={{ animationDelay: `${index * 0.05}s` }}>
                    <td className={styles.idCell}>{req.id}</td>
                    <td className={styles.typeCell}>{req.type}</td>
                    <td>{req.from}</td>
                    <td className={styles.dateCell}>
                      <FaRegCalendarAlt className={styles.dateIcon} />
                      {formatDate(req.receivedDate)}
                    </td>
                    <td className={styles.actionType}>
                      <span className={getStatusClass(req)}>
                        {getStatusDisplay(req)}
                      </span>
                    </td>
                    <td>
                      <button
                        className={styles.detailsButton}
                        onClick={() => handleSelectRequest(req)}
                        aria-label="عرض التفاصيل"
                      >
                        <FaExternalLinkAlt className={styles.detailsIcon} />
                        التفاصيل
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalCount > pageSize && (
            <div className={styles.pagination}>
              <button
                className={`${styles.paginationButton} ${currentPage === 1 ? styles.disabled : ""}`}
                disabled={currentPage === 1}
                onClick={() => dispatch(setPage(currentPage - 1))}
              >
                <IoIosArrowForward className={styles.paginationIcon} />
                السابق
              </button>

              <div className={styles.pageInfo}>
                الصفحة <span className={styles.pageNumber}>{currentPage}</span> من {totalPages}
              </div>

              <button
                className={`${styles.paginationButton} ${currentPage === totalPages ? styles.disabled : ""}`}
                disabled={currentPage === totalPages}
                onClick={() => dispatch(setPage(currentPage + 1))}
              >
                التالي
                <IoIosArrowBack className={styles.paginationIcon} />
              </button>
            </div>
          )}

          <div className={styles.resultsInfo}>
            عرض {filteredRequests.length} من {totalCount} طلب
          </div>
        </>
      )}
    </div>
  );
}