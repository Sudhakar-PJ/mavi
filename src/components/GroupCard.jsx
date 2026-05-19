import { Users, Trash2 } from 'lucide-react';

const GroupCard = ({ groupName = "CSK Cricket team", summaryText = "Ticket fees", onClick, onDelete }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-surface rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer group relative"
    >
      <div className="flex items-center gap-4">
        <div className="bg-indigo-50 w-12 h-12 rounded-full flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
          <Users size={24} />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 text-lg">{groupName}</h3>
          <p className="text-slate-500 text-sm">{summaryText}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Are you sure you want to delete the group "${groupName}"? All associated expenses will also be deleted.`)) {
                onDelete();
              }
            }}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 z-10"
            title="Delete Group"
          >
            <Trash2 size={18} />
          </button>
        )}
        <div className="text-slate-400 group-hover:text-indigo-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default GroupCard;
