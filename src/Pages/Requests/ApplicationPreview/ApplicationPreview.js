import React, { useState, useEffect } from 'react';
import Details from "../../../Component/Details/Details";
import History from "../../../Component/History/History";
import { useDispatch, useSelector } from 'react-redux';
import { approveApplication, rejectApplication } from '../../../Redux/slices/previewSlice';
import styles from './ApplicationPreview.module.css';

const ApplicationPreview = ({ request, onBack }) => {
  const dispatch = useDispatch();
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [formError, setFormError] = useState("");

  const { successMessage, error } = useSelector(state => state.preview);

  useEffect(() => {
    if (request) {
      console.log("Request data received:", request);
    }
  }, [request]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const validateForm = () => {
    if (!request?.id) {
      setFormError("رقم الطلب غير متوفر");
      return false;
    }
    if (!notes) {
      setFormError("يرجى إضافة ملاحظات");
      return false;
    }
    if (!file) {
      setFormError("يرجى إرفاق ملف");
      return false;
    }
    setFormError("");
    return true;
  };

  const handleApprove = () => {
    if (!validateForm()) return;

    setIsActionInProgress(true);

    const formData = new FormData();
    formData.append("applicationId", request.id);
    formData.append("file", file);
    formData.append("notes", notes);

    dispatch(approveApplication(formData));
  };

  const handleReject = () => {
    if (!validateForm()) return;

    setIsActionInProgress(true);

    const formData = new FormData();
    formData.append("applicationId", request.id);
    formData.append("file", file);
    formData.append("notes", notes);

    dispatch(rejectApplication(formData));
  };

  useEffect(() => {
    if (successMessage) {
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
      }, 2000);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
      }, 2000);
    }
  }, [error]);

  if (!request) {
    return (
      <div className={styles.loadingContainer}>
        <p>جاري تحميل بيانات الطلب...</p>
      </div>
    );
  }

  return (
    <div className={styles.applicationPreview}>
      <div className={styles.header}>
        <i className={styles.iconReview}>📝</i>
        <h2 className={styles.header}>مراجعة الطلب رقم {request.id}</h2>
      </div>

      <Details id={request.id} />
      <div className={styles.line}></div>
      <History request={request} />
      <div className={styles.line}></div>

      <div className={styles.actions}>
        <div className={styles.upload}>
          <label htmlFor="file-upload">
            <span className={styles.upIcon}>📤</span>ارفاق ملف
          </label>
          <input type="file" id="file-upload" onChange={handleFileChange} />
        </div>
        <div className={styles.notes}>
          <label htmlFor="notes">
            <span className={styles.upIcon}> 💬</span> ملاحظات
          </label>
          <input
            type="text"
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="أضف ملاحظاتك هنا"
          />
        </div>
        <div className={styles.buttons}>
          <button
            onClick={handleApprove}
            className={styles.approve}
            disabled={isActionInProgress}
          >
            الموافقة على الطلب
          </button>
          <button
            onClick={handleReject}
            className={styles.reject}
            disabled={isActionInProgress}
          >
            رفض الطلب
          </button>
        </div>
      </div>
      <button className={styles.backButton} onClick={onBack}>🔙 العودة إلى الطلبات</button>

      {showMessage && (
        <div className={styles.messagePopup}>
          {successMessage ? successMessage : error}
        </div>
      )}

      {formError && <div className={styles.errorMessage}>{formError}</div>}
    </div>
  );
};

export default ApplicationPreview;