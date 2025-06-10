import React, { useState, useEffect } from 'react';
import Details from "../../../Component/Details/Details";
import History from "../../../Component/History/History";
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { approveApplication, rejectApplication } from '../../../Redux/slices/previewSlice';
import { getInboxRequestDetails } from '../../../Redux/slices/inboxSlice';
import styles from './ApplicationPreview.module.css';

const ApplicationPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [request, setRequest] = useState(null);
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  const { error } = useSelector(state => state.preview);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setLoading(true);
        setDataLoaded(false);
        const result = await dispatch(getInboxRequestDetails(id));

        if (result.payload) {
          setRequest(result.payload);
          setDataLoaded(true);
        } else {
          throw new Error('فشل في جلب بيانات الطلب');
        }
      } catch (error) {
        console.error('Error fetching request:', error);
        setFormError('فشل في جلب بيانات الطلب');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRequest();
    }
  }, [dispatch, id]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileType = selectedFile.type;
      if (!fileType.includes('pdf') && !fileType.includes('image')) {
        setFormError("يرجى اختيار ملف PDF أو صورة فقط");
        e.target.value = null; // Clear the file input
        setFile(null);
      } else {
        setFile(selectedFile);
        setFormError("");
      }
    }
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
    formData.append("ApplicationID", request.id);
    formData.append("Attachment", file);
    formData.append("Notes", notes);

    dispatch(approveApplication(formData))
      .then(() => {
        setShowMessage(true);
        setSuccessMessage("تمت الموافقة على الطلب بنجاح!");
        setTimeout(() => {
          navigate("/outbox");
        }, 1000);
      })
      .catch((error) => {
        setFormError(error.message || "حدث خطأ أثناء الموافقة على الطلب");
      })
      .finally(() => {
        setIsActionInProgress(false);
      });
  };

  const handleReject = () => {
    if (!validateForm()) return;

    setIsActionInProgress(true);

    const formData = new FormData();
    formData.append("ApplicationID", request.id);
    formData.append("Attachment", file);
    formData.append("Notes", notes);

    dispatch(rejectApplication(formData))
      .then(() => {
        setShowMessage(true);
        setSuccessMessage("تم رفض الطلب بنجاح!");
        setTimeout(() => {
          navigate("/outbox");
        }, 1000);
      })
      .catch((error) => {
        setFormError(error.message || "حدث خطأ أثناء رفض الطلب");
      })
      .finally(() => {
        setIsActionInProgress(false);
      });
  };

  useEffect(() => {
    if (successMessage) {
      setShowMessage(true);
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

  const handleBack = () => {
    navigate('/inbox');
  };

  const handleCloseMessage = () => {
    setShowMessage(false);
  };

  if (loading && !dataLoaded) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>جاري تحميل بيانات الطلب...</p>
      </div>
    );
  }

  if (!request && !loading) {
    return (
      <div className={styles.errorContainer}>
        <p>لم يتم العثور على بيانات الطلب</p>
        <button onClick={handleBack} className={styles.backButton}>
          العودة إلى قائمة الطلبات
        </button>
      </div>
    );
  }

  return (
    <div className={styles.applicationPreview}>
      <div className={styles.header}>
        <i className={styles.iconReview}>📝</i>
        <h2 className={styles.header}>مراجعة الطلب رقم {request.id}</h2>
      </div>

      <Details request={request} />
      <div className={styles.line}></div>
      <History request={request} />
      <div className={styles.line}></div>

      <div className={styles.actions}>
        <div className={styles.upload}>
          <label htmlFor="file-upload">
            <span className={styles.upIcon}>📤</span>ارفاق ملف
          </label>
          <input
            type="file"
            id="file-upload"
            onChange={handleFileChange}
            accept=".pdf,image/*"
          />
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
      {/* <button className={styles.backButton} onClick={handleBack}>🔙 العودة إلى الطلبات</button> */}

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