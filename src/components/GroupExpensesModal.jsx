import { useState, useEffect } from 'react';
import { X, Receipt, Calendar, IndianRupee, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return new Date(year, month - 1, day).toLocaleDateString();
};

const GroupExpensesModal = ({ isOpen, onClose, group, onExpenseDeleted }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !group) return;
    
    let isMounted = true;
    
    const fetchExpenses = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .eq('group_id', group.id)
          .order('date', { ascending: false });

        if (error) throw error;
        
        if (isMounted) {
          setExpenses(data || []);
        }
      } catch (err) {
        console.error("Error fetching expenses for group", err);
        if (isMounted) setExpenses([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchExpenses();
    
    return () => { isMounted = false; };
  }, [isOpen, group]);

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;

      // Update local state of expenses
      setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
      
      // Notify parent app to update total cumulative expenses
      if (onExpenseDeleted) {
        onExpenseDeleted();
      }
    } catch (err) {
      console.error("Error deleting expense:", err.message);
      alert("Error deleting expense: " + err.message + "\n\n(Tip: Ensure you have added DELETE policies to your 'expenses' table in Supabase!)");
    }
  };

  if (!isOpen || !group) return null;

  const totalAmount = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{group.name}</h2>
            <p className="text-sm text-slate-500 mt-1">{group.summary || 'No summary'}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Expenses List */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-500" />
              <p>Loading expenses...</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Receipt size={24} />
              </div>
              <p className="font-medium text-slate-700">No expenses yet</p>
              <p className="text-sm mt-1">Expenses added to this group will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {expenses.map((expense) => (
                <div key={expense.id} className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between shadow-sm hover:shadow transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-50 w-10 h-10 rounded-full flex items-center justify-center text-green-600 shrink-0">
                      <Receipt size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{expense.description}</h4>
                      <div className="flex items-center text-xs text-slate-400 mt-1 gap-1">
                        <Calendar size={12} />
                        <span>{formatDate(expense.date)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-bold text-slate-800 flex items-center justify-end">
                        <IndianRupee size={16} className="text-slate-400" />
                        {parseFloat(expense.amount).toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Expense"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer summary */}
        {!loading && expenses.length > 0 && (
          <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <span className="font-semibold text-slate-600">Total Group Expenses</span>
            <span className="text-xl font-bold text-indigo-600 flex items-center">
              <IndianRupee size={20} />
              {totalAmount.toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupExpensesModal;
