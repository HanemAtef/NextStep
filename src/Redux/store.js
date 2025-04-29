import { configureStore } from "@reduxjs/toolkit";
import applicationReducer from "./slices/applicationSlice";
import inboxReducer from "./slices/inboxSlice";
import outboxReducer from "./slices/outboxSlice";
import requestReducer from "./slices/requestSlice";
import employeeSlice from "./slices/employeeSlice";
import departmentReducer from "./slices/departmentSlice";
import stepsSlice from "./slices/stepSlice";
import historySlice from "./slices/historySlice";
import detailsSlice from "./slices/detailsSlice";
import downloadSlice from "./slices/downloadSlice";
import timelineReducer from "./slices/timelineSlice";
import previewSlice from "./slices/previewSlice";

const store = configureStore({
    reducer: {
        inbox: inboxReducer,
        outbox: outboxReducer,
        application: applicationReducer,
        requestAdmin: requestReducer,
        userAdmin: employeeSlice,
        departmentAdmin: departmentReducer,
        steps: stepsSlice,
        history: historySlice,
        details: detailsSlice,
        download: downloadSlice,
        timeline: timelineReducer,
        preview: previewSlice,
    },
});

export default store;
