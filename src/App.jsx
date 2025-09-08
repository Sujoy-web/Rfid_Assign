// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Layout
import AppLayout from "./layout/AppLayout";

// Pages

import RfidAssignDummy from "./pages/RfidAssignDummy";

// import RfidAttendancePage from "./pages/RfidAttendancePage";
import RfidAttendanceReport from "./pages/RfidAttendanceReport";
import RfidAttendanceDummy from "./pages/RfidAttendanceDummy";

function App() {
  return (
    <Router>
      <Routes>
        {/* All pages wrapped inside AppLayout */}
        <Route element={<AppLayout />}>
          {/* Default route */}
          <Route path="/" element={<RfidAssignDummy />} />

          {/* Other routes */}
          <Route path="/attendance-report" element={<RfidAttendanceReport />} />
          <Route path="/assign-dummy" element={<RfidAssignDummy />} />
          <Route path="/attendance-dummy" element={<RfidAttendanceDummy />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
