import React, { useEffect, useState } from 'react';
import styles from './ApplicationHistory.module.css';
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import {
  selectInboxRequests,
  selectCurrentInboxRequest,
  getInboxRequestDetails,
  fetchInboxRequests
} from '../../../Redux/slices/inboxSlice';
import {
  selectOutboxRequests,
  selectCurrentOutboxRequest,
  getOutboxRequestDetails,
  fetchOutboxRequests
} from '../../../Redux/slices/outboxSlice';
import Details from "../../../Component/Details/Details";
import History from "../../../Component/History/History";
import TimeLine from '../../../Component/TimeLine/TimeLine';

const ApplicationHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [requestData, setRequestData] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);

  const isInbox = location.pathname.includes('/inbox');

  const inboxCurrentRequest = useSelector(selectCurrentInboxRequest);
  const outboxCurrentRequest = useSelector(selectCurrentOutboxRequest);
  const inboxRequests = useSelector(selectInboxRequests);
  const outboxRequests = useSelector(selectOutboxRequests);

  const requestId = String(id);

  const fetchRequestsList = async () => {
    try {
      await dispatch(isInbox ? fetchInboxRequests({}) : fetchOutboxRequests({}));
      const state = await dispatch((_, getState) => getState());
      const updatedRequests = isInbox ?
        selectInboxRequests(state) :
        selectOutboxRequests(state);

      const foundRequest = updatedRequests.find(req => String(req.id) === requestId);
      if (foundRequest) {
        setRequestData(foundRequest);
        setError(null);
        setDataLoaded(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error fetching requests list:", error);
      return false;
    }
  };

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    setDataLoaded(false);

    const fetchRequest = async () => {
      try {
        let existingRequest;
        if (isInbox) {
          existingRequest = inboxCurrentRequest?.id && String(inboxCurrentRequest.id) === requestId
            ? inboxCurrentRequest
            : inboxRequests.find(req => String(req.id) === requestId);
        } else {
          existingRequest = outboxCurrentRequest?.id && String(outboxCurrentRequest.id) === requestId
            ? outboxCurrentRequest
            : outboxRequests.find(req => String(req.id) === requestId);
        }

        if (existingRequest) {
          if (isMounted) {
            setRequestData(existingRequest);
            setDataLoaded(true);
            setIsLoading(false);
          }
          return;
        }

        const resultAction = await dispatch(
          isInbox ? getInboxRequestDetails(requestId) : getOutboxRequestDetails(requestId)
        );

        if (resultAction.payload && isMounted) {
          setRequestData(resultAction.payload);
          setDataLoaded(true);
          setIsLoading(false);
        } else {
          const foundInList = await fetchRequestsList();
          if (!foundInList && isMounted) {
            setError("لم يتم العثور على الطلب");
          }
        }
      } catch (error) {
        if (isMounted) {
          setError(error.message || "حدث خطأ أثناء جلب تفاصيل الطلب");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (id) {
      fetchRequest();
    }

    return () => {
      isMounted = false;
    };
  }, [dispatch, requestId, isInbox, inboxCurrentRequest, outboxCurrentRequest, inboxRequests, outboxRequests, retryCount]);

  const handleBack = () => {
    if (isInbox) {
      navigate('/inbox');
    } else {
      navigate('/outbox');
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (isLoading && !dataLoaded) {
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
        <p>{error}</p>
        <button className={styles.backButton} onClick={handleBack}>
          العودة إلى قائمة الطلبات
        </button>
      </div>
    );
  }

  if (!requestData && !isLoading) {
    return (
      <div className={styles.errorContainer}>
        <p>لم يتم العثور على الطلب</p>
        <button className={styles.backButton} onClick={handleBack}>
          العودة إلى قائمة الطلبات
        </button>
      </div>
    );
  }

  return (
    <div className={styles.applicationHistory}>
      <div className={styles.header}>
        <h2><i className={styles.iconReview}>📝</i> تاريخ الطلب</h2>
      </div>
      <Details request={requestData} />
      <div className={styles.line}></div>
      <History request={requestData} />
      <div className={styles.line}></div>
      <TimeLine id={requestData.id} />
      <button className={styles.backButton} onClick={handleBack}>
        🔙 العودة إلى الطلبات
      </button>
    </div>
  );
}

export default ApplicationHistory;