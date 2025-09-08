// pages/RfidAttendanceReport.jsx
import { useState } from "react";

export default function RfidAttendanceReport() {
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    session: "",
    class: "",
    section: "",
  });
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const fetchReport = async () => {
    setLoading(true);
    setShowTable(false);

    setTimeout(() => {
      // ✅ Fetch from localStorage instead of dummy
      const saved = JSON.parse(localStorage.getItem("rfidAttendanceLog") || "[]");
      setReport(saved);
      setLoading(false);
      setShowTable(true);
    }, 800);
  };

  const exportReport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Student Name,RFID,Class,Section,Roll,In Time,Out Time,Status"]
        .concat(
          report.map(
            (r) =>
              `${r.name},${r.rfid},${r.class},${r.section},${r.roll},${r.inTime},${r.outTime || ""},${r.status}`
          )
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "attendance_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate academic year options
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = 0; i < 6; i++) {
    const year = currentYear - i;
    yearOptions.push(
      <option key={year} value={year}>
        {year}
      </option>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      {/* Filters */}
      <div className="w-full max-w-6xl bg-gray-800/70 p-6 rounded-xl shadow-xl mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">
          Generate Attendance Report
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="text-gray-200 font-semibold">Date From*</label>
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleChange}
              className="w-full mt-1 p-2 rounded-md bg-gray-700 text-white"
            />
          </div>
          <div>
            <label className="text-gray-200 font-semibold">Date To*</label>
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleChange}
              className="w-full mt-1 p-2 rounded-md bg-gray-700 text-white"
            />
          </div>
          <div>
            <label className="text-gray-200 font-semibold">Academic Year</label>
            <select
              name="session"
              value={filters.session}
              onChange={handleChange}
              className="w-full mt-1 p-2 rounded-md bg-gray-700 text-white"
            >
              <option value="">Select Year</option>
              {yearOptions}
            </select>
          </div>
          <div>
            <label className="text-gray-200 font-semibold">Class</label>
            <select
              name="class"
              value={filters.class}
              onChange={handleChange}
              className="w-full mt-1 p-2 rounded-md bg-gray-700 text-white"
            >
              <option value="">Select Class</option>
              <option value="VI">VI</option>
              <option value="VII">VII</option>
              <option value="VIII">VIII</option>
              <option value="IX">IX</option>
              <option value="X">X</option>
            </select>
          </div>
          <div>
            <label className="text-gray-200 font-semibold">Section</label>
            <select
              name="section"
              value={filters.section}
              onChange={handleChange}
              className="w-full mt-1 p-2 rounded-md bg-gray-700 text-white"
            >
              <option value="">Select Section</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>
        </div>
        <button
          onClick={fetchReport}
          disabled={loading}
          className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {loading ? "Generating..." : "Generate Report"}
        </button>
      </div>

      {/* Export Button */}
      {report.length > 0 && (
        <button
          onClick={exportReport}
          className="mb-4 px-6 py-2 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600"
        >
          Export Report
        </button>
      )}

      {/* Report Table */}
      {showTable && report.length > 0 && (
        <div className="w-full max-w-6xl overflow-x-auto bg-gray-800/70 rounded-xl shadow-xl p-4">
          <table className="min-w-full text-white table-auto">
            <thead>
              <tr className="bg-gray-700">
                <th className="px-4 py-2">Student Name</th>
                <th className="px-4 py-2">RFID</th>
                <th className="px-4 py-2">Class</th>
                <th className="px-4 py-2">Section</th>
                <th className="px-4 py-2">Roll</th>
                <th className="px-4 py-2">In Time</th>
                <th className="px-4 py-2">Out Time</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {report.map((r, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? "bg-gray-800/60" : "bg-gray-800/40"}
                >
                  <td className="border px-4 py-2">{r.name}</td>
                  <td className="border px-4 py-2">{r.rfid}</td>
                  <td className="border px-4 py-2">{r.class}</td>
                  <td className="border px-4 py-2">{r.section}</td>
                  <td className="border px-4 py-2">{r.roll}</td>
                  <td className="border px-4 py-2">{r.inTime}</td>
                  <td className="border px-4 py-2">{r.outTime || "—"}</td>
                  <td className="border px-4 py-2">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showTable && report.length === 0 && !loading && (
        <div className="w-full max-w-6xl bg-gray-800/70 rounded-xl shadow-xl p-8 text-center text-white">
          <p>No attendance records found for the selected filters.</p>
        </div>
      )}
    </div>
  );
}
