import { NavLink, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(p => p);
    if(paths.length === 0) return [{name: 'DASHBOARD', path: '/dashboard'}];
    
    return paths.map((path, idx) => {
      const url = `/${paths.slice(0, idx + 1).join('/')}`;
      return { name: path.toUpperCase().replace('-', ' '), path: url };
    });
  };

  const breadcrumbs = getBreadcrumbs(); // Might be unused here but kept based on original snippet

  return (
    <nav className="fixed top-0 w-full z-50 h-16 bg-white/85 backdrop-blur-xl border-b border-surface-container shadow-sm flex items-center justify-between px-6 lg:px-8">
      {/* Left */}
      <div className="flex items-center">
         <h1 className="font-headline font-extrabold text-xl text-[#1a4fa0] tracking-tighter">The Editorial Authority</h1>
         
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
        <button className="relative p-2 text-slate-500 hover:text-[#1a4fa0] transition-colors rounded-full hover:bg-slate-100">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full ring-2 ring-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="hidden sm:block text-right">
                <div className="text-sm font-bold text-slate-800 leading-tight">Admin</div>
                <div className="text-[10px] font-label font-bold uppercase tracking-widest text-primary bg-primary-fixed/50 px-2 py-0.5 rounded mt-0.5 border border-primary-fixed-dim inline-block">Super User</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden ring-2 ring-primary-container/20">
                <img src="https://i.pravatar.cc/150?u=admin" alt="Avatar" className="w-full h-full object-cover" />
            </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
