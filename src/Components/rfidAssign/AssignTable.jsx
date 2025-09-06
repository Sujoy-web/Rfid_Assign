import AssignRow from "./AssignRow";

const AssignTable = ({ students, currentIndex, onRemove, isLoading }) => {
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
          {students.map((student, index) => (
            <AssignRow
              key={student.id}
              student={student}
              index={index}
              isCurrent={index === currentIndex}
              onRemove={onRemove}
              isLoading={isLoading}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssignTable;