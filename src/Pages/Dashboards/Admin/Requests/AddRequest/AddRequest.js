import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AddRequest.module.css';
import { FaArrowRight, FaSave, FaTimes } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { addrequest, setError, clearError } from '../../../../../Redux/slices/requestSlice';

const AddRequest = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { error } = useSelector(state => state.requestAdmin);

  const departments = [
    { id: 1, name: "مجلس الكليه" },
    { id: 2, name: "لجنه الدرسات العليا" },
    { id: 3, name: "حسابات علميه" },
    { id: 4, name: "ذكاء اصطناعي" },
    { id: 5, name: "علوم حاسب" },
    { id: 6, name: "نظم المعلومات" },
    { id: 7, name: "إدارة الدرسات العليا" }
  ];

  const [request, setRequest] = useState({
    name: '',
    description: '',
    requierments: [''],
    steps: [{ departmentId: '', stepOrder: 1 }],
  });

  useEffect(() => {
    if (error) {
      alert(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRequest(prevRequest => ({
      ...prevRequest,
      [name]: value
    }));
  };

  const handleRequirementsChange = (e, index) => {
    const newRequirements = [...request.requierments];
    newRequirements[index] = e.target.value;
    setRequest(prevRequest => ({
      ...prevRequest,
      requierments: newRequirements
    }));
  };

  const addRequirement = () => {
    setRequest(prevRequest => ({
      ...prevRequest,
      requierments: [...prevRequest.requierments, '']
    }));
  };

  const removeRequirement = (index) => {
    if (request.requierments.length <= 1) {
      return;
    }
    const newRequirements = [...request.requierments];
    newRequirements.splice(index, 1);
    setRequest(prevRequest => ({
      ...prevRequest,
      requierments: newRequirements
    }));
  };

  const handleStepChange = (e, index, field) => {
    const newSteps = [...request.steps];
    newSteps[index] = {
      ...newSteps[index],
      [field]: e.target.value
    };
    setRequest(prevRequest => ({
      ...prevRequest,
      steps: newSteps
    }));
  };

  const addStep = () => {
    setRequest(prevRequest => ({
      ...prevRequest,
      steps: [...prevRequest.steps, { departmentId: '', stepOrder: prevRequest.steps.length + 1 }]
    }));
  };

  const removeStep = (index) => {
    if (request.steps.length <= 1) {
      return;
    }
    const newSteps = [...request.steps];
    newSteps.splice(index, 1);

    for (let i = index; i < newSteps.length; i++) {
      newSteps[i].stepOrder = i + 1;
    }
    setRequest(prevRequest => ({
      ...prevRequest,
      steps: newSteps
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!request.name.trim()) {
      dispatch(setError('يجب إدخال عنوان الطلب'));
      return;
    }

    if (!request.description.trim()) {
      dispatch(setError('يجب إدخال وصف للطلب'));
      return;
    }

    const cleanedRequirements = request.requierments
      .map(req => req.trim())
      .filter(req => req !== '');

    if (cleanedRequirements.length === 0) {
      dispatch(setError('يجب إدخال شرط واحد على الأقل'));
      return;
    }

    const cleanedSteps = request.steps
      .map(step => ({
        departmentId: parseInt(step.departmentId),
        stepOrder: parseInt(step.stepOrder)
      }))
      .filter(step => !isNaN(step.departmentId) && step.departmentId > 0);

    if (cleanedSteps.length === 0) {
      dispatch(setError('يجب إدخال خطوة واحدة على الأقل تحتوي على قسم صحيح'));
      return;
    }

    const requestBody = {
      applicationTypeName: request.name.trim(),
      description: request.description.trim(),
      createStepsDTOs: cleanedSteps,
      createRequiermentDTOs: cleanedRequirements.map(req => ({
        requiermentName: req
      }))
    };

    console.log(requestBody); 

    dispatch(addrequest(requestBody))
      .unwrap()
      .then((res) => {
        console.log("Response after adding:", res);
        alert(`تم إنشاء نوع الطلب "${request.name}" بنجاح`);
        navigate('/admin/requests');
      })
      .catch((error) => {
        console.error('Error adding request:', error);
        dispatch(setError(error.message || 'حدث خطأ أثناء إضافة الطلب'));
      });
  };

  const goBack = () => {
    navigate('/admin/requests');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>إنشاء نوع طلب جديد</h2>
        <button onClick={goBack} className={styles.backButton}>
          <FaArrowRight /> العودة للقائمة
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="title">عنوان الطلب</label>
          <input
            type="text"
            id="title"
            name="name"
            value={request.name}
            onChange={handleChange}
            required
            className={styles.formControl}
            placeholder="أدخل عنوان الطلب"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="title">وصف الطلب</label>
          <input
            type="text"
            id="description"
            name="description"
            value={request.description}
            onChange={handleChange}
            required
            className={styles.formControl}
            placeholder="أدخل وصف الطلب"
          />
        </div>

        <div className={styles.formGroup}>
          <label>شروط الطلب</label>
          <div className={styles.pathContainer}>
            {request.requierments.map((requirement, index) => (
              <div key={index} className={styles.pathStep}>
                <textarea
                  value={requirement}
                  onChange={(e) => handleRequirementsChange(e, index)}
                  className={styles.formControl}
                  required
                  placeholder="أدخل شرط الطلب"
                  rows="2"
                ></textarea>
                <button
                  type="button"
                  className={styles.removeStepButton}
                  onClick={() => removeRequirement(index)}
                  disabled={request.requierments.length <= 1}
                >
                  <FaTimes />
                </button>
              </div>
            ))}
            <button
              type="button"
              className={styles.addStepButton}
              onClick={addRequirement}
            >
              + إضافة شرط جديد
            </button>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>مسار سير الطلب</label>
          <div className={styles.tableContainer}>
            <table className={styles.stepsTable}>
              <thead>
                <tr>
                  <th>القسم</th>
                  <th>ترتيب الخطوة</th>
                  <th className={styles.actionColumn}></th>
                </tr>
              </thead>
              <tbody>
                {request.steps.map((step, index) => (
                  <tr key={index}>
                    <td>
                      <select
                        value={step.departmentId}
                        onChange={(e) => handleStepChange(e, index, 'departmentId')}
                        className={styles.tableInput}
                        required
                      >
                        <option value="">اختر القسم</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        value={step.stepOrder}
                        onChange={(e) => handleStepChange(e, index, 'stepOrder')}
                        className={styles.tableInput}
                        required
                        placeholder="الترتيب"
                      />
                    </td>
                    <td className={styles.actionColumn}>
                      <button
                        type="button"
                        className={styles.removeStepButton}
                        onClick={() => removeStep(index)}
                        disabled={request.steps.length <= 1}
                      >
                        <FaTimes />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              className={styles.addStepButton}
              onClick={addStep}
            >
              + إضافة خطوة جديدة
            </button>
          </div>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.saveButton}>
            <FaSave /> إنشاء نوع الطلب
          </button>
          <button type="button" className={styles.cancelButton} onClick={goBack}>
            <FaTimes /> إلغاء
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRequest;
