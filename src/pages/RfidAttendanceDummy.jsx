// pages/RfidAttendancePage.jsx
import { useState, useEffect, useRef } from "react";
import {
  FaCheckCircle,
  FaClock,
  FaSignOutAlt,
  FaIdCard,
  FaSpinner,
} from "react-icons/fa";

export default function RfidAttendanceDummy() {
  const [rfid, setRfid] = useState("");
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Track who is "in" school
  const [activeStudents, setActiveStudents] = useState({}); // { rfid: true/false }

  // School mode: "in" or "out"
  const [mode, setMode] = useState("in");

  useEffect(() => {
    inputRef.current?.focus();
  }, [attendance, mode]);

  const handleScan = async (e) => {
    if (e.key === "Enter") {
      if (!rfid.trim()) return;

      setLoading(true);
      setAttendance(null);

      try {
        const saved = JSON.parse(localStorage.getItem("rfidAssignments") || "[]");
        const found = saved.find((item) => item.rfid === rfid.trim());

        if (found) {
          const isIn = activeStudents[rfid.trim()] || false;

          if (mode === "in") {
            if (isIn) {
              // Already inside, don’t mark again
              setAttendance({
                success: false,
                message: `${found.name} is already inside.`,
              });
            } else {
              // Mark entry
              setAttendance({
                success: true,
                student: { name: found.name },
                status: "in",
                time: new Date().toISOString(),
                message: `Welcome ${found.name}, have a great day! 🎉`,
              });
              setActiveStudents((prev) => ({ ...prev, [rfid.trim()]: true }));
            }
          } else if (mode === "out") {
            if (!isIn) {
              // Already outside, don’t mark again
              setAttendance({
                success: false,
                message: `${found.name} is already outside.`,
              });
            } else {
              // Mark exit
              setAttendance({
                success: true,
                student: { name: found.name },
                status: "out",
                time: new Date().toISOString(),
                message: `Goodbye ${found.name}, see you tomorrow! 👋`,
              });
              setActiveStudents((prev) => ({ ...prev, [rfid.trim()]: false }));
            }
          }
        } else {
          setAttendance({ success: false, message: "RFID not recognized" });
        }
      } catch (err) {
        setAttendance({ success: false, message: "Local storage error" });
      } finally {
        setLoading(false);
        setRfid("");
        setTimeout(() => inputRef.current?.focus(), 120);
      }
    }
  };

  const renderCard = () => {
    if (!attendance) return null;

    if (!attendance.success) {
      return (
        <div className="absolute top-6 z-50 bg-red-600/90 text-white p-6 rounded-xl max-w-lg mx-auto shadow-xl animate-fade-in">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{attendance.message}</p>
        </div>
      );
    }

    const { student, status, time, message } = attendance;
    const dateStr = new Date(time).toLocaleString();

    let bg = "bg-gray-900/90";
    let icon = <FaCheckCircle className="text-green-400 text-3xl" />;
    let border = "border-green-500/50";

    if (status === "out") {
      bg = "bg-blue-900/90";
      icon = <FaSignOutAlt className="text-blue-400 text-3xl" />;
      border = "border-blue-500/50";
    }

    return (
      <div
        className={`absolute top-6 z-50 ${bg} p-6 rounded-xl shadow-xl border ${border} max-w-xl w-full mx-auto animate-fade-in`}
      >
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{student.name}</h2>
            <p className="text-gray-300 text-xs">{dateStr}</p>
          </div>
          <div className="ml-auto">{icon}</div>
        </div>
        <div className="mt-2 text-lg font-semibold text-white">{message}</div>
      </div>
    );
  };

  // Auto hide card after 3s
  useEffect(() => {
    if (attendance) {
      const timer = setTimeout(() => setAttendance(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [attendance]);

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 to-gray-800 p-6 relative">
      {/* Attendance Card */}
      {loading && (
        <div className="absolute top-6 z-50 flex flex-col items-center justify-center p-4 bg-gray-800/90 rounded-xl shadow-xl max-w-sm mx-auto animate-fade-in">
          <FaSpinner className="animate-spin text-blue-400 text-3xl mb-2" />
          <p className="text-white font-semibold">Processing attendance...</p>
        </div>
      )}
      {renderCard()}

      {/* Mode Toggle */}
      <div className="absolute top-4 right-6">
        <button
          onClick={() => setMode((prev) => (prev === "in" ? "out" : "in"))}
          className={`px-4 py-2 rounded-lg font-semibold shadow-md ${
            mode === "in"
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-red-600 hover:bg-reds-700 text-white"
          }`}
        >
          Mode: {mode.toUpperCase()}
        </button>
      </div>

      {/* RFID Input */}
      <div className="w-full max-w-lg mb-6 flex flex-col items-center gap-20">
        <div className="w-full relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <FaIdCard className="text-gray-400" />
          </div>
          <input
            ref={inputRef}
            value={rfid}
            onChange={(e) => setRfid(e.target.value)}
            onKeyDown={handleScan}
            placeholder="Scan RFID card and press Enter"
            className="w-full pl-12 pr-5 py-4 text-center text-lg font-mono rounded-xl bg-gray-800/40 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 border border-gray-700"
          />
        </div>

        {/* RFID Image */}
        <div className="flex justify-center">
          <img
            src="src/assets/rfid.png"
            alt="RFID Scanner"
            className="w-40 h-40 md:w-52 md:h-52 animate-bounce"
          />
        </div>
      </div>

      {/* Fade-in Animation */}
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
