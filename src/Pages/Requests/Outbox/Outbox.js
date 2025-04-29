import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiSend, FiFilter, FiSearch } from "react-icons/fi";
import { FaExternalLinkAlt, FaRegCalendarAlt } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import ApplicationHistory from "../ApplicationHistory/ApplicationHistory";
import styles from "./Outbox.module.css";

import {
  fetchOutboxRequests,
  setPage,
  setCurrentOutboxRequest,
  selectOutboxRequests,
  selectOutboxLoading,
  selectOutboxError,
  selectOutboxStats,
  selectOutboxPage,
  selectOutboxPageSize,
  selectOutboxTotalCount
} from "../../../Redux/slices/outboxSlice";

export default function Outbox() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const requests = useSelector(selectOutboxRequests);
  const isLoading = useSelector(selectOutboxLoading);
  const error = useSelector(selectOutboxError);
  const stats = useSelector(selectOutboxStats);
  const currentPage = useSelector(selectOutboxPage);
  const pageSize = useSelector(selectOutboxPageSize);
  const totalCount = useSelector(selectOutboxTotalCount);

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

  const [searchID, setSearchID] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const requestTypes = [...new Set(requests.map(req => req.type))];

  const totalPages = Math.ceil(totalCount / pageSize);

  useEffect(() => {
    dispatch(fetchOutboxRequests({
      page: currentPage,
      pageSize,
      searchID,
      status: statusFilter,
      type: typeFilter,
      department: departmentName
    }));
  }, [dispatch, currentPage, pageSize, searchID, statusFilter, typeFilter, departmentName]);

  useEffect(() => {
    if (currentPage !== 1) {
      dispatch(setPage(1));
    }
  }, [searchID, statusFilter, typeFilter, dispatch]);


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
    dispatch(setCurrentOutboxRequest(req));
    navigate(`/outbox/${req.id}`);
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
          onClick={() => dispatch(fetchOutboxRequests({ page: currentPage, pageSize, searchID, status: statusFilter, type: typeFilter, department: departmentName }))}
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className={styles.outboxContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <FiSend className={styles.titleIcon} /> الطلبات الصادرة
        </h2>
        <div className={styles.statsSection}>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>إجمالي الطلبات</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{stats.inProgress}</span>
            <span className={styles.statLabel}>قيد التنفيذ</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{stats.approved}</span>
            <span className={styles.statLabel}>مقبول</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{stats.rejected}</span>
            <span className={styles.statLabel}>مرفوض</span>
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
              placeholder="بحث... "
              className={styles.searchBox}
              value={searchID}
              onChange={(e) => setSearchID(e.target.value)}
            />
          </div>
          <div className={styles.filters}>
            <select
              className={styles.selectBox}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">كل الحالات</option>
              <option value="قيد_التنفيذ">قيد التنفيذ</option>
              <option value="مقبول">مقبول</option>
              <option value="مرفوض">مرفوض</option>
              <option value="طلب_جديد">طلب جديد</option>
            </select>

            <select
              className={styles.selectBox}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">كل أنواع الطلبات</option>
              {requestTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          {(searchID || statusFilter || typeFilter) && (
            <button className={styles.clearFiltersBtn} onClick={handleClearFilters}>
              مسح الفلاتر
            </button>
          )}
        </div>
      </div>

      {requests.length === 0 ? (
        <div className={styles.noResults}>
          <div className={styles.emptyOutboxIcon}>
            <FiSend size={48} />
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
                  {/* <th>الجهة المستقبلة</th> */}
                  <th>تاريخ الإرسال</th>
                  <th>الحالة</th>
                  <th>التفاصيل</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req, index) => (
                  <tr key={req.id} className={styles.tableRow} style={{ animationDelay: `${index * 0.05}s` }}>
                    <td className={styles.idCell}>{req.id}</td>
                    <td className={styles.typeCell}>{req.type}</td>
                    {/* <td>{req.to}</td> */}
                    <td className={styles.dateCell}>
                      <FaRegCalendarAlt className={styles.dateIcon} />
                      {formatDate(req.sentDate)}
                    </td>
                    <td>
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
                        <span>  التفاصيل</span>
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
                className={`${styles.paginationButton} ${currentPage === 1 ? styles.disabled : ''}`}
                disabled={currentPage === 1}
                onClick={() => dispatch(setPage(currentPage - 1))}
              >
                <IoIosArrowForward className={styles.paginationIcon} />
                السابق
              </button>

              <div className={styles.pageInfo}>
                <span>الصفحة</span>
                <div className={styles.pageNumber}>{currentPage}</div>
                <span>من {totalPages}</span>
              </div>

              <button
                className={`${styles.paginationButton} ${currentPage === totalPages ? styles.disabled : ''}`}
                disabled={currentPage === totalPages}
                onClick={() => dispatch(setPage(currentPage + 1))}
              >
                التالي
                <IoIosArrowBack className={styles.paginationIcon} />
              </button>
            </div>
          )}

          <div className={styles.resultsInfo}>
            عرض {requests.length} من {totalCount} طلب
          </div>
        </>
      )}
    </div>
  );
}

