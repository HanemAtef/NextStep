import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchApplicationTypes,
    fetchConditions,
    submitApplication,
    updateField,
    resetForm,
} from "../../../Redux/slices/createReqSlice";
import { FaPlus, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";
import styles from "./CreateReq.module.css";
import { useNavigate } from "react-router-dom";

const CreateReq = () => {
    const dispatch = useDispatch();
    const {
        formData,
        applicationTypes,
        conditions,
        loading,
        error,
    } = useSelector((state) => state.createReq);
    const [fileName, setFileName] = useState("");
    const [currentFile, setCurrentFile] = useState(null);
    const [studentIdError, setStudentIdError] = useState("");
    const [formErrors, setFormErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(fetchApplicationTypes());
    }, [dispatch]);

    useEffect(() => {
        // console.log("Current conditions:", conditions);
    }, [conditions]);

    const validateForm = () => {
        const errors = {};
        if (!formData.applicationType) {
            errors.applicationType = "نوع الطلب مطلوب";
        }
        if (!formData.studentId) {
            errors.studentId = "الرقم الجامعي مطلوب";
        }
        if (!formData.studentName) {
            errors.studentName = "اسم الطالب مطلوب";
        }
        if (!formData.studentPhone) {
            errors.studentPhone = "رقم الهاتف مطلوب";
        }
        if (conditions.length > 0 && !conditions.some(condition => condition.checked)) {
            errors.conditions = "يجب اختيار شرط واحد على الأقل";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleTypeChange = (e) => {
        const selectedType = e.target.value;
        dispatch(updateField({ field: "applicationType", value: selectedType }));
        if (selectedType) {
            dispatch(fetchConditions(selectedType));
        }
    };

    const handleConditionChange = (conditionId) => {
        const updatedConditions = conditions.map(condition =>
            condition.id === conditionId
                ? { ...condition, checked: !condition.checked }
                : condition
        );
        dispatch(updateField({ field: "conditions", value: updatedConditions }));
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "studentId") {
            if (/^\d*$/.test(value)) {
                dispatch(updateField({ field: name, value }));
                setStudentIdError("");
            } else {
                setStudentIdError("الرجاء إدخال أرقام فقط");
            }
        } else if (name === "attachment") {
            const file = files[0];
            if (file) {
                setFileName(file.name);
                setCurrentFile(file);
                dispatch(updateField({
                    field: name,
                    value: {
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        lastModified: file.lastModified
                    }
                }));
            }
        } else {
            dispatch(updateField({ field: name, value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!validateForm()) {
            return;
        }

        const hasSelectedCondition = conditions.some(condition => condition.checked);
        if (!hasSelectedCondition) {
            setError("يجب اختيار شرط واحد على الأقل");
            return;
        }

        if (!currentFile) {
            setError("يجب رفع الملف المطلوب");
            return;
        }

        try {
            const formDataToSubmit = new FormData();

            // تحويل نوع الطلب إلى رقم
            const applicationTypeId = parseInt(formData.applicationType);
            if (!applicationTypeId) {
                setError("نوع الطلب غير صالح");
                return;
            }

            // إضافة البيانات بالضبط كما في Swagger
            formDataToSubmit.append("ApplicationTypeID", applicationTypeId);
            formDataToSubmit.append("StudentNaid", formData.studentId.trim());
            formDataToSubmit.append("StudentName", formData.studentName.trim());
            formDataToSubmit.append("StudentPhone", formData.studentPhone.trim());
            formDataToSubmit.append("Attachment", currentFile);
            if (formData.notes) {
                formDataToSubmit.append("Notes", formData.notes.trim());
            }

            // طباعة البيانات للتحقق
            console.log("Form Data being sent:", {
                ApplicationTypeID: applicationTypeId,
                StudentNaid: formData.studentId.trim(),
                StudentName: formData.studentName.trim(),
                StudentPhone: formData.studentPhone.trim(),
                Notes: formData.notes ? formData.notes.trim() : "",
                Attachment: currentFile.name
            });

            const result = await dispatch(submitApplication(formDataToSubmit)).unwrap();
            console.log("Response:", result);

            setSuccessMessage("تم إرسال الطلب بنجاح");
            dispatch(resetForm());
            setFileName("");
            setCurrentFile(null);
            setStudentIdError("");
            setFormErrors({});
            e.target.reset();
            setTimeout(() => {
                navigate("/outbox");
            }, 2000);
        } catch (error) {
            console.error("حدث خطأ أثناء إرسال الطلب", error);
            if (error.response?.data) {
                setError(error.response.data);
            } else {
                setError("حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى");
            }
        }
    };

    const handleCancel = () => {
        dispatch(resetForm());
        setFileName("");
        setCurrentFile(null);
        setStudentIdError("");
        setFormErrors({});
    };

    return (
        <div className={styles.createPageWrapper}>
            <div className={styles.mainContent}>
                <h4 className={styles.title}>
                    <FaPlus className={styles.iconn} /> طلب إنشاء
                </h4>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="applicationType" className={styles.formLabel}>نوع الطلب *</label>
                            <select
                                id="applicationType"
                                name="applicationType"
                                className={`${styles.formSelect} ${formErrors.applicationType ? styles.error : ''}`}
                                value={formData.applicationType || ""}
                                onChange={handleTypeChange}
                                disabled={loading}
                            >
                                <option value="">اختر نوع الطلب</option>
                                {applicationTypes && applicationTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                            {formErrors.applicationType && (
                                <div className={styles.errorText}>{formErrors.applicationType}</div>
                            )}
                        </div>
                    </div>
                    {conditions.length > 0 && (
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>الشروط *</label>
                                <div className={styles.conditionsList}>
                                    {conditions.map((condition) => (
                                        <div key={condition.id} className={styles.conditionItem}>
                                            <input
                                                type="checkbox"
                                                id={`condition-${condition.id}`}
                                                checked={condition.checked || false}
                                                onChange={() => handleConditionChange(condition.id)}
                                                disabled={loading}
                                            />
                                            <label htmlFor={`condition-${condition.id}`}>
                                                {condition.text}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                {formErrors.conditions && (
                                    <div className={styles.errorText}>{formErrors.conditions}</div>
                                )}
                            </div>
                        </div>
                    )}
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="studentId" className={styles.formLabel}>الرقم الجامعي *</label>
                            <input
                                type="text"
                                id="studentId"
                                name="studentId"
                                className={`${styles.formControl} ${formErrors.studentId ? styles.error : ''}`}
                                value={formData.studentId || ""}
                                maxLength={14}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            {studentIdError && <div className={styles.errorText}>{studentIdError}</div>}
                            {formErrors.studentId && <div className={styles.errorText}>{formErrors.studentId}</div>}
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="studentName" className={styles.formLabel}>اسم الطالب *</label>
                            <input
                                type="text"
                                id="studentName"
                                name="studentName"
                                className={`${styles.formControl} ${formErrors.studentName ? styles.error : ''}`}
                                value={formData.studentName || ""}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            {formErrors.studentName && <div className={styles.errorText}>{formErrors.studentName}</div>}
                        </div>
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="studentPhone" className={styles.formLabel}>رقم الهاتف *</label>
                            <input
                                type="text"
                                id="studentPhone"
                                name="studentPhone"
                                className={`${styles.formControl} ${formErrors.studentPhone ? styles.error : ''}`}
                                value={formData.studentPhone || ""}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            {formErrors.studentPhone && <div className={styles.errorText}>{formErrors.studentPhone}</div>}
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="attachment" className={styles.formLabel}>إرفاق ملف</label>
                            <input
                                type="file"
                                id="attachment"
                                name="attachment"
                                className={styles.formFileInput}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            {fileName && <div className={styles.successText}>تم اختيار الملف: {fileName}</div>}
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="notes" className={styles.formLabel}>ملاحظات</label>
                        <textarea
                            id="notes"
                            name="notes"
                            className={styles.formTextarea}
                            rows={2}
                            value={formData.notes || ""}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>
                    {errorMessage && (
                        <div className={styles.errorMessage}>
                            <FaExclamationTriangle />
                            {errorMessage}
                        </div>
                    )}
                    {successMessage && (
                        <div className={styles.successMessage}>
                            <FaCheckCircle />
                            {successMessage}
                        </div>
                    )}
                    <div className={styles.buttonGroup}>
                        <button
                            type="button"
                            className={styles.btnCancel}
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            className={styles.btnCreate}
                            disabled={loading}
                        >
                            {loading ? "جاري الإرسال..." : "إرسال"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateReq;