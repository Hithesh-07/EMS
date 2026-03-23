import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const EmployeeList = () => {
    const navigate = useNavigate();
    const { isAdmin, canManageEmployees } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDept, setFilterDept] = useState('');
    const [filterStatus, setFilterStatus] = useState('Active');
    
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, limit: 10 });
    const [deleteTarget, setDeleteTarget] = useState(null); // { emp_id, full_name }
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    useEffect(() => {
        const fetchEmployees = async () => {
            setLoading(true);
            try {
                // In a real app we would use Department IDs, but we mocked names in the UI. 
                // We'll adjust the backend later or assume it handles names correctly.
                let deptId = '';
                if (filterDept === 'HR') deptId = 1;
                else if (filterDept === 'IT') deptId = 2;
                else if (filterDept === 'FIN') deptId = 3;

                const res = await api.get('/employees', {
                    params: {
                        page: page,
                        limit: pagination.limit,
                        search: searchTerm,
                        status: filterStatus,
                        dept: deptId || undefined
                    }
                });
                
                if (res.data.success) {
                    setEmployees(res.data.data);
                    setPagination(res.data.pagination);
                }
            } catch (err) {
                console.error("Failed to fetch employees", err);
            } finally {
                setLoading(false);
            }
        };

        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchEmployees();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, filterDept, filterStatus, page]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true); setDeleteError('');
        try {
            await api.delete(`/employees/${deleteTarget.emp_id}`);
            setEmployees(prev => prev.filter(e => e.emp_id !== deleteTarget.emp_id));
            setDeleteTarget(null);
        } catch (err) {
            setDeleteError(err.response?.data?.message || 'Failed to delete employee.');
        } finally {
            setDeleting(false);
        }
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'Active': return <span className="bg-success-container/30 text-success px-3 py-1 rounded-full text-xs font-bold tracking-wider">Active</span>;
            case 'On Leave': return <span className="bg-secondary-fixed text-on-secondary-fixed-variant px-3 py-1 rounded-full text-xs font-bold tracking-wider">On Leave</span>;
            case 'Retiring Soon': return <span className="bg-error-container text-on-error-container px-3 py-1 rounded-full text-xs font-bold tracking-wider">Retiring Soon</span>;
            case 'Exited': return <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-bold tracking-wider">Exited</span>;
            default: return null;
        }
    };

    return (
        <>
        <div className="w-full animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
               <div>
                <h2 className="font-headline font-bold text-3xl text-on-surface tracking-tight">Employee Directory</h2>
                <p className="text-on-surface-variant text-sm mt-1">Manage and view all registered staff members across departments.</p>
               </div>
                {canManageEmployees() && (
                    <button 
                        onClick={() => navigate('/employees/new')}
                        className="flex items-center gap-2 editorial-gradient text-white px-5 py-2.5 rounded-xl font-headline font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
                    >
                        <span className="material-symbols-outlined text-[20px]">person_add</span>
                        Register New
                    </button>
                )}
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm ring-1 ring-slate-200/50 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex-1 w-full relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input 
                        type="text" 
                        placeholder="Search by name, ID, or email..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-700"
                    />
                </div>
                
                <div className="flex gap-4 w-full md:w-auto">
                    <select 
                        value={filterDept} 
                        onChange={(e) => setFilterDept(e.target.value)}
                        className="flex-1 md:w-48 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-700 font-medium"
                    >
                        <option value="">All Departments</option>
                        <option value="HR">Human Resources</option>
                        <option value="IT">Information Technology</option>
                        <option value="FIN">Finance</option>
                    </select>

                    <select 
                        value={filterStatus} 
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="flex-1 md:w-40 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-700 font-medium"
                    >
                        <option value="">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Retiring Soon">Retiring Soon</option>
                        <option value="Exited">Exited</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200">
                                <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-slate-500 font-label">Employee Info</th>
                                <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-slate-500 font-label">Department / Desig.</th>
                                <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-slate-500 font-label">Location</th>
                                <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-slate-500 font-label text-center">Status</th>
                                <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-slate-500 font-label text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-8 text-center text-slate-500">
                                        <span className="material-symbols-outlined animate-spin text-3xl mb-2">progress_activity</span>
                                        <div>Loading employees...</div>
                                    </td>
                                </tr>
                            ) : employees.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-8 text-center text-slate-500">
                                        <div className="text-sm font-bold">No employees found matching the filters.</div>
                                    </td>
                                </tr>
                            ) : (
                                employees.map((emp, index) => (
                                    <tr key={emp.emp_id} className={`border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 uppercase">
                                                    {emp.photo_url ? (
                                                        <img 
                                                            src={emp.photo_url.startsWith('http') ? emp.photo_url : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${emp.photo_url}`} 
                                                            alt={emp.full_name} 
                                                            className="w-full h-full object-cover" 
                                                        />
                                                    ) : (
                                                        <span className="text-slate-400 text-xs font-bold">
                                                            {emp.full_name ? emp.full_name.split(' ').map(n=>n[0]).join('').substring(0, 2) : 'EM'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm text-slate-800">{emp.full_name}</div>
                                                    <div className="text-[0.7rem] text-slate-500 font-medium tracking-wide">ID: {emp.emp_id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-sm font-medium text-slate-700">{emp.desig_name || 'Designation'}</div>
                                            <div className="text-xs text-slate-500">{emp.dept_name || 'Department'}</div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-600">{emp.loc_name || 'Location'}</td>
                                        <td className="py-4 px-6 text-center">
                                            {getStatusBadge(emp.status)}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button 
                                                    onClick={() => navigate(`/employees/profile?id=${emp.emp_id}`)} 
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-[#1a4fa0] hover:text-white transition-colors"
                                                    title="View Profile"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                </button>
                                                {isAdmin() && (
                                                    <button
                                                        onClick={() => { setDeleteTarget({ emp_id: emp.emp_id, full_name: emp.full_name }); setDeleteError(''); }}
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                                                        title="Remove Employee"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-600 bg-slate-50/50">
                    <div>Showing <span className="font-bold">{employees.length === 0 ? 0 : (page - 1) * pagination.limit + 1}</span> to <span className="font-bold">{Math.min(page * pagination.limit, pagination.total)}</span> of <span className="font-bold">{pagination.total}</span> entries</div>
                    
                    <div className="flex gap-1">
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="w-8 h-8 rounded flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-50 transition-colors"
                        >
                             <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                        </button>
                        
                        <button className="w-8 h-8 rounded flex items-center justify-center bg-[#1a4fa0] text-white font-bold">{page}</button>
                        
                        <button 
                            disabled={page * pagination.limit >= pagination.total}
                            onClick={() => setPage(page + 1)}
                            className="w-8 h-8 rounded flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-50 transition-colors"
                        >
                             <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="bg-red-50 px-6 py-5 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="material-symbols-outlined text-red-500 text-2xl">warning</span>
                        </div>
                        <div>
                            <h3 className="font-headline font-black text-red-700 text-lg">Remove Employee</h3>
                            <p className="text-sm text-red-600 mt-1">This action will mark the employee as deleted and cannot be undone from the UI.</p>
                        </div>
                    </div>
                    <div className="px-6 py-5">
                        <p className="text-sm text-slate-700">
                            Are you sure you want to remove <span className="font-black text-slate-900">{deleteTarget.full_name}</span>?
                            <br />
                            <span className="text-xs text-slate-500 font-mono mt-1 block">{deleteTarget.emp_id}</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-3 bg-slate-50 rounded-lg p-3 border border-slate-200">
                            ℹ️ The record is preserved in the database (soft delete) and an audit log entry is written automatically.
                        </p>
                        {deleteError && (
                            <div className="mt-3 text-sm text-red-600 font-medium bg-red-50 p-3 rounded-lg border border-red-100">{deleteError}</div>
                        )}
                    </div>
                    <div className="px-6 pb-5 flex items-center justify-end gap-3">
                        <button
                            onClick={() => setDeleteTarget(null)}
                            className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors disabled:opacity-60 shadow-md"
                        >
                            <span className="material-symbols-outlined text-[18px]">{deleting ? 'progress_activity' : 'delete'}</span>
                            {deleting ? 'Removing...' : 'Confirm Delete'}
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default EmployeeList;
