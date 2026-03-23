import { Outlet, useLocation, Link } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
    const location = useLocation();
    
    const getBreadcrumbs = () => {
      const paths = location.pathname.split('/').filter(p => p);
      if(paths.length === 0) return [{name: 'HOME', path: '/'}];
      
      let crumbs = [{name: 'HOME', path: '/'}];
      paths.forEach((path, idx) => {
        const url = `/${paths.slice(0, idx + 1).join('/')}`;
        crumbs.push({ name: path.toUpperCase().replace('-', ' '), path: url });
      });
      return crumbs;
    };

    const breadcrumbs = getBreadcrumbs();

    return (
        <div className="min-h-screen bg-surface font-body text-on-surface">
            <Navbar />
            <Sidebar />
            <main className="lg:ml-64 pt-24 pb-24 lg:pb-12 px-4 sm:px-6 lg:px-8 min-h-screen relative">
                
                {/* Global Breadcrumb */}
                <div className="flex items-center gap-2 mb-6 text-xs font-label uppercase tracking-[0.05em]">
                    {breadcrumbs.map((crumb, idx) => (
                        <div key={crumb.path} className="flex items-center gap-2">
                            {idx > 0 && <span className="material-symbols-outlined text-sm text-outline">chevron_right</span>}
                            <Link 
                                to={crumb.path} 
                                className={`${idx === breadcrumbs.length - 1 ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary transition-colors'}`}
                            >
                                {crumb.name}
                            </Link>
                        </div>
                    ))}
                </div>

                <div className="max-w-7xl mx-auto w-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
