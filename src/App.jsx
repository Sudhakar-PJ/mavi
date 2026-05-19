import { useState, useEffect, useCallback } from 'react';
import GroupCard from './components/GroupCard';
import ExpenseForm from './components/ExpenseForm';
import ExpensesSummaryModal from './components/ExpensesSummaryModal';
import UserProfile from './components/UserProfile';
import Auth from './components/Auth';
import CreateGroupModal from './components/CreateGroupModal';
import GroupExpensesModal from './components/GroupExpensesModal';
import { supabase } from './lib/supabase';
import { Wallet, PieChart, Plus } from 'lucide-react';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [selectedGroupForModal, setSelectedGroupForModal] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    // Check current active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen to changes in auth state (login/logout/signup)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchGroups = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setGroups(data || []);
    } catch (err) {
      console.log("Could not load groups table from Supabase.", err.message);
      setGroups([]);
    }
  }, []);

  const fetchExpensesTotal = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('amount, group_id');

      if (error) throw error;
      
      if (data) {
        setExpenses(data);
        const sum = data.reduce((acc, exp) => acc + parseFloat(exp.amount), 0);
        setTotalSpent(sum);
      }
    } catch (err) {
      console.log("Could not fetch expenses from Supabase. Using default state.", err.message);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let timer;

    if (session?.user) {
      timer = setTimeout(() => {
        if (isMounted) {
          fetchGroups();
          fetchExpensesTotal();
        }
      }, 0);
    } else {
      timer = setTimeout(() => {
        if (isMounted) {
          setGroups([]);
          setTotalSpent(0);
          setExpenses([]);
        }
      }, 0);
    }

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [session, fetchGroups, fetchExpensesTotal]);

  const handleExpenseAdded = () => {
    fetchExpensesTotal();
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;
      
      fetchGroups();
      fetchExpensesTotal();
    } catch (err) {
      console.error("Error deleting group:", err.message);
      alert("Error deleting group: " + err.message + "\n\n(Tip: Ensure you have added DELETE policies to your 'groups' table in Supabase!)");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Redirect to Auth page if no active session is found
  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-sm shadow-indigo-200">
                <Wallet size={24} />
              </div>
              <span className="font-bold text-2xl text-slate-800 tracking-tight">SplitEase</span>
            </div>
            <div className="flex items-center">
              <UserProfile />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4 sm:gap-0">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 mt-1.5 text-lg">Manage your groups and expenses easily</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-white border border-slate-200 text-slate-700 font-semibold py-3 px-5 rounded-xl hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2.5 active:scale-95"
          >
            <PieChart size={20} className="text-indigo-500" />
            Expenses summary
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Groups */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Your Groups</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {groups.map((group) => (
                <GroupCard 
                  key={group.id || group.name} 
                  groupName={group.name} 
                  summaryText={group.summary} 
                  onClick={() => setSelectedGroupForModal(group)}
                  onDelete={() => handleDeleteGroup(group.id)}
                />
              ))}
              
              <div 
                onClick={() => setIsCreateGroupModalOpen(true)}
                className="bg-slate-100 border-2 border-dashed border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all cursor-pointer group"
              >
                <div className="bg-white p-3 rounded-full mb-3 shadow-sm text-slate-400 group-hover:text-indigo-600 transition-colors">
                  <Plus size={24} strokeWidth={2.5} />
                </div>
                <span className="font-semibold">Create New Group</span>
              </div>
            </div>
          </div>

          {/* Right Column: Add Expense Form */}
          <div className="lg:col-span-1">
            <ExpenseForm groups={groups} onExpenseAdded={handleExpenseAdded} />
          </div>
        </div>
      </main>

      <ExpensesSummaryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        totalSpent={totalSpent} 
        groups={groups}
        expenses={expenses}
      />
      <CreateGroupModal 
        isOpen={isCreateGroupModalOpen} 
        onClose={() => setIsCreateGroupModalOpen(false)} 
        onGroupCreated={() => fetchGroups()}
        userId={session?.user?.id}
      />
      <GroupExpensesModal
        isOpen={!!selectedGroupForModal}
        onClose={() => setSelectedGroupForModal(null)}
        group={selectedGroupForModal}
        onExpenseDeleted={fetchExpensesTotal}
      />
    </div>
  );
}

export default App;
