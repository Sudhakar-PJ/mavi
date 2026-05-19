import { X, PieChart, IndianRupee } from 'lucide-react';

const ExpensesSummaryModal = ({ isOpen, onClose, totalSpent = 0, groups = [], expenses = [] }) => {
  if (!isOpen) return null;

  // Calculate totals per group
  const groupTotals = groups.map(group => {
    const total = expenses
      .filter(exp => exp.group_id === group.id)
      .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    return {
      id: group.id,
      name: group.name,
      total
    };
  });

  // Calculate unassigned expenses (if any exist)
  const unassignedTotal = expenses
    .filter(exp => !exp.group_id)
    .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl transition-all transform scale-100 flex flex-col max-h-[80vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center text-indigo-600 mb-4">
            <PieChart size={32} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Expenses Summary</h3>
          <p className="text-slate-500 text-sm">Here is the total breakdown of your recorded expenses by group.</p>
        </div>

        {/* Total Spent Overall */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mb-6 flex justify-between items-center shrink-0">
          <span className="text-indigo-900 font-semibold">Total Cumulative Expenses</span>
          <span className="text-2xl font-bold text-indigo-700 flex items-center">
            <IndianRupee size={22} className="mr-0.5" />
            {totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Group Breakdown List */}
        <div className="overflow-y-auto flex-1 pr-1 mb-6 space-y-3">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Breakdown by Group</h4>
          {groupTotals.map(group => (
            <div key={group.id} className="flex justify-between items-center bg-slate-50 hover:bg-slate-100/70 border border-slate-100 p-4 rounded-xl transition-colors">
              <span className="font-medium text-slate-700">{group.name}</span>
              <span className="font-bold text-slate-800 flex items-center">
                <IndianRupee size={14} className="text-slate-400 mr-0.5" />
                {group.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          ))}

          {unassignedTotal > 0 && (
            <div className="flex justify-between items-center bg-slate-50 hover:bg-slate-100/70 border border-slate-100 p-4 rounded-xl transition-colors">
              <span className="font-medium text-slate-700 italic">Unassigned Expenses</span>
              <span className="font-bold text-slate-800 flex items-center">
                <IndianRupee size={14} className="text-slate-400 mr-0.5" />
                {unassignedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {groups.length === 0 && unassignedTotal === 0 && (
            <p className="text-center py-6 text-slate-400 text-sm">No groups or expenses found.</p>
          )}
        </div>

        <button 
          onClick={onClose}
          className="w-full bg-slate-900 text-white font-medium py-3.5 px-4 rounded-xl hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shrink-0"
        >
          Got it, thanks!
        </button>
      </div>
    </div>
  );
};

export default ExpensesSummaryModal;
