import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const audienceColors = {
  everyone: 'bg-emerald-100 text-emerald-700',
  managers_admin: 'bg-blue-100 text-blue-700',
  admin_only: 'bg-red-100 text-red-700',
};

const audienceLabels = {
  everyone: 'Everyone',
  managers_admin: 'Mgrs & Admin',
  admin_only: 'Admin Only',
};

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/announcements/unread-count');
      setUnreadCount(res.data.count || 0);
    } catch (_) {}
  }, [user]);

  const fetchAnnouncements = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data.data || []);
    } catch (_) {}
  }, [user]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const handleBellClick = async () => {
    setShowNotifications(prev => !prev);
    if (!showNotifications) {
      await fetchAnnouncements();
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/announcements/${id}/read`);
      setAnnouncements(prev => prev.map(a => a.announcement_id === id ? { ...a, is_read: true } : a));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (_) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/announcements/mark-all-read');
      setAnnouncements(prev => prev.map(a => ({ ...a, is_read: true })));
      setUnreadCount(0);
    } catch (_) {}
  };

  const handleLogout = () => {
    logout();
    navigate('/portal-admin');
  };

  const getInitials = () => {
    if (!user?.name) return 'U';
    return user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getRoleLabel = () => {
    if (!user) return 'Guest';
    switch (user.role) {
      case 'Admin': return 'Super User';
      case 'HR Manager': return 'HR Manager';
      case 'Accounts': return 'Accounts';
      default: return 'Viewer';
    }
  };

  const formatTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <nav className="fixed top-0 w-full z-50 h-16 bg-white/95 backdrop-blur-xl border-b border-surface-container shadow-sm flex items-center justify-between px-6 lg:px-8">
      {/* Left */}
      <div className="flex items-center">
         <img src="/KDMPMACU_Ltd_Logo.png" alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'contain', background: 'white', padding: '1px', boxShadow: '0 0 0 1px #c0392b30', marginRight: '12px', flexShrink: 0 }} />
         <h1 className="font-headline font-black text-xl text-[#1a4fa0] tracking-tighter uppercase">KDMPMACULTD</h1>
         
         {/* Desktop Center Links */}
         <div className="hidden lg:flex items-center ml-12 h-16 space-x-6">
            <NavLink to="/dashboard" className={({isActive}) => `h-full flex items-center px-2 border-b-2 text-sm transition-colors ${isActive ? 'border-[#1a4fa0] text-[#1a4fa0] font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Overview</NavLink>
            <NavLink to="/employees" className={({isActive}) => `h-full flex items-center px-2 border-b-2 text-sm transition-colors ${isActive ? 'border-[#1a4fa0] text-[#1a4fa0] font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Directory</NavLink>
            <NavLink to="/exit" className={({isActive}) => `h-full flex items-center px-2 border-b-2 text-sm transition-colors ${isActive ? 'border-[#1a4fa0] text-[#1a4fa0] font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Retirement & Exit</NavLink>
            <NavLink to="/reports" className={({isActive}) => `h-full flex items-center px-2 border-b-2 text-sm transition-colors ${isActive ? 'border-[#1a4fa0] text-[#1a4fa0] font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Intelligence</NavLink>
         </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        
        {/* Notifications Bell */}
        {user && (
          <div className="relative">
            <button 
              onClick={handleBellClick}
              className="relative p-2 text-slate-500 hover:text-[#1a4fa0] transition-colors rounded-full hover:bg-slate-100"
            >
              <span className="material-symbols-outlined">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-red-500 rounded-full ring-2 ring-white text-white text-[9px] font-black flex items-center justify-center px-0.5">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl ring-1 ring-slate-200 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-800">Announcements</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <span className="text-xs font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">{unreadCount} new</span>
                    )}
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-xs font-bold text-primary hover:underline">Mark all read</button>
                    )}
                  </div>
                </div>

                <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
                  {announcements.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-sm">
                      <span className="material-symbols-outlined text-3xl text-slate-300">notifications_none</span>
                      <p className="mt-2">No announcements yet.</p>
                    </div>
                  ) : (
                    announcements.map(n => (
                      <div
                        key={n.announcement_id}
                        onClick={() => !n.is_read && handleMarkRead(n.announcement_id)}
                        className={`flex items-start gap-3 p-4 transition-colors cursor-pointer ${n.is_read ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/40 hover:bg-blue-50'}`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {n.is_pinned
                            ? <span className="material-symbols-outlined text-[18px] text-amber-500">push_pin</span>
                            : <span className="material-symbols-outlined text-[18px] text-slate-400">campaign</span>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <p className={`text-xs font-bold ${n.is_read ? 'text-slate-600' : 'text-slate-900'}`}>{n.title}</p>
                            {!n.is_read && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>}
                          </div>
                          {n.message && <p className="text-[11px] text-slate-500 line-clamp-2 mb-1">{n.message}</p>}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${audienceColors[n.audience]}`}>{audienceLabels[n.audience]}</span>
                            <span className="text-[10px] text-slate-400">{formatTime(n.created_at)}</span>
                            {n.file_name && (
                              <a 
                                href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${n.file_url}`} 
                                target="_blank" rel="noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="flex items-center gap-1 text-[10px] text-[#1a4fa0] font-bold hover:underline"
                              >
                                <span className="material-symbols-outlined text-[12px]">download</span>
                                {n.file_name}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {isAdmin() && (
                  <div className="p-3 border-t border-slate-100">
                    <button className="text-xs font-bold text-primary hover:underline w-full text-center" onClick={() => { navigate('/announcements'); setShowNotifications(false); }}>
                      Manage Announcements →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* User Info */}
        {user ? (
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="hidden sm:block text-right">
              <div className="text-sm font-bold text-slate-800 leading-tight">{user.name}</div>
              <div className="text-[10px] font-label font-bold uppercase tracking-widest text-primary bg-primary-fixed/50 px-2 py-0.5 rounded mt-0.5 border border-primary-fixed-dim inline-block">{getRoleLabel()}</div>
            </div>
            
            {/* User Avatar + Dropdown */}
            <div className="relative group">
              <div className="w-9 h-9 rounded-full bg-[#1a4fa0] text-white flex items-center justify-center font-black text-xs ring-2 ring-primary/20 cursor-pointer select-none">
                {getInitials()}
              </div>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl ring-1 ring-slate-200 overflow-hidden opacity-0 group-hover:opacity-100 transition-all pointer-events-none group-hover:pointer-events-auto">
                <div className="p-3 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800">{user.name}</p>
                  <p className="text-[10px] text-slate-400">{user.email}</p>
                </div>
                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors">
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button onClick={() => navigate('/portal-admin')} className="flex items-center gap-2 bg-[#1a4fa0] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#00387e] transition-colors">
            <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
            Admin Login
          </button>
        )}
      </div>

      {/* Overlay to close notifications */}
      {showNotifications && (
        <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
      )}
    </nav>
  );
};

export default Navbar;
