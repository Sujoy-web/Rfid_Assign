import { useEffect } from "react";
import { FaUser, FaIdCard } from "react-icons/fa";

const AssignInput = ({ student, rfid, setRfid, handleScan, inputRef, isLoading }) => {
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

export default AssignInput;