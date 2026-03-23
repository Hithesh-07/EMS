import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Dashboard = () => {
    const navigate = useNavigate();
    
    const [stats, setStats] = useState({
        totalEmployees: 0,
        newJoinings: 0,
        pendingTransfers: 0,
        activeDepts: 0
    });

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                // Fetch connected backend data
                const response = await api.get('/dashboard');
                if (response.data.success) {
                    setStats({
                        totalEmployees: response.data.data.totalStaff || 0,
                        newJoinings: response.data.data.newJoinees || 0,
                        pendingTransfers: response.data.data.pendingTransfers || 0,
                        activeDepts: response.data.data.activeDepts || 0
                    });
                }
            } catch (error) {
                console.error("Dashboard stats fetch failed:", error);
            }
        };

        fetchDashboardStats();
    }, []);

    const recentActivities = [
        { id: 1, name: 'Rajesh Kumar', designation: 'Senior Editor', date: '24 May 2024', status: 'PENDING CLEARANCE' },
        { id: 2, name: 'Sunita Mishra', designation: 'Managing Director', date: '28 May 2024', status: 'IN PROGRESS' },
        { id: 3, name: 'Amit Verma', designation: 'Staff Reporter', date: '15 June 2024', status: 'NOT STARTED' }
    ];

    const getStatusBadge = (status) => {
        switch(status) {
            case 'PENDING CLEARANCE': return <span className="bg-error-container text-on-error-container px-3 py-1 rounded-full text-[10px] font-bold tracking-wider">PENDING CLEARANCE</span>;
            case 'IN PROGRESS': return <span className="bg-secondary-fixed text-on-secondary-fixed-variant px-3 py-1 rounded-full text-[10px] font-bold tracking-wider">IN PROGRESS</span>;
            case 'NOT STARTED': return <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-3 py-1 rounded-full text-[10px] font-bold tracking-wider">NOT STARTED</span>;
            default: return null;
        }
    };

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
                        <span className="bg-tertiary-fixed text-tertiary-container text-xs font-bold px-2 py-0.5 rounded-md mb-1">+2%</span>
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
                    <h3 className="font-headline font-bold text-lg mb-4 text-on-surface">Quick Actions</h3>
                    
                    {[
                        { title: 'Initiate Transfer', icon: 'swap_horiz', color: 'bg-primary-fixed text-[#1a4fa0]', path: '/transfers/new' },
                        { title: 'Generate Report', icon: 'assessment', color: 'bg-tertiary-fixed text-tertiary-container', path: '/reports' },
                        { title: 'Manage Documents', icon: 'description', color: 'bg-secondary-fixed text-on-secondary-fixed-variant', path: '/documents' },
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
                        <h4 className="font-headline font-bold text-xl mb-2 relative z-10 tracking-tight uppercase">KDMPMACULTD</h4>
                        <p className="text-sm text-white/80 mb-6 font-medium relative z-10 leading-relaxed pr-8 uppercase">Unified management for the premier dairy portal.</p>
                        <button className="bg-white text-[#1a4fa0] px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide hover:shadow-lg transition-all relative z-10">
                            Help Documentation
                        </button>
                    </div>
                </div>

                {/* Right Col: Recent Activity */}
                <div className="xl:col-span-2 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-headline font-bold text-lg text-on-surface">Upcoming Retirements Details</h3>
                        <button onClick={() => navigate('/exit')} className="text-[0.68rem] font-bold text-primary tracking-widest uppercase hover:underline">See All</button>
                    </div>

                    <div className="bg-surface-container-lowest rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-container-low border-b-2 border-primary/20">
                                        <th className="py-4 px-6 text-[0.6875rem] font-bold uppercase tracking-widest text-on-surface-variant font-label w-1/3">Employee Name</th>
                                        <th className="py-4 px-6 text-[0.6875rem] font-bold uppercase tracking-widest text-on-surface-variant font-label">Designation</th>
                                        <th className="py-4 px-6 text-[0.6875rem] font-bold uppercase tracking-widest text-on-surface-variant font-label">Effective Date</th>
                                        <th className="py-4 px-6 text-[0.6875rem] font-bold uppercase tracking-widest text-on-surface-variant font-label text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentActivities.map((act, index) => (
                                        <tr key={act.id} className={`border-b border-surface-container-high last:border-0 ${index % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-surface'}`}>
                                            <td className="py-5 px-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-500 font-bold text-xs shrink-0">
                                                        {act.name.split(' ').map(n=>n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm text-on-surface">{act.name}</div>
                                                        <div className="text-[0.65rem] text-outline font-medium tracking-wide">ID: EA-209{act.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6 text-sm text-on-surface-variant">{act.designation}</td>
                                            <td className="py-5 px-6 text-sm text-on-surface-variant whitespace-nowrap">{act.date}</td>
                                            <td className="py-5 px-6 text-right">
                                                {getStatusBadge(act.status)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* System Updates Timeline (Bonus from design) */}
                    <div className="bg-surface-container-lowest rounded-2xl p-6 mt-6 ring-1 ring-slate-100 shadow-sm relative">
                        <button className="absolute -right-4 top-6 bg-[#00387e] text-white w-10 h-10 rounded-xl shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
                             <span className="material-symbols-outlined leading-none">add</span>
                        </button>
                        <h3 className="font-headline font-bold text-lg mb-6 text-on-surface">Recent System Updates</h3>
                        <div className="border-l-2 border-slate-100 pl-4 space-y-6">
                            <div className="relative">
                                <span className="absolute -left-[26px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-white"></span>
                                <div className="text-[0.65rem] font-bold uppercase tracking-wider text-[#1a4fa0] mb-1">Today, 09:30 AM</div>
                                <div className="font-bold text-sm text-on-surface">Annual Report Generation Completed</div>
                                <div className="text-xs text-on-surface-variant mt-1 leading-relaxed">System successfully generated 1,250 individual tax statements for the fiscal year 2023-24.</div>
                            </div>
                            <div className="relative">
                                <span className="absolute -left-[26px] top-1 w-3 h-3 rounded-full bg-slate-300 ring-4 ring-white"></span>
                                <div className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-500 mb-1">Yesterday, 04:15 PM</div>
                                <div className="font-bold text-sm text-on-surface">New Employee Onboarding: Vikram Shah</div>
                                <div className="text-xs text-on-surface-variant mt-1 leading-relaxed">Documents verified and payroll integration finalized for Mumbai branch.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
