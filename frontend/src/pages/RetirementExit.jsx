import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const RetirementExit = () => {
    const { isAdmin, user } = useAuth();
    const [activeTab, setActiveTab] = useState('Upcoming Retirements');
    const [upcoming, setUpcoming] = useState([]);
    const [exits, setExits] = useState([]);
    const [selectedEmp, setSelectedEmp] = useState(null);
    const [checklist, setChecklist] = useState([]);
    const [fnf, setFnF] = useState(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'Upcoming Retirements') fetchUpcoming();
        if (activeTab === 'Exit & Clearances' || activeTab === 'FnF Settlements') fetchExits();
    }, [activeTab]);

    const fetchExits = async () => {
        setLoading(true);
        try {
            const res = await api.get('/exit');
            if (res.data.success) {
                setExits(res.data.data);
                if (res.data.data.length > 0 && !selectedEmp) {
                    handleSelectEmp(res.data.data[0]);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectEmp = (emp) => {
        setSelectedEmp(emp);
        fetchChecklist(emp.emp_id);
        fetchFnF(emp.emp_id);
    };

    const fetchUpcoming = async () => {
        setLoading(true);
        try {
            const res = await api.get('/exit/upcoming');
            if (res.data.success) setUpcoming(res.data.data);
        } catch (err) {
            console.error("Fetch upcoming error", err);
        } finally {
            setLoading(false);
        }
    };

    const handleInitiate = async (empId, type) => {
        if (!window.confirm(`Initiate ${type} workflow for ${empId}?`)) return;
        setActionLoading(true);
        try {
            const res = await api.post(`/exit/initiate/${empId}`, { 
                retirement_type: type,
                last_working_date: new Date().toISOString().split('T')[0] 
            });
            if (res.data.success) {
                alert("Workflow Initiated!");
                fetchUpcoming();
                fetchExits();
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to initiate");
        } finally {
            setActionLoading(false);
        }
    };

    const fetchChecklist = async (empId) => {
        try {
            const res = await api.get(`/exit/${empId}/checklist`);
            if (res.data.success) setChecklist(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchFnF = async (empId) => {
        try {
            const res = await api.get(`/exit/${empId}/fnf`);
            if (res.data.success) setFnF(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleChecklist = async (chkId, currentStatus) => {
        const newStatus = currentStatus === 'Done' ? 'Pending' : 'Done';
        try {
            const res = await api.put(`/exit/${selectedEmp.emp_id}/checklist/${chkId}`, { status: newStatus });
            if (res.data.success) fetchChecklist(selectedEmp.emp_id);
        } catch (err) {
            alert("Update failed");
        }
    };

    const handleCalculateFnF = async () => {
        setActionLoading(true);
        try {
            const res = await api.post(`/exit/${selectedEmp.emp_id}/fnf`, { payment_mode: 'NEFT', payment_date: new Date().toISOString().split('T')[0] });
            if (res.data.success) {
                alert("FnF Calculated!");
                fetchFnF(selectedEmp.emp_id);
            }
        } catch (err) {
            alert("Calculation failed");
        } finally {
            setActionLoading(false);
        }
    };

    const handleApproveFnF = async () => {
        if (!window.confirm("Approve and Disburse? This will finalize the exit.")) return;
        setActionLoading(true);
        try {
            const res = await api.put(`/exit/${selectedEmp.emp_id}/fnf/approve`);
            if (res.data.success) {
                alert("FnF Approved & Disbursed!");
                fetchExits();
            }
        } catch (err) {
            alert(err.response?.data?.message || "Approval failed");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="w-full animate-in fade-in duration-500">
            <div className="mb-8">
                <h2 className="font-headline font-bold text-3xl text-on-surface tracking-tight">Retirement & Exit Management</h2>
                <p className="text-on-surface-variant text-sm mt-1">Manage superannuation alerts, clearances, and Full & Final (FnF) settlements.</p>
            </div>

            <div className="bg-surface-container-lowest rounded-3xl shadow-sm ring-1 ring-slate-200/50 overflow-hidden mb-12">
                <div className="flex overflow-x-auto border-b border-surface-container custom-scrollbar hide-scroll-mobile">
                    {['Upcoming Retirements', 'Exit & Clearances', 'FnF Settlements'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-8 py-4 border-b-2 whitespace-nowrap transition-colors font-headline font-bold text-sm ${activeTab === tab ? 'border-[#1a4fa0] text-[#1a4fa0] bg-primary/5' : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="p-8">
                    {/* Upcoming Retirements Tab */}
                    {activeTab === 'Upcoming Retirements' && (
                        <div className="animate-in fade-in">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-headline font-bold text-lg text-slate-800">Alerts (Next 6 Months)</h3>
                                <button className="bg-slate-100 text-slate-600 hover:bg-[#1a4fa0] hover:text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm">
                                    Export Excel
                                </button>
                            </div>

                            <div className="overflow-x-auto ring-1 ring-slate-200 rounded-xl">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50">
                                            <th className="py-4 px-6 text-xs font-bold uppercase text-slate-500">Employee</th>
                                            <th className="py-4 px-6 text-xs font-bold uppercase text-slate-500">Department</th>
                                            <th className="py-4 px-6 text-xs font-bold uppercase text-slate-500">Date of Birth</th>
                                            <th className="py-4 px-6 text-xs font-bold uppercase text-error text-right">Retirement Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan="4" className="py-10 text-center font-bold text-slate-400">Scanning database...</td></tr>
                                        ) : upcoming.length === 0 ? (
                                            <tr><td colSpan="4" className="py-10 text-center text-slate-400 italic">No retirements due for this period.</td></tr>
                                        ) : upcoming.map((emp) => (
                                            <tr key={emp.emp_id} className="border-t border-slate-100 hover:bg-slate-50/50">
                                                <td className="py-4 px-6">
                                                    <div className="font-bold text-sm text-slate-800">{emp.full_name}</div>
                                                    <div className="text-xs text-slate-500">{emp.emp_id}</div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="text-sm font-medium text-slate-700">{emp.desig_name}</div>
                                                    <div className="text-xs text-slate-500">{emp.dept_name}</div>
                                                </td>
                                                <td className="py-4 px-6 text-sm text-slate-600 font-medium">
                                                    {new Date(emp.date_of_birth).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <span className="text-error font-bold bg-error-container/30 px-3 py-1 rounded">
                                                        {new Date(emp.retirement_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                    <button 
                                                        disabled={actionLoading}
                                                        onClick={() => handleInitiate(emp.emp_id, 'Superannuation')}
                                                        className="block ml-auto mt-2 text-xs font-bold text-[#1a4fa0] hover:underline disabled:opacity-50"
                                                    >
                                                        Initiate Exit Workflow
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Exit & Clearances Tab */}
                    {activeTab === 'Exit & Clearances' && (
                        <div className="animate-in fade-in grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <h3 className="font-headline font-bold text-lg text-slate-800 mb-6">Active Exits</h3>
                                <div className="space-y-4">
                                    {exits.length === 0 ? (
                                        <div className="text-slate-400 italic py-4">No active exit processes.</div>
                                    ) : exits.map(exit => (
                                        <div 
                                            key={exit.exit_id} 
                                            onClick={() => handleSelectEmp(exit)}
                                            className={`border rounded-xl p-4 flex justify-between items-center cursor-pointer transition-all ${selectedEmp?.emp_id === exit.emp_id ? 'border-[#1a4fa0] bg-primary/5 shadow-md' : 'border-slate-200 hover:border-[#1a4fa0] hover:shadow-sm'}`}
                                        >
                                            <div>
                                                <div className="font-bold text-slate-800">{exit.full_name}</div>
                                                <div className="text-xs text-slate-500">{exit.emp_id} • {exit.retirement_type}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-primary tracking-tight">{exit.status}</div>
                                                <div className="text-xs text-slate-500 italic">Effective: {new Date(exit.last_working_date).toLocaleDateString('en-GB')}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selectedEmp && (
                                <div className="bg-slate-50 rounded-2xl p-6 ring-1 ring-slate-200">
                                    <h3 className="font-headline font-bold text-lg text-slate-800 mb-2">Checklist: {selectedEmp.full_name}</h3>
                                    <p className="text-xs text-slate-500 mb-6 border-b border-slate-200 pb-4">
                                        Completed: {checklist.filter(c => c.status === 'Done').length}/{checklist.length} 
                                        ({checklist.length > 0 ? Math.round((checklist.filter(c => c.status === 'Done').length / checklist.length) * 100) : 0}%)
                                    </p>

                                    <div className="space-y-3">
                                        {checklist.map((chk) => (
                                            <div key={chk.checklist_id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
                                                <span className="text-sm font-medium text-slate-700">{chk.item_name}</span>
                                                {chk.status === 'Done' ? (
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-success text-[10px] font-black uppercase tracking-widest flex items-center gap-1 bg-success-container/20 px-2 py-1 rounded">
                                                            <span className="material-symbols-outlined text-[14px] fill-icon">check_circle</span> Verified
                                                        </span>
                                                        <span className="text-[9px] text-slate-400 mt-0.5">{chk.completed_by}</span>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleToggleChecklist(chk.checklist_id, 'Pending')}
                                                        className="text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-[#1a4fa0] hover:bg-primary-fixed/30 px-3 py-1.5 rounded border border-slate-200 transition-all"
                                                    >
                                                        Mark Done
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <button 
                                        disabled={checklist.some(c => c.status !== 'Done')}
                                        className="mt-6 w-full editorial-gradient text-white px-4 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        Ready for FnF Calculation
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* FnF Settlements */}
                    {activeTab === 'FnF Settlements' && (
                        <div className="animate-in fade-in flex flex-col lg:flex-row gap-8">
                           <div className="w-full lg:w-1/3">
                               <h3 className="font-headline font-bold text-lg text-slate-800 mb-6 font-headline">Approved Clearances</h3>
                               <div className="space-y-4">
                                   {exits.filter(e => e.status === 'Initiated' || e.status === 'Checklist Pending' || e.status === 'FnF Approved').map(exit => (
                                       <div 
                                           key={exit.exit_id} 
                                           onClick={() => handleSelectEmp(exit)}
                                           className={`border rounded-xl p-4 flex justify-between items-center cursor-pointer transition-all ${selectedEmp?.emp_id === exit.emp_id ? 'border-[#1a4fa0] bg-primary/5 shadow-md' : 'border-slate-200 hover:border-[#1a4fa0]'}`}
                                       >
                                           <div>
                                               <div className="font-bold text-sm text-slate-800">{exit.full_name}</div>
                                               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{exit.emp_id}</div>
                                           </div>
                                           <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                                       </div>
                                   ))}
                               </div>
                           </div>

                           {selectedEmp && (
                            <div className="flex-1 bg-white rounded-2xl p-8 border border-slate-200 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-success to-primary left-0"></div>
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h3 className="font-headline font-black text-3xl text-slate-800 tracking-tight">Final Settlement</h3>
                                        <p className="text-slate-500 font-medium text-sm mt-1">{selectedEmp.full_name} ({selectedEmp.emp_id})</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Calculation Status</div>
                                        <div className={`text-sm font-bold ${fnf ? 'text-primary' : 'text-error'}`}>{fnf ? fnf.status : 'Not Calculated'}</div>
                                    </div>
                                </div>

                                {fnf ? (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 mb-8">
                                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                                <span className="text-xs text-slate-500 font-black uppercase tracking-widest">Gratuity</span>
                                                <span className="text-sm font-bold text-success">+ ₹ {parseFloat(fnf.gratuity_amount).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                                <span className="text-xs text-slate-500 font-black uppercase tracking-widest">Leave Pay</span>
                                                <span className="text-sm font-bold text-success">+ ₹ {parseFloat(fnf.leave_encashment).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                                <span className="text-xs text-slate-500 font-black uppercase tracking-widest">PF Settlement</span>
                                                <span className="text-sm font-bold text-success">+ ₹ {parseFloat(fnf.pf_settlement).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                                <span className="text-xs text-slate-500 font-black uppercase tracking-widest">Loan Recovery</span>
                                                <span className="text-sm font-bold text-error">- ₹ {parseFloat(fnf.loan_recovery).toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 p-6 rounded-[2rem] flex justify-between items-center border border-slate-100 mb-8">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Net Payable</div>
                                            <div className="text-3xl font-black text-[#00387e] tracking-tight">₹ {parseFloat(fnf.net_payable).toLocaleString()}</div>
                                        </div>

                                        <div className="flex gap-4">
                                            <button 
                                                onClick={handleCalculateFnF}
                                                disabled={actionLoading}
                                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                                            >
                                                Recalculate
                                            </button>
                                            <button 
                                                onClick={handleApproveFnF}
                                                disabled={actionLoading || fnf.status === 'Approved'}
                                                className="flex-1 editorial-gradient text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all disabled:opacity-50"
                                            >
                                                {fnf.status === 'Approved' ? 'Disbursed' : 'Approve & Disburse'}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-300">
                                        <div className="mb-4">
                                            <span className="material-symbols-outlined text-4xl text-slate-300">calculate</span>
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium mb-6">No settlement record found for this employee.</p>
                                        <button 
                                            onClick={handleCalculateFnF}
                                            disabled={actionLoading}
                                            className="editorial-gradient text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
                                        >
                                            Generate FnF Statement
                                        </button>
                                    </div>
                                )}
                            </div>
                           )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RetirementExit;
