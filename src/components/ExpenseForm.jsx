import { useState } from 'react';
import { Calendar, IndianRupee, FileText, AlertCircle, Layers } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ExpenseForm = ({ groups = [], onExpenseAdded }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [groupId, setGroupId] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);



  const validate = () => {
    const newErrors = {};
    if (!amount) {
      newErrors.amount = "Amount is required";
    } else if (Number(amount) < 0) {
      newErrors.amount = "Amount cannot be negative";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!date) {
      newErrors.date = "Date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to add expenses.");
      }

      const { error: insertError } = await supabase
        .from('expenses')
        .insert({
          amount: parseFloat(amount),
          description,
          date,
          group_id: groupId || (groups[0]?.id || null),
          created_by: user.id
        });

      if (insertError) {
        throw insertError;
      }

      // Reset fields (except group/date usually)
      setAmount('');
      setDescription('');
      
      if (onExpenseAdded) {
        onExpenseAdded();
      }
    } catch (err) {
      console.error("Error submitting expense:", err.message);
      alert("Error saving expense: " + err.message + "\n\n(Tip: Ensure you have run the schema script in your Supabase SQL Editor!)");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 max-w-md w-full">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Additional expenses</h2>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Group</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Layers size={18} />
            </div>
            <select
              value={groupId || (groups[0]?.id || '')}
              onChange={(e) => setGroupId(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl bg-slate-50 focus:bg-white transition-colors outline-none appearance-none"
            >
              {groups.length === 0 ? (
                <option value="">No Groups Available</option>
              ) : (
                groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))
              )}
            </select>
          </div>
          {groups.length === 0 && (
            <p className="mt-1.5 text-sm text-amber-600 flex items-center gap-1">
              <AlertCircle size={14} /> Please create a group before adding expenses.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <IndianRupee size={18} />
            </div>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`block w-full pl-10 pr-3 py-3 border ${errors.amount ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'} rounded-xl bg-slate-50 focus:bg-white transition-colors outline-none`}
              placeholder="0.00"
            />
          </div>
          {errors.amount && (
            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.amount}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <FileText size={18} />
            </div>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`block w-full pl-10 pr-3 py-3 border ${errors.description ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'} rounded-xl bg-slate-50 focus:bg-white transition-colors outline-none`}
              placeholder="What was this for?"
            />
          </div>
          {errors.description && (
            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.description}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Calendar size={18} />
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`block w-full pl-10 pr-3 py-3 border ${errors.date ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'} rounded-xl bg-slate-50 focus:bg-white transition-colors outline-none`}
            />
          </div>
          {errors.date && (
            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.date}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting || groups.length === 0}
          className="w-full bg-indigo-600 text-white font-medium py-3.5 px-4 rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors mt-2 shadow-sm shadow-indigo-200 flex items-center justify-center disabled:opacity-50"
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            'Add Expense'
          )}
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;
