import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

const EmployeeEdit = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const empId = searchParams.get('id');
    
    const [activeTab, setActiveTab] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // Lookups state mapping
    const [departments, setDepartments] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [locations, setLocations] = useState([]);

    const [formData, setFormData] = useState({
        full_name: '', date_of_birth: '', gender: '', blood_group: '', 
        aadhaar_number: '', pan_number: '', mobile: '', email: '', 
        permanent_address: '', current_address: '', same_address: false,
        dept_id: '', desig_id: '', loc_id: '', date_of_joining: '', employment_type: 'Full-time',
        basic_pay: '', hra: '', da: '', other_allowances: '', bank_account_number: '', ifsc_code: '', pf_applicable: false, esi_applicable: false,
        nominees: [{ nominee_name: '', relationship: '', contact_number: '', address: '' }],
        photo_file: null,
        photo_url: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [deptRes, desigRes, locRes, empRes] = await Promise.all([
                    api.get('/departments'),
                    api.get('/designations'),
                    api.get('/locations'),
                    api.get(`/employees/${empId}`)
                ]);
                
                if (deptRes.data.success) setDepartments(deptRes.data.data);
                if (desigRes.data.success) setDesignations(desigRes.data.data);
                if (locRes.data.success) setLocations(locRes.data.data);
                
                if (empRes.data.success) {
                    const emp = empRes.data.data;
                    setFormData({
                        ...emp,
                        date_of_birth: emp.date_of_birth ? emp.date_of_birth.split('T')[0] : '',
                        date_of_joining: emp.date_of_joining ? emp.date_of_joining.split('T')[0] : '',
                        nominees: emp.nominees || [{ nominee_name: '', relationship: '', contact_number: '', address: '' }],
                        photo_url: emp.photo_url || '',
                        photo_file: null
                    });
                }
            } catch (err) {
                console.error("Failed to fetch data", err);
            } finally {
                setLoading(false);
            }
        };
        if (empId) fetchData();
    }, [empId]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                photo_file: file,
                photo_url: URL.createObjectURL(file)
            }));
        }
    };

    const handleNomineeChange = (index, e) => {
        const { name, value } = e.target;
        const newNominees = [...formData.nominees];
        newNominees[index][name] = value;
        setFormData(prev => ({ ...prev, nominees: newNominees }));
    };

    const addNominee = () => {
        setFormData(prev => ({
            ...prev,
            nominees: [...prev.nominees, { nominee_name: '', relationship: '', contact_number: '', address: '' }]
        }));
    };

    const removeNominee = (index) => {
        const newNominees = [...formData.nominees];
        newNominees.splice(index, 1);
        setFormData(prev => ({ ...prev, nominees: newNominees }));
    };

    const handleNext = () => setActiveTab(prev => Math.min(prev + 1, 4));
    const handlePrev = () => setActiveTab(prev => Math.max(prev - 1, 1));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const data = new FormData();
            if (formData.photo_file) {
                data.append('photo', formData.photo_file);
            }

            const payload = { ...formData };
            delete payload.photo_file;
            delete payload.photo_url;
            delete payload.nominees;
            
            Object.keys(payload).forEach(key => {
                data.append(key, payload[key]);
            });
            data.append('nominees', JSON.stringify(formData.nominees));

            const res = await api.put(`/employees/${empId}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                navigate(`/employees/profile?id=${empId}`);
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to update employee');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading details...</div>;

    const tabs = [
        { id: 1, name: 'Personal Information', icon: 'person' },
        { id: 2, name: 'Employment Details', icon: 'work' },
        { id: 3, name: 'Salary & Compliance', icon: 'account_balance' },
        { id: 4, name: 'Nominee Information', icon: 'family_restroom' }
    ];

    return (
        <div className="w-full animate-in fade-in duration-500">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="font-headline font-bold text-3xl text-on-surface tracking-tight">Edit Employee Details</h2>
                    <p className="text-on-surface-variant text-sm mt-1">Update record for {formData.full_name} (ID: {empId})</p>
                </div>
                <button onClick={() => navigate(-1)} className="text-slate-500 font-bold text-sm flex items-center gap-2 hover:text-[#1a4fa0]">
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Cancel & Go Back
                </button>
            </div>

            <div className="bg-surface-container-lowest rounded-3xl shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
                <div className="flex overflow-x-auto border-b border-surface-container">
                    {tabs.map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-6 py-4 border-b-2 whitespace-nowrap transition-colors ${activeTab === tab.id ? 'border-[#1a4fa0] text-[#1a4fa0] bg-primary/5' : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                        >
                            <span className={`material-symbols-outlined text-[18px] ${activeTab === tab.id ? 'text-[#1a4fa0]' : ''}`}>{tab.icon}</span>
                            <span className={`font-headline font-bold text-sm ${activeTab === tab.id ? 'text-[#1a4fa0]' : ''}`}>{tab.name}</span>
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    {activeTab === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Full Name <span className="text-error">*</span></label>
                                    <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} required className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Date of Birth <span className="text-error">*</span></label>
                                    <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} required className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Mobile <span className="text-error">*</span></label>
                                    <input type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange} required className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                                </div>
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Professional Photo</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-200">
                                        {formData.photo_url ? (
                                            <img src={formData.photo_url.startsWith('blob') ? formData.photo_url : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${formData.photo_url}`} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300"><span className="material-symbols-outlined">image</span></div>
                                        )}
                                    </div>
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Permanent Address</label>
                                    <textarea name="permanent_address" value={formData.permanent_address} onChange={handleInputChange} rows="3" className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary outline-none transition-all resize-none"></textarea>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Current Address</label>
                                    <textarea name="current_address" value={formData.current_address} onChange={handleInputChange} rows="3" className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary outline-none transition-all resize-none"></textarea>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full md:w-2/3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Email Address</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary outline-none transition-all" />
                                </div>
                                <div className="space-y-1.5 opacity-60">
                                    <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Employment Type (View Only)</label>
                                    <div className="w-full bg-slate-100 px-4 py-3 rounded-xl text-sm border-transparent">{formData.employment_type}</div>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 p-3 rounded-lg inline-block italic border border-slate-100">
                                <span className="material-symbols-outlined text-[14px] align-middle mr-1">info</span>
                                Department and Designation updates must be handled through the "Transfer" module to maintain audit trails.
                            </p>
                        </div>
                    )}

                    {activeTab === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Basic Pay (₹)</label>
                                    <input type="number" name="basic_pay" value={formData.basic_pay} onChange={handleInputChange} required className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary outline-none transition-all" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">HRA (₹)</label>
                                    <input type="number" name="hra" value={formData.hra} onChange={handleInputChange} className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary outline-none transition-all" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Bank Account</label>
                                    <input type="text" name="bank_account_number" value={formData.bank_account_number} onChange={handleInputChange} className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary outline-none transition-all" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">IFSC Code</label>
                                    <input type="text" name="ifsc_code" value={formData.ifsc_code} onChange={handleInputChange} className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary outline-none transition-all uppercase" />
                                </div>
                            </div>
                            <div className="flex gap-8 mt-4 p-4 bg-surface-container rounded-xl">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" name="pf_applicable" checked={formData.pf_applicable} onChange={handleInputChange} className="w-5 h-5 accent-[#1a4fa0]" />
                                    <span className="font-bold text-sm text-slate-700">PF Applicable</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" name="esi_applicable" checked={formData.esi_applicable} onChange={handleInputChange} className="w-5 h-5 accent-[#1a4fa0]" />
                                    <span className="font-bold text-sm text-slate-700">ESI Applicable</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {activeTab === 4 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                             {formData.nominees.map((nominee, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-2xl ring-1 ring-slate-200 relative">
                                    <h4 className="font-bold text-[#1a4fa0] mb-4 text-xs uppercase tracking-widest">Nominee {idx + 1}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Name</label>
                                            <input type="text" name="nominee_name" value={nominee.nominee_name} onChange={(e) => handleNomineeChange(idx, e)} className="w-full bg-slate-50 px-4 py-2 rounded-xl text-sm border-transparent focus:border-primary outline-none transition-all" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Relationship</label>
                                            <input type="text" name="relationship" value={nominee.relationship} onChange={(e) => handleNomineeChange(idx, e)} className="w-full bg-slate-50 px-4 py-2 rounded-xl text-sm border-transparent focus:border-primary outline-none transition-all" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contact</label>
                                            <input type="tel" name="contact_number" value={nominee.contact_number} onChange={(e) => handleNomineeChange(idx, e)} className="w-full bg-slate-50 px-4 py-2 rounded-xl text-sm border-transparent focus:border-primary outline-none transition-all" />
                                        </div>
                                    </div>
                                </div>
                             ))}
                        </div>
                    )}

                    <div className="mt-10 pt-6 border-t border-slate-200 flex justify-between">
                         <button type="button" onClick={handlePrev} disabled={activeTab === 1} className="px-6 py-3 rounded-xl font-bold text-sm text-slate-600 bg-slate-50 hover:bg-slate-100 disabled:opacity-0 transition-all">Previous</button>
                         {activeTab < 4 ? (
                            <button type="button" onClick={handleNext} className="editorial-gradient text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg hover:-translate-y-0.5 transition-all">Next Details</button>
                         ) : (
                            <button type="submit" disabled={submitting} className="editorial-gradient text-white px-10 py-3 rounded-xl font-black text-sm shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2">
                                {submitting ? 'Saving Changes...' : 'Finalize Update'}
                                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                            </button>
                         )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeEdit;
