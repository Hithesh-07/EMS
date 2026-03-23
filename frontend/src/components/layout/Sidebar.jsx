import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin, canManageEmployees } = useAuth();

  const navItems = [
    { name: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { name: 'Employees', icon: 'group', path: '/employees' },
    { name: 'Documents', icon: 'description', path: '/documents', canAccess: canManageEmployees },
    { name: 'Transfers', icon: 'swap_horiz', path: '/transfers' },
    { name: 'Retirement & Exit', icon: 'exit_to_app', path: '/exit' },
    { name: 'Reports', icon: 'assessment', path: '/reports', canAccess: isAdmin },
    { name: 'Announcements', icon: 'campaign', path: '/announcements', canAccess: isAdmin },
    { name: 'Admin Settings', icon: 'settings', path: '/admin', canAccess: isAdmin }
  ];

  const filteredNavItems = navItems.filter(item => !item.canAccess || item.canAccess());

  return (
    <>
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 py-8 px-4 bg-slate-50/90 backdrop-blur-xl z-40 mt-16 shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-slate-200/50">
        
        <div className="flex items-center gap-3 px-2 mb-10">
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'white', padding: '2px', boxShadow: '0 0 0 2px #c0392b40' }}>
            <img 
              src="/KDMPMACU_Ltd_Logo.png" 
              alt="KDMPMACULTD Logo" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onError={(e) => {
                e.target.outerHTML = '<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:#c0392b; border-radius:50%;"><span style="color:white; font-weight:900; font-size:10px;">KDMP</span></div>';
              }} 
            />
          </div>
          <div>
            <h2 className="font-headline font-extrabold text-[#1a4fa0] text-sm leading-tight tracking-tight uppercase">KDMPMACULTD</h2>
            <p className="text-[0.7rem] text-slate-500 font-medium">Dairy Management</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto pr-2 custom-scrollbar">
          {filteredNavItems.map(item => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive: exactActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200
                  ${isActive || exactActive 
                    ? 'bg-white text-[#1a4fa0] font-bold shadow-sm ring-1 ring-slate-900/5' 
                    : 'text-slate-600 hover:text-[#1a4fa0] hover:translate-x-1 hover:bg-slate-100/50'}
                `}
              >
                <span className={`material-symbols-outlined text-lg ${isActive ? 'fill-icon' : ''}`}>
                  {item.icon}
                </span>
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-8 pt-6 border-t border-slate-200/60 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:text-[#1a4fa0] hover:translate-x-1 transition-all">
            <span className="material-symbols-outlined text-lg">help</span>
            <span className="font-medium">Help Center</span>
          </button>
          
          {user && (
            <button 
              onClick={() => {
                  logout();
                  navigate('/dashboard');
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-error hover:translate-x-1 transition-all group"
            >
              <span className="material-symbols-outlined text-lg group-hover:fill-icon">logout</span>
              <span className="font-medium">Logout ({user.name})</span>
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-6 h-16 flex justify-between items-center z-50 rounded-t-2xl border-t border-slate-100">
        {[
          { name: 'Exit', icon: 'exit_to_app', path: '/exit' },
          { name: 'Employees', icon: 'group', path: '/employees' },
          { name: 'Reports', icon: 'assessment', path: '/reports', adminOnly: true },
          { name: 'Dashboard', icon: 'dashboard', path: '/dashboard' }
        ].filter(item => !item.adminOnly || isAdmin()).map(item => {
           const isActive = location.pathname.startsWith(item.path);
           return (
             <NavLink key={item.name} to={item.path} className="flex flex-col items-center justify-center w-16 h-full relative group">
                {isActive && <div className="absolute top-0 w-8 h-1 editorial-gradient rounded-b-md"></div>}
                <span className={`material-symbols-outlined text-2xl mb-1 transition-transform ${isActive ? 'text-[#1a4fa0] fill-icon -translate-y-1' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  {item.icon}
                </span>
                <span className={`text-[10px] font-bold ${isActive ? 'text-[#1a4fa0]' : 'text-transparent'}`}>
                  {item.name}
                </span>
             </NavLink>
           );
        })}
      </div>
    </>
  );
};

export default Sidebar;
