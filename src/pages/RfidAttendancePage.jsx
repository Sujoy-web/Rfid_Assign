// pages/RfidAttendancePage.jsx
import { useState, useEffect, useRef } from "react";
import {
  FaCheckCircle,
  FaClock,
  FaSignOutAlt,
  FaIdCard,
  FaSpinner,
} from "react-icons/fa";

export default function RfidAttendancePage() {
  const [rfid, setRfid] = useState("");//it hold the input after rfid scan 
  const [attendance, setAttendance] = useState(null);// it hold the attendance state in which came form backend
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);//it is for auto focus


  useEffect(() => {
    inputRef.current?.focus();
  }, [attendance]);//Whenever attendance changes (success/error card display), the input box is re-focused automatically.

  const handleScan = async (e) => {
    if (e.key === "Enter") {
      if (!rfid.trim()) return;

      setLoading(true);
      setAttendance(null);

      try {
        const payload = { rfid: rfid.trim() }; //  payload
        const res = await fetch("http://localhost:5000/api/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setAttendance(data);
        } else {
          setAttendance({ success: false, message: data.message || "Error" });
        }
      } catch (err) {
        setAttendance({ success: false, message: "Server error" });
      } finally {
        setLoading(false);
        setRfid("");
        setTimeout(() => inputRef.current?.focus(), 120);
      }
    }
  };

  const renderCard = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center p-6 bg-gray-800/70 rounded-xl shadow-xl max-w-lg mx-auto animate-fade-in">
          <FaSpinner className="animate-spin text-blue-400 text-4xl mb-3" />
          <p className="text-white font-semibold">Processing attendance...</p>
        </div>
      );
    }

    if (!attendance) return null;

    if (!attendance.success) {
      return (
        <div className="bg-red-600/80 text-white p-6 rounded-xl max-w-lg mx-auto shadow-xl animate-fade-in">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{attendance.message}</p>
        </div>
      );
    }

    const { student, status, time, message } = attendance;
    const dateStr = new Date(time).toLocaleString();

    let bg = "bg-gray-800/70";
    let icon = <FaCheckCircle className="text-green-400 text-3xl" />;
    let border = "border-green-500/50";

    if (status === "late") {
      bg = "bg-yellow-800/70";
      icon = <FaClock className="text-yellow-400 text-3xl" />;
      border = "border-yellow-500/50";
    }
    if (status === "out") {
      bg = "bg-blue-800/70";
      icon = <FaSignOutAlt className="text-blue-400 text-3xl" />;
      border = "border-blue-500/50";
    }

    return (
      <div
        className={`${bg} p-6 rounded-xl shadow-xl border ${border} max-w-2xl mx-auto animate-fade-in`}
      >
        <div className="flex items-center gap-6">
          <img
            src={student.img}
            alt={student.name}
            className="w-24 h-24 rounded-xl object-cover border-2 border-gray-200"
          />
          <div>
            <h2 className="text-2xl font-bold text-white">{student.name}</h2>
            <p className="text-gray-200 text-sm">
              Roll {student.roll} • Class {student.class}-{student.section}
            </p>
            <p className="text-gray-400 text-xs">{dateStr}</p>
          </div>
          <div className="ml-auto">{icon}</div>
        </div>
        <div className="mt-4 text-lg font-semibold text-white">{message}</div>
      </div>
    );
  };

return (
  <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 to-gray-800 p-6">
    <div className="w-full max-w-lg mb-6 flex flex-col items-center gap-20">
      
      {/* RFID Input */}
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

    {/* Attendance Card */}
    <div className="w-full max-w-2xl">{renderCard()}</div>

    {/* Fade-in Animation */}
    <style jsx global>{`
      @keyframes fade-in {
        from {
          opacity: 0;
          transform: translateY(10px);
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