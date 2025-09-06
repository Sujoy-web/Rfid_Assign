import { FaCheckCircle, FaTrash } from "react-icons/fa";

const AssignRow = ({ student, index, isCurrent, onRemove, isLoading }) => {
  return (
    <tr className={`transition-all duration-200 ${isCurrent ? "bg-blue-900/30 ring-1 ring-blue-500" : "hover:bg-gray-800/30"} ${index % 2 === 0 ? 'bg-gray-900/10' : ''}`}>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center">
          {isCurrent && <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>}
          <span>{index + 1}</span>
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap font-medium">{student.name}</td>
      <td className="px-4 py-3 whitespace-nowrap">{student.roll}</td>
      <td className="px-4 py-3 whitespace-nowrap font-mono text-sm bg-gray-800/30 px-2 py-1 rounded">
        {student.rfid || <span className="text-gray-500">Not assigned</span>}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {student.assigned ? (
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
        {student.rfid ? (
          <button
            onClick={() => onRemove(student.id, student.rfid)}
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
};

export default AssignRow;