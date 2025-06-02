// import { BrowserRouter } from "react-router-dom";
// import MainDashboard from "./Pages/Dashboards/Maindashboard";
// import './App.css';

// function App() {

//   return (
//     <div className="App">
//       <BrowserRouter>
//         <MainDashboard />
//       </BrowserRouter>
//     </div>
//   )
// }

// export default App;

// App.js
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "../src/AppRoute/AppRoute"; // استيراد AppRoutes
import './App.css';

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
