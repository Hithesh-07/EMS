import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Dashboard = () => {
    const navigate = useNavigate();
    
    const [recentEmployees, setRecentEmployees] = useState([]);
    const [loadingRecent, setLoadingRecent] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch connected backend data
                const statsRes = await api.get('/dashboard');
                if (statsRes.data.success) {
                    setStats({
                        totalEmployees: statsRes.data.data.totalStaff || 0,
                        newJoinings: statsRes.data.data.newJoinees || 0,
                        pendingTransfers: statsRes.data.data.pendingTransfers || 0,
                        activeDepts: statsRes.data.data.activeDepts || 0
                    });
                }

                // Fetch real recent employees
                const empRes = await api.get('/employees?limit=5');
                if (empRes.data.success) {
                    setRecentEmployees(empRes.data.data);
                }
            } catch (error) {
                console.error("Dashboard data fetch failed:", error);
            } finally {
                setLoadingRecent(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="w-full animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h2 className="font-headline font-bold text-3xl text-on-surface tracking-tight">HR Overview</h2>
                <button 
                    onClick={() => navigate('/employees/new')}
                    className="flex items-center gap-2 editorial-gradient text-white px-5 py-3 rounded-xl font-headline font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
                >
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                    Register New Employee
                </button>
            </div>

            {/* Alert Banner */}
            {stats.pendingTransfers > 0 && (
                <div className="bg-secondary-fixed/50 border-l-4 border-secondary rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-secondary fill-icon">swap_horiz</span>
                        </div>
                        <div>
                            <p className="font-bold text-on-surface font-headline text-lg">{stats.pendingTransfers} pending employee transfers</p>
                            <p className="text-on-surface-variant text-sm">Action required: Review and approve these transfer requests.</p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/transfers')} className="text-[#1a4fa0] font-bold text-sm underline underline-offset-4 hover:text-primary transition-colors shrink-0">
                        View Pending
                    </button>
                </div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
                
                {/* Total Employees */}
                <div className="bg-surface-container-lowest p-6 rounded-2xl relative overflow-hidden ring-1 ring-slate-200/50 shadow-sm group hover:shadow-md transition-all">
                    <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-[120px] text-primary/5 group-hover:scale-110 transition-transform duration-500">groups</span>
                    <h3 className="text-[0.7rem] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-2">Total Employees</h3>
                    <div className="flex items-end gap-3 mb-4">
                        <span className="font-headline font-extrabold text-5xl text-on-primary-fixed-variant tracking-tighter">{stats.totalEmployees.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary-container h-full w-[85%] rounded-full"></div>
                    </div>
                </div>

                {/* New Joinings */}
                <div className="bg-surface-container-lowest p-6 rounded-2xl relative overflow-hidden ring-1 ring-slate-200/50 shadow-sm group hover:shadow-md transition-all">
                    <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-[120px] text-primary/5 group-hover:scale-110 transition-transform duration-500">person_add</span>
                    <h3 className="text-[0.7rem] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-2">New Joinings</h3>
                    <div className="flex items-end gap-3 mb-4">
                        <span className="font-headline font-extrabold text-5xl text-[#1a4fa0] tracking-tighter">{stats.newJoinings}</span>
                        <span className="text-[0.68rem] text-on-surface-variant font-medium mb-1.5 tracking-wide">This Month</span>
                    </div>
                    <div className="flex gap-1 h-1.5 w-full">
                        <div className="bg-[#1a4fa0] w-1/4 rounded-full"></div>
                        <div className="bg-[#1a4fa0] w-1/4 rounded-full"></div>
                        <div className="bg-[#1a4fa0] w-1/4 rounded-full"></div>
                        <div className="bg-surface-container-high w-1/4 rounded-full"></div>
                    </div>
                </div>

                {/* Pending Transfers */}
                <div className="bg-surface-container-low p-6 rounded-2xl relative overflow-hidden shadow-sm group hover:shadow-md transition-all">
                    <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-[120px] text-slate-900/5 group-hover:scale-110 transition-transform duration-500">swap_horiz</span>
                    <h3 className="text-[0.7rem] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-2">Pending Transfers</h3>
                    <div className="flex items-end gap-3 mb-4">
                        <span className="font-headline font-extrabold text-5xl text-on-surface tracking-tighter">{stats.pendingTransfers}</span>
                        <span className="text-secondary font-medium text-[0.68rem] tracking-wide mb-1.5">Awaiting Approval</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-secondary w-[40%] h-full rounded-full"></div>
                    </div>
                </div>

                {/* Active Departments */}
                <div className="bg-surface-container-lowest p-6 rounded-2xl relative overflow-hidden shadow-sm group hover:shadow-md transition-all">
                    <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] text-primary/5 group-hover:scale-110 transition-transform duration-500">domain</span>
                    <h3 className="text-[0.7rem] font-label font-bold uppercase tracking-widest text-slate-500 mb-2">Active Departments</h3>
                    <div className="flex items-end gap-3 mb-4">
                        <span className="font-headline font-extrabold text-5xl text-slate-800 tracking-tighter">0{stats.activeDepts}</span>
                        <span className="text-slate-500 font-medium text-[0.68rem] tracking-wide mb-1.5">Across All Locations</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden relative z-10">
                        <div className="bg-[#1a4fa0] w-[100%] h-full rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* Left Col: Quick Actions */}
                <div className="space-y-4">
                    <h3 className="font-headline font-bold text-lg mb-4 text-on-surface">Quick Links</h3>
                    
                    {[
                        { title: 'Employee Directory', icon: 'groups', color: 'bg-primary-fixed text-[#1a4fa0]', path: '/employees' },
                        { title: 'Transfer Management', icon: 'swap_horiz', color: 'bg-secondary-fixed text-on-secondary-fixed-variant', path: '/transfers' },
                        { title: 'Retirement & Exits', icon: 'logout', color: 'bg-tertiary-fixed text-tertiary-container', path: '/exit' },
                    ].map(action => (
                        <button 
                            key={action.title}
                            onClick={() => navigate(action.path)}
                            className="w-full bg-surface-container-lowest p-4 rounded-xl flex items-center justify-between group hover:shadow-md hover:-translate-y-1 transition-all ring-1 ring-slate-200/50"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${action.color}`}>
                                    <span className="material-symbols-outlined text-2xl">{action.icon}</span>
                                </div>
                                <span className="font-headline font-bold text-sm text-slate-800">{action.title}</span>
                            </div>
                            <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors group-hover:translate-x-1">arrow_forward</span>
                        </button>
                    ))}

                    {/* Brand Card */}
                    <div className="mt-8 bg-primary-container rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-primary/20">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                        <h4 className="font-headline font-bold text-xl mb-2 relative z-10 tracking-tight uppercase font-headline">KDMPMACULTD</h4>
                        <p className="text-sm text-white/80 mb-6 font-medium relative z-10 leading-relaxed pr-8 uppercase">Unified management for the premier dairy portal.</p>
                        <button onClick={() => navigate('/settings')} className="bg-white text-[#1a4fa0] px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide hover:shadow-lg transition-all relative z-10">
                            System Settings
                        </button>
                    </div>
                </div>

                {/* Right Col: Recent Staff Additions */}
                <div className="xl:col-span-2 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-headline font-bold text-lg text-on-surface">Recent Staff Additions</h3>
                        <button onClick={() => navigate('/employees')} className="text-[0.68rem] font-bold text-primary tracking-widest uppercase hover:underline">View All Staff</button>
                    </div>

                    <div className="bg-surface-container-lowest rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden min-h-[300px]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-container-low border-b-2 border-primary/20">
                                        <th className="py-4 px-6 text-[0.6875rem] font-bold uppercase tracking-widest text-on-surface-variant font-label w-1/3">Employee Name</th>
                                        <th className="py-4 px-6 text-[0.6875rem] font-bold uppercase tracking-widest text-on-surface-variant font-label">Department</th>
                                        <th className="py-4 px-6 text-[0.6875rem] font-bold uppercase tracking-widest text-on-surface-variant font-label">Join Date</th>
                                        <th className="py-4 px-6 text-[0.6875rem] font-bold uppercase tracking-widest text-on-surface-variant font-label text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingRecent ? (
                                        <tr><td colSpan="4" className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Scanning Database...</td></tr>
                                    ) : recentEmployees.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="py-20 text-center">
                                                <div className="text-slate-400 font-bold uppercase tracking-widest text-xs italic mb-4">Your Employee Directory is Empty</div>
                                                <button 
                                                    onClick={() => navigate('/employees/new')}
                                                    className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider"
                                                >
                                                    Register First Employee
                                                </button>
                                            </td>
                                        </tr>
                                    ) : (
                                        recentEmployees.map((emp, index) => (
                                            <tr key={emp.emp_id} className={`border-b border-surface-container-high last:border-0 ${index % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-surface'}`}>
                                                <td className="py-5 px-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-500 font-bold text-xs shrink-0 uppercase">
                                                            {emp.full_name ? emp.full_name.split(' ').map(n=>n[0]).join('') : 'EM'}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-sm text-on-surface">{emp.full_name}</div>
                                                            <div className="text-[0.65rem] text-outline font-medium tracking-wide">ID: {emp.emp_id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-5 px-6 text-sm text-on-surface-variant">{emp.dept_name || 'Unassigned'}</td>
                                                <td className="py-5 px-6 text-sm text-on-surface-variant whitespace-nowrap">
                                                    {emp.date_of_joining ? new Date(emp.date_of_joining).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                                </td>
                                                <td className="py-5 px-6 text-right">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${emp.status === 'Active' ? 'bg-success-container/20 text-success' : 'bg-slate-200 text-slate-500'}`}>
                                                        {emp.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
