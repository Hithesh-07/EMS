import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const TransferForm = () => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [depts, setDepts] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [locations, setLocations] = useState([]);
    
    const [formData, setFormData] = useState({
        emp_id: '',
        effective_date: '',
        transfer_order_no: '',
        to_dept_id: '',
        to_desig_id: '',
        to_loc_id: '',
        remarks: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [empRes, deptRes, desigRes, locRes] = await Promise.all([
                    api.get('/employees'),
                    api.get('/admin/departments'),
                    api.get('/admin/designations'),
                    api.get('/admin/locations')
                ]);
                setEmployees(empRes.data.data);
                setDepts(deptRes.data.data);
                setDesignations(desigRes.data.data);
                setLocations(locRes.data.data);
            } catch (err) {
                console.error("Load metadata error", err);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await api.post('/transfers', formData);
            if (res.data.success) {
                alert("Transfer request submitted for approval!");
                navigate('/transfers');
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to initiate transfer");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full animate-in fade-in max-w-4xl mx-auto">
            <div className="mb-8">
                <h2 className="font-headline font-bold text-3xl text-on-surface tracking-tight">Initiate Employee Transfer</h2>
                <p className="text-on-surface-variant text-sm mt-1">Submit a transfer, promotion, or relocation request for an active employee.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
                <div className="p-8 space-y-8">
                    
                    {/* Employee Selection */}
                    <div>
                        <h3 className="font-headline font-bold text-lg text-slate-800 border-b pb-2 mb-6">Select Employee</h3>
                        <div className="space-y-1.5 md:w-1/2">
                            <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Employee Search <span className="text-error">*</span></label>
                            <select 
                                name="emp_id"
                                value={formData.emp_id}
                                onChange={handleChange}
                                required
                                className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            >
                                <option value="">Select Employee...</option>
                                {employees.map(emp => (
                                    <option key={emp.emp_id} value={emp.emp_id}>{emp.full_name} ({emp.emp_id})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* New Post Details */}
                    <div>
                        <h3 className="font-headline font-bold text-lg text-slate-800 border-b pb-2 mb-6">New Placement Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Effective Transfer Date <span className="text-error">*</span></label>
                                <input 
                                    type="date" 
                                    name="effective_date"
                                    value={formData.effective_date}
                                    onChange={handleChange}
                                    required 
                                    className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Transfer Order Number</label>
                                <input 
                                    type="text" 
                                    name="transfer_order_no"
                                    value={formData.transfer_order_no}
                                    onChange={handleChange}
                                    placeholder="e.g. TR-2024-089" 
                                    className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Target Department <span className="text-error">*</span></label>
                                <select 
                                    name="to_dept_id"
                                    value={formData.to_dept_id}
                                    onChange={handleChange}
                                    required 
                                    className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                >
                                    <option value="">Select Department</option>
                                    {depts.map(d => <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Target Designation <span className="text-error">*</span></label>
                                <select 
                                    name="to_desig_id"
                                    value={formData.to_desig_id}
                                    onChange={handleChange}
                                    required 
                                    className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                >
                                    <option value="">Select Designation</option>
                                    {designations.map(d => <option key={d.desig_id} value={d.desig_id}>{d.desig_name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Target Location <span className="text-error">*</span></label>
                                <select 
                                    name="to_loc_id"
                                    value={formData.to_loc_id}
                                    onChange={handleChange}
                                    required 
                                    className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                >
                                    <option value="">Select Location</option>
                                    {locations.map(l => <option key={l.loc_id} value={l.loc_id}>{l.loc_name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="mt-6 space-y-1.5">
                            <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Reason / Remarks <span className="text-error">*</span></label>
                            <textarea 
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleChange}
                                required 
                                rows="3" 
                                placeholder="Provide justification for the transfer or promotion..." 
                                className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                            ></textarea>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50/80 p-6 border-t border-slate-200 flex items-center justify-end gap-4">
                    <button type="button" onClick={() => navigate('/transfers')} className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-200 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={submitting} className="editorial-gradient text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-wait">
                        {submitting ? 'Submitting...' : 'Initiate Transfer'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TransferForm;
