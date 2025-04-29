import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTimeline } from "../../Redux/slices/timelineSlice";
import styles from "./TimeLine.module.css";

const TimeLine = ({ id }) => {
  const dispatch = useDispatch();
  const {
    data: timeline = [],
    loading = false,
    error = null,
  } = useSelector((state) => state.timeline || {});

  useEffect(() => {
    if (id) {
      dispatch(fetchTimeline(id));
    }
  }, [dispatch, id]);

  if (loading) return <p>جاري تحميل البيانات...</p>;
  if (error) return <p>حدث خطأ: {error}</p>;
  if (!timeline || !Array.isArray(timeline) || timeline.length === 0) {
    return <p>لا توجد مراحل متاحة لهذا الطلب</p>;
  }

  return (
    <div className={styles.timeContainer}>
      <h3>
        <i className={styles.timeIcon}> 📈 </i>
        مراحل سير الطلب
      </h3>
      <div className={styles.timeline}>
        {timeline.map((step, index) => (
          <React.Fragment key={index}>
            <div className={styles.step}>
              <div
                className={`${styles.circle} ${
                  step.isCompleted ? styles.active : ""
                }`}
              ></div>
              <div className={styles.stepLabel}>
                {step.departmentName || "قسم غير محدد"}
              </div>
            </div>
            {index < timeline.length - 1 && (
              <div
                className={`${styles.line} ${
                  step.isCompleted ? styles.active : ""
                }`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default TimeLine;
