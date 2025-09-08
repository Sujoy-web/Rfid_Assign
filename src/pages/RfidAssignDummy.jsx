// pages/RfidAssignPage.jsx
import { useState, useEffect, useRef } from "react";
import { FaCheckCircle, FaExclamationTriangle, FaTrash, FaUser, FaIdCard, FaFilter } from "react-icons/fa";

// Mock API Service
const apiService = {
  getClasses: async () => [
    { id: "c1", name: "Class 1" },
    { id: "c2", name: "Class 2" },
    { id: "c3", name: "Class 3" },
  ],
  getSections: async () => [
    { id: "s1", name: "Section A" },
    { id: "s2", name: "Section B" },
    { id: "s3", name: "Section C" },
  ],
  getSessions: async () => [
    { id: "sess1", name: "2025-2026" },
    { id: "sess2", name: "2026-2027" },
  ],
  getStudents: async (classId, sectionId, sessionId) => [
    { id: "stu1", name: "Alice Johnson", roll: "01", class: "10", section: "A", session: "2025-26", rfid: "" },
    { id: "stu2", name: "Bob Smith", roll: "02", class: "10", section: "A", session: "2025-26", rfid: "" },
    { id: "stu3", name: "Charlie Brown", roll: "03", class: "10", section: "A", session: "2025-26", rfid: "" },
    { id: "stu4", name: "Diana Prince", roll: "04", class: "10", section: "A", session: "2025-26", rfid: "" },
    { id: "stu5", name: "Ethan Hunt", roll: "05", class: "10", section: "A", session: "2025-26", rfid: "" },
  ],
  assignRfid: async (studentId, rfid) => {
    // Simulate success/failure
    if (rfid === "0000") {
      return { success: false, message: "RFID cannot be 0000" };
    }
    // In real backend you'd POST here
    return { success: true };
  },
  removeRfid: async (studentId) => {
    // Simulate removal success
    return { success: true, message: "RFID removed successfully" };
  },
};

export default function RfidAssignDummy() {
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
          apiService.getClasses(),
          apiService.getSections(),
          apiService.getSessions(),
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
        const data = await apiService.getStudents(selectedClass, selectedSection, selectedSession);
        // ensure assigned flag and rfid field
        setStudents(data.map(s => ({ ...s, assigned: !!s.rfid })));
        
        // Find the first unassigned student
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
      const res = await apiService.assignRfid(currentStudent.id, rfid);
      if (res.success) {
        const updated = [...students];
        updated[currentIndex] = { ...currentStudent, rfid, assigned: true };
        setStudents(updated);
        setAssignedRfids(prev => new Set(prev).add(rfid));
        showStatus({ type: "success", message: `RFID ${rfid} assigned to ${currentStudent.name}` });
        
        // advance to next unassigned student
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

  // Remove RFID from student (and make them current target for new assignment)
  const handleRemoveRfid = async (studentId, rfidToRemove) => {
    if (!studentId) return;
    setIsLoading(true);
    try {
      const res = await apiService.removeRfid(studentId);
      if (res.success) {
        const updated = students.map(s => (s.id === studentId ? { ...s, rfid: "", assigned: false } : s));
        setStudents(updated);

        // remove from assignedRfids set
        setAssignedRfids(prev => {
          const copy = new Set(prev);
          copy.delete(rfidToRemove);
          return copy;
        });

        // set the currentIndex to the removed student's index so user can immediately reassign
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

  // StatusAlert Component
  const StatusAlert = ({ status }) => {
    if (!status) return null;

    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full animate-fade-in">
        <div className={`px-6 py-4 rounded-xl shadow-lg font-semibold flex items-center ${
          status.type === "success" 
            ? "bg-green-500/90 text-white border-l-4 border-green-300" 
            : "bg-red-500/90 text-white border-l-4 border-red-300"
        }`}>
          {status.type === "success" 
            ? <FaCheckCircle className="mr-3 text-lg" /> 
            : <FaExclamationTriangle className="mr-3 text-lg" />
          }
          <span>{status.message}</span>
        </div>
      </div>
    );
  };

  // SelectFilters Component
  const SelectFilters = ({ classes, sections, sessions, selectedClass, setSelectedClass, selectedSection, setSelectedSection, selectedSession, setSelectedSession, isLoading }) => {
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
           Class
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
            Section
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
          Session
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

  // RfidInput Component
  const RfidInput = ({ student, rfid, setRfid, handleScan, inputRef, isLoading }) => {
    useEffect(() => {
      inputRef?.current?.focus();
    }, [student, inputRef]);

    return (
      <div className="mb-6 flex flex-col items-center">
        <div className="w-full max-w-2xl bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-blue-700/20 p-3 rounded-xl mr-4">
                <FaUser className="text-blue-400 text-xl" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">{student?.name ?? "No student selected"}</h2>
                <p className="text-sm text-gray-400">Roll: {student?.roll ?? "-" } • {student?.class}/{student?.section}</p>
              </div>
            </div>
            <div className="text-sm text-gray-300 bg-blue-900/30 px-3 py-1 rounded-full">
              Current Target
            </div>
          </div>

          <div className="mt-4 relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <FaIdCard className="text-gray-400" />
            </div>
            <input
              ref={inputRef}
              value={rfid}
              onChange={(e) => setRfid(e.target.value)}
              onKeyDown={handleScan}
              disabled={isLoading}
              placeholder="Scan RFID card and press Enter"
              className="w-full pl-12 pr-5 py-3 text-center text-lg font-mono rounded-2xl bg-gray-800/40 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 border border-gray-700"
            />
          </div>
        </div>
      </div>
    );
  };

  // ProgressBar Component
  const ProgressBar = ({ students, currentIndex }) => {
    // Calculate the number of assigned students
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

  // StudentTable Component
  const StudentTable = ({ students, currentIndex, onRemove, isLoading }) => {
    return (
      <div className="h-[50vh] overflow-auto rounded-xl border border-gray-700/50 shadow-lg mt-6">
        <table className="min-w-full text-white border-collapse">
          <thead className="bg-gray-800 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">#</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Student</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Roll</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">RFID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {students.map((stu, idx) => {
              const isCurrent = idx === currentIndex;
              return (
                <tr key={stu.id} className={`transition-all duration-200 ${isCurrent ? "bg-blue-900/30 ring-1 ring-blue-500" : "hover:bg-gray-800/30"} ${idx % 2 === 0 ? 'bg-gray-900/10' : ''}`}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      {isCurrent && <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>}
                      <span>{idx + 1}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium">{stu.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{stu.roll}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-sm bg-gray-800/30 px-2 py-1 rounded">
                    {stu.rfid || <span className="text-gray-500">Not assigned</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {stu.assigned ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-800/30 text-green-400 border border-green-700/50">
                        <FaCheckCircle className="mr-1" /> Assigned
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-800/30 text-yellow-400 border border-yellow-700/50">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    {stu.rfid ? (
                      <button
                        onClick={() => onRemove(stu.id, stu.rfid)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove RFID from student"
                      >
                        <FaTrash /> Remove
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="h-screen overflow-auto bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <StatusAlert status={status} />
      
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-gray-700/50 shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">RFID Card Assignment</h1>
            <p className="text-gray-300">Assign RFID cards to students by scanning them one by one. Use Remove to replace a damaged card.</p>
          </div>

          <SelectFilters
            classes={classes} sections={sections} sessions={sessions}
            selectedClass={selectedClass} setSelectedClass={setSelectedClass}
            selectedSection={selectedSection} setSelectedSection={setSelectedSection}
            selectedSession={selectedSession} setSelectedSession={setSelectedSession}
            isLoading={isLoading}
          />

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
            <RfidInput 
              student={students[currentIndex]} 
              rfid={rfid} 
              setRfid={setRfid} 
              handleScan={handleScan} 
              inputRef={inputRef} 
              isLoading={isLoading}
            />
          )}

          {!isLoading && students.length > 0 && (
            <ProgressBar 
              students={students} 
              currentIndex={currentIndex} 
            />
          )}

          {!isLoading && students.length > 0 && (
            <StudentTable 
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