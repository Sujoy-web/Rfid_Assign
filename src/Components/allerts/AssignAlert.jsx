import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

const AssignAlert = ({ status }) => {
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

export default AssignAlert;