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

  // Determine if we're in inbox or outbox based on the URL
  const isInbox = location.pathname.includes('/inbox');

  // Get the current request from the appropriate Redux store
  const inboxCurrentRequest = useSelector(selectCurrentInboxRequest);
  const outboxCurrentRequest = useSelector(selectCurrentOutboxRequest);
  const inboxRequests = useSelector(selectInboxRequests);
  const outboxRequests = useSelector(selectOutboxRequests);

  // Convert ID to string for reliable comparison
  const requestId = String(id);

  // Debug logs to help diagnose the issue
  console.log("ApplicationHistory - Request ID from URL:", requestId);
  console.log("ApplicationHistory - Current request:", isInbox ? inboxCurrentRequest : outboxCurrentRequest);
  console.log("ApplicationHistory - Requests list:", isInbox ? inboxRequests : outboxRequests);

  // Function to retry fetching the main requests list as a fallback
  const fetchRequestsList = async () => {
    console.log("Attempting to fetch from main requests list as fallback");
    try {
      // Dispatch action to fetch all requests first
      await dispatch(isInbox ? fetchInboxRequests({}) : fetchOutboxRequests({}));

      // After fetching, get the updated requests list
      const state = await dispatch((_, getState) => getState());
      const updatedRequests = isInbox ?
        selectInboxRequests(state) :
        selectOutboxRequests(state);

      // Try to find the request in the updated list
      const foundRequest = updatedRequests.find(req => String(req.id) === requestId);

      if (foundRequest) {
        console.log("Request found in the main list:", foundRequest);
        setRequestData(foundRequest);
        setError(null);
        return true;
      } else {
        console.log("Request not found in the main list either");
        return false;
      }
    } catch (error) {
      console.error("Error fetching requests list:", error);
      return false;
    }
  };

  // Fetch the specific request directly by ID
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const fetchRequest = async () => {
      try {
        // First check if we already have the request in the Redux store
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
          console.log("Found request in Redux store:", existingRequest);
          setRequestData(existingRequest);
          setIsLoading(false);
          return;
        }

        // If not found in Redux store, fetch it directly from the API
        console.log("Fetching request details from API...");
        const resultAction = await dispatch(
          isInbox ? getInboxRequestDetails(requestId) : getOutboxRequestDetails(requestId)
        );

        if (getInboxRequestDetails.fulfilled.match(resultAction) ||
          getOutboxRequestDetails.fulfilled.match(resultAction)) {
          console.log("Request details fetched successfully:", resultAction.payload);

          // Check if the result is an error object
          if (resultAction.payload && typeof resultAction.payload === 'object' && resultAction.payload.errors) {
            throw new Error(`خطأ من الخادم: ${JSON.stringify(resultAction.payload.title || resultAction.payload.errors)}`);
          } else {
            // Process and format the data if needed
            // Ensure it has the expected structure for the Details and History components
            const processedData = resultAction.payload;

            // Add default values for required fields if they don't exist
            const safeData = {
              id: processedData.id || processedData.applicationId || requestId,
              type: processedData.type || processedData.applicationType || 'نوع الطلب غير معروف',
              status: processedData.status || 'الحالة غير معروفة',
              // Add other fields that Details and History components expect
              from: processedData.from || processedData.sendingDepartment || 'غير معروف',
              receivedDate: processedData.receivedDate || processedData.sentDate || 'غير معروف',
              ...processedData // Spread the rest of the properties
            };

            setRequestData(safeData);
          }
        } else {
          console.error("Failed to fetch request details:", resultAction.error);
          throw new Error(resultAction.error?.message || 'فشل في جلب تفاصيل الطلب');
        }
      } catch (error) {
        console.error("Error fetching request details:", error);

        // If this is our first attempt and we got a 404 error, try fetching the list instead
        if (retryCount === 0) {
          setRetryCount(1);
          console.log("First fetch attempt failed, trying to fetch from the main list...");
          const fallbackSuccess = await fetchRequestsList();

          if (fallbackSuccess) {
            console.log("Fallback fetch successful");
            setIsLoading(false);
            return;
          }
        }

        // Both direct fetch and fallback failed
        const errorMessage = error.message || 'حدث خطأ أثناء جلب البيانات';
        setError(
          isInbox
            ? `فشل في جلب تفاصيل طلب وارد (${requestId}): ${errorMessage}`
            : `فشل في جلب تفاصيل طلب صادر (${requestId}): ${errorMessage}`
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequest();
  }, [dispatch, requestId, isInbox, inboxCurrentRequest, outboxCurrentRequest, inboxRequests, outboxRequests, retryCount]);

  // Handle back button
  const handleBack = () => {
    if (isInbox) {
      navigate('/inbox');
    } else {
      navigate('/outbox');
    }
  };

  // Handle retry button
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>جاري تحميل بيانات الطلب... (ID: {requestId})</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>حدث خطأ: {error}</p>
        <div className={styles.errorActions}>
          <button className={styles.retryButton} onClick={handleRetry}>
            إعادة المحاولة
          </button>
          <button className={styles.backButton} onClick={handleBack}>
            العودة إلى قائمة الطلبات
          </button>
        </div>
      </div>
    );
  }

  if (!requestData) {
    return (
      <div className={styles.errorContainer}>
        <p>تعذر العثور على بيانات الطلب. الرجاء التحقق من الرابط والمحاولة مرة أخرى.</p>
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
export default ApplicationHistory