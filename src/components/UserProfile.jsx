import { useEffect, useState } from 'react';
import { User, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch the profile matching the logged-in user's ID
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single();
        
        if (!error && data) {
          setProfile(data);
        } else {
          // Fallback to user metadata
          setProfile({
            full_name: user.user_metadata?.full_name || user.email.split('@')[0],
            avatar_url: user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.id}`,
          });
        }
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.log("Error loading user profile details.", error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Defer the initial fetch to ensure it does not run synchronously during render/effect mount phase
    const initFetch = setTimeout(() => {
      fetchProfile();
    }, 0);

    // Listen for auth change to re-fetch
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });

    return () => {
      clearTimeout(initFetch);
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 animate-pulse">
        <div className="text-right hidden sm:block space-y-2">
          <div className="h-3 w-20 bg-slate-200 rounded"></div>
          <div className="h-2 w-12 bg-slate-200 rounded ml-auto"></div>
        </div>
        <div className="w-11 h-11 bg-slate-200 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-full shadow-sm border border-slate-100">
      <div className="w-10 h-10 rounded-full bg-indigo-50 overflow-hidden flex items-center justify-center text-indigo-500 flex-shrink-0">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <User size={20} />
        )}
      </div>
      <div className="text-left hidden sm:block">
        <p className="text-sm font-bold text-slate-800 leading-tight">{profile?.full_name || 'Guest User'}</p>
        <button 
          onClick={handleLogout}
          className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 mt-0.5 transition-colors cursor-pointer"
        >
          <LogOut size={12} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
