import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const TransferList = () => {
    const navigate = useNavigate();
    const { isAdmin, canManageEmployees } = useAuth();
    const [transfers, setTransfers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchTransfers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/transfers');
            if (res.data.success) setTransfers(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransfers();
    }, []);

    const handleApprove = async (id) => {
        if (!window.confirm("Approve this transfer request?")) return;
        setActionLoading(true);
        try {
            await api.put(`/transfers/${id}/approve`);
            fetchTransfers();
        } catch (err) {
            alert(err.response?.data?.message || "Approval failed");
        } finally {
            setActionLoading(false);
        }
    };

    const handleComplete = async (id) => {
        if (!window.confirm("Mark this transfer as completed? This will update the employee's official records.")) return;
        setActionLoading(true);
        try {
            await api.put(`/transfers/${id}/complete`);
            fetchTransfers();
        } catch (err) {
            alert(err.response?.data?.message || "Completion failed");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="w-full animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
               <div>
                <h2 className="font-headline font-bold text-3xl text-on-surface tracking-tight">Transfer Management</h2>
                <p className="text-on-surface-variant text-sm mt-1">Review pending transfer requests and initiate new transfers.</p>
               </div>
                <button 
                    onClick={() => navigate('/transfers/new')}
                    className="flex items-center gap-2 editorial-gradient text-white px-5 py-2.5 rounded-xl font-headline font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
                >
                    <span className="material-symbols-outlined text-[20px]">swap_horiz</span>
                    Initiate Transfer
                </button>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200">
                                <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-slate-500 font-label">Transfer Ref</th>
                                <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-slate-500 font-label">Employee</th>
                                <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-slate-500 font-label">Movement</th>
                                <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-slate-500 font-label text-center">Status</th>
                                <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-slate-500 font-label text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="py-10 text-center text-slate-400 font-bold">Fetching transfer records...</td></tr>
                            ) : transfers.length === 0 ? (
                                <tr><td colSpan="5" className="py-10 text-center text-slate-400 italic">No transfer records found.</td></tr>
                            ) : transfers.map((trf) => (
                                <tr key={trf.transfer_id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors group">
                                    <td className="py-4 px-6">
                                        <div className="font-black text-xs text-[#00387e] tracking-widest uppercase">TRF-{trf.transfer_id.toString().padStart(3, '0')}</div>
                                        <div className="text-[10px] text-slate-400 mt-1">{new Date(trf.request_date).toLocaleDateString('en-GB')}</div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="font-bold text-sm text-slate-800">{trf.full_name}</div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{trf.emp_id}</div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <span className="font-medium text-slate-400">{trf.from_location_name}</span>
                                            <span className="material-symbols-outlined text-[16px] text-primary transition-transform group-hover:translate-x-1">arrow_right_alt</span>
                                            <span className="font-black text-[#00387e]">{trf.to_location_name}</span>
                                        </div>
                                        <div className="text-[10px] font-black text-primary/60 mt-1 uppercase tracking-widest">Eff: {new Date(trf.effective_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                                            trf.status === 'Completed' ? 'bg-success-container/20 text-success' : 
                                            trf.status === 'Approved' ? 'bg-primary-fixed/20 text-primary' : 
                                            'bg-secondary-fixed/20 text-secondary'
                                        }`}>
                                            {trf.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        {trf.status === 'Pending Approval' && canManageEmployees() && (
                                            <button 
                                                disabled={actionLoading}
                                                onClick={() => handleApprove(trf.transfer_id)}
                                                className="text-[#00387e] text-[10px] font-black uppercase tracking-widest hover:bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/20 transition-all hover:-translate-y-0.5"
                                            >
                                                Approve
                                            </button>
                                        )}
                                        {trf.status === 'Approved' && isAdmin() && (
                                            <button 
                                                disabled={actionLoading}
                                                onClick={() => handleComplete(trf.transfer_id)}
                                                className="text-success text-[10px] font-black uppercase tracking-widest hover:bg-success/5 px-3 py-1.5 rounded-lg border border-success/20 transition-all hover:-translate-y-0.5"
                                            >
                                                Finalize
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TransferList;
