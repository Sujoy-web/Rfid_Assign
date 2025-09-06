import { useState, useEffect, useRef } from "react";
import { FaFilter } from "react-icons/fa";
import * as api from "../api/assign";

import AssignInput from "../Components/rfidAssign/AssignInput";
import AssignTable from "../Components/rfidAssign/AssignTable";
import AssignAlert from "../Components/allerts/AssignAlert";

export default function RfidAssignPage() {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [students, setStudents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rfid, setRfid] = useState("");
  const [assignedRfids, setAssignedRfids] = useState(new Set());
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const alertTimerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [cls, sec, ses] = await Promise.all([
          api.getClasses(),
          api.getSections(),
          api.getSessions(),
        ]);
        setClasses(cls);
        setSections(sec);
        setSessions(ses);
      } catch (err) {
        showStatus({ type: "error", message: "Failed to load initial data" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass || !selectedSection || !selectedSession) return;
      setIsLoading(true);
      try {
        const data = await api.getStudents(selectedClass, selectedSection, selectedSession);
        setStudents(data.map(s => ({ ...s, assigned: !!s.rfid })));
        
        const firstUnassignedIndex = data.findIndex(s => !s.rfid);
        setCurrentIndex(firstUnassignedIndex >= 0 ? firstUnassignedIndex : 0);
        
        setAssignedRfids(new Set(data.filter(d => d.rfid).map(d => d.rfid)));
        setTimeout(() => inputRef.current?.focus(), 120);
      } catch (err) {
        showStatus({ type: "error", message: "Failed to load students" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, [selectedClass, selectedSection, selectedSession]);

  const showStatus = (obj) => {
    setStatus(obj);
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    alertTimerRef.current = setTimeout(() => setStatus(null), 3000);
  };

  const handleScan = (e) => {
    if (e.key === "Enter") {
      if (!rfid.trim()) return showStatus({ type: "error", message: "Please scan RFID first" });
      assignRfid();
    }
  };

  const assignRfid = async () => {
    if (!rfid) return;
    if (assignedRfids.has(rfid)) return showStatus({ type: "error", message: `RFID ${rfid} is already assigned` });
    if (currentIndex >= students.length) return showStatus({ type: "error", message: "All students are already assigned" });

    const currentStudent = students[currentIndex];
    setIsLoading(true);
    try {
      const res = await api.assignRfid(currentStudent.id, rfid);
      if (res.success) {
        const updated = [...students];
        updated[currentIndex] = { ...currentStudent, rfid, assigned: true };
        setStudents(updated);
        setAssignedRfids(prev => new Set(prev).add(rfid));
        showStatus({ type: "success", message: `RFID ${rfid} assigned to ${currentStudent.name}` });
        
        let next = currentIndex + 1;
        while (next < updated.length && updated[next].assigned) next++;
        setCurrentIndex(Math.min(next, updated.length));
        
        setRfid("");
        setTimeout(() => inputRef.current?.focus(), 120);
      } else {
        showStatus({ type: "error", message: res.message || "Failed to assign RFID" });
      }
    } catch (err) {
      showStatus({ type: "error", message: "Failed to assign RFID" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveRfid = async (studentId, rfidToRemove) => {
    if (!studentId) return;
    setIsLoading(true);
    try {
      const res = await api.removeRfid(studentId);
      if (res.success) {
        const updated = students.map(s => (s.id === studentId ? { ...s, rfid: "", assigned: false } : s));
        setStudents(updated);

        setAssignedRfids(prev => {
          const copy = new Set(prev);
          copy.delete(rfidToRemove);
          return copy;
        });

        const idx = updated.findIndex(s => s.id === studentId);
        if (idx >= 0) setCurrentIndex(idx);

        showStatus({ type: "success", message: `RFID ${rfidToRemove} removed from student` });
        setTimeout(() => inputRef.current?.focus(), 120);
      } else {
        showStatus({ type: "error", message: res.message || "Failed to remove RFID" });
      }
    } catch (err) {
      showStatus({ type: "error", message: "Failed to remove RFID" });
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    total: students.length,
    assigned: students.filter(s => s.assigned).length,
    pending: students.filter(s => !s.assigned).length
  };

  const ProgressBar = () => {
    const assignedCount = students.filter(student => student.assigned).length;
    const total = students.length;
    const pct = total === 0 ? 0 : Math.round((assignedCount / total) * 100);
    
    return (
      <div className="my-6 w-full">
        <div className="flex justify-between text-sm text-gray-300 mb-2">
          <span>Assignment Progress</span>
          <span>{assignedCount} / {total} ({pct}%)</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3 shadow-inner overflow-hidden">
          <div
            className="h-3 rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${pct}%`, 
              background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
              boxShadow: "0 0 10px rgba(139, 92, 246, 0.5)"
            }}
          />
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Current: {students[currentIndex]?.name || "None"}
        </div>
      </div>
    );
  };

  const SelectFilters = () => {
    const selectBaseClass = `
      w-full px-4 py-3 bg-gray-800/70 border border-gray-600/50 
      rounded-xl text-white placeholder-gray-400 text-sm font-medium
      focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
      transition-colors disabled:opacity-50 disabled:cursor-not-allowed
      appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAzc3ZnIj48cGF0aCBkPSJNNCA2TDggMTBMMTIgNiIgc3Ryb2tlPSIjOEU5MEE2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] 
      bg-no-repeat bg-[center_right_1rem] bg-[length:16px_16px]
    `;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-300 flex items-center">
            <FaFilter className="mr-2 text-blue-400" /> Class
          </label>
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)} 
            disabled={isLoading} 
            className={selectBaseClass}
          >
            <option value="" disabled>Select Class</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-300 flex items-center">
            <FaFilter className="mr-2 text-blue-400" /> Section
          </label>
          <select 
            value={selectedSection} 
            onChange={(e) => setSelectedSection(e.target.value)} 
            disabled={isLoading} 
            className={selectBaseClass}
          >
            <option value="" disabled>Select Section</option>
            {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-300 flex items-center">
            <FaFilter className="mr-2 text-blue-400" /> Session
          </label>
          <select 
            value={selectedSession} 
            onChange={(e) => setSelectedSession(e.target.value)} 
            disabled={isLoading} 
            className={selectBaseClass}
          >
            <option value="" disabled>Select Session</option>
            {sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen overflow-auto bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <AssignAlert status={status} />
      
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-gray-700/50 shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">RFID Card Assignment</h1>
            <p className="text-gray-300">Assign RFID cards to students by scanning them one by one. Use Remove to replace a damaged card.</p>
          </div>

          <SelectFilters />

          {selectedClass && selectedSection && selectedSession && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                <div className="text-gray-400 text-sm">Total Students</div>
                <div className="text-2xl font-bold text-white">{stats.total}</div>
              </div>
              <div className="bg-green-900/20 p-4 rounded-xl border border-green-700/50">
                <div className="text-green-400 text-sm">Assigned</div>
                <div className="text-2xl font-bold text-green-400">{stats.assigned}</div>
              </div>
              <div className="bg-yellow-900/20 p-4 rounded-xl border border-yellow-700/50">
                <div className="text-yellow-400 text-sm">Pending</div>
                <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
              </div>
            </div>
          )}

          {isLoading && !students.length && (
            <div className="flex justify-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}

          {!isLoading && students.length > 0 && currentIndex < students.length && (
            <AssignInput
              student={students[currentIndex]} 
              rfid={rfid} 
              setRfid={setRfid} 
              handleScan={handleScan} 
              inputRef={inputRef} 
              isLoading={isLoading}
            />
          )}

          {!isLoading && students.length > 0 && (
            <ProgressBar />
          )}

          {!isLoading && students.length > 0 && (
            <AssignTable
              students={students} 
              currentIndex={currentIndex} 
              onRemove={handleRemoveRfid} 
              isLoading={isLoading}
            />
          )}

          {!isLoading && students.length === 0 && selectedClass && selectedSection && selectedSession && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">No students found for the selected filters</div>
              <button 
                onClick={() => {
                  setSelectedClass("");
                  setSelectedSection("");
                  setSelectedSession("");
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}

          {!isLoading && !selectedClass && !selectedSection && !selectedSession && (
            <div className="text-center text-gray-400 py-12">
              <div className="mb-4 text-lg">Please select class, section and session to begin</div>
              <FaFilter className="inline-block text-4xl text-blue-400 opacity-50" />
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translate(-50%, -10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}