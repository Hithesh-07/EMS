import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const EmployeeRegistration = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    
    // Lookups state mapping
    const [departments, setDepartments] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [locations, setLocations] = useState([]);

    useEffect(() => {
        const fetchLookups = async () => {
            try {
                const [deptRes, desigRes, locRes] = await Promise.all([
                    api.get('/departments?activeOnly=true'),
                    api.get('/designations?activeOnly=true'),
                    api.get('/locations?activeOnly=true')
                ]);
                if (deptRes.data.success) setDepartments(deptRes.data.data);
                if (desigRes.data.success) setDesignations(desigRes.data.data);
                if (locRes.data.success) setLocations(locRes.data.data);
            } catch (err) {
                console.error("Failed to fetch lookups", err);
            }
        };
        fetchLookups();
    }, []);
    
    // Form State
    const [formData, setFormData] = useState({
        // Tab 1
        full_name: '', date_of_birth: '', gender: '', blood_group: '', 
        aadhaar_number: '', pan_number: '', mobile: '', email: '', 
        permanent_address: '', current_address: '', same_address: false,
        // Tab 2
        dept_id: '', desig_id: '', loc_id: '', date_of_joining: '', employment_type: 'Full-time',
        // Tab 3
        basic_pay: '', hra: '', da: '', other_allowances: '', bank_account_number: '', ifsc_code: '', pf_applicable: false, esi_applicable: false,
        // Tab 4
        nominees: [{ nominee_name: '', relationship: '', contact_number: '', address: '' }],
        // Photo
        photo_file: null,
        photo_url: ''
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                photo_file: file,
                photo_url: URL.createObjectURL(file) // For preview if needed
            }));
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
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
            // Create FormData for multipart submission
            const data = new FormData();
            
            // Append the file if it exists
            if (formData.photo_file) {
                data.append('photo', formData.photo_file);
            }

            // Append all other fields as a single JSON string or individual fields
            // The backend is prepared to handle both, but individual fields are cleaner for Multer
            Object.keys(formData).forEach(key => {
                if (key !== 'photo_file' && key !== 'photo_url' && key !== 'nominees') {
                    data.append(key, formData[key]);
                }
            });

            // Handle nominees as stringified JSON
            data.append('nominees', JSON.stringify(formData.nominees));

            const res = await api.post('/employees', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                navigate('/employees');
            }
        } catch (err) {
            console.error("Submission failed", err);
            alert(err.response?.data?.message || 'Failed to register employee. Please verify Aadhaar/PAN uniqueness.');
        } finally {
            setSubmitting(false);
        }
    };

    const tabs = [
        { id: 1, name: 'Personal Information', icon: 'person' },
        { id: 2, name: 'Employment Details', icon: 'work' },
        { id: 3, name: 'Salary & Compliance', icon: 'account_balance' },
        { id: 4, name: 'Nominee Information', icon: 'family_restroom' }
    ];

    return (
        <div className="w-full animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-8">
                <h2 className="font-headline font-bold text-3xl text-on-surface tracking-tight">Register New Employee</h2>
                <p className="text-on-surface-variant text-sm mt-1">Complete the multi-step form to onboard a new staff member.</p>
            </div>

            <div className="bg-surface-container-lowest rounded-3xl shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
                
                {/* Tabs Header */}
                <div className="flex overflow-x-auto border-b border-surface-container custom-scrollbar hide-scroll-mobile">
                    {tabs.map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-6 py-4 border-b-2 whitespace-nowrap transition-colors ${activeTab === tab.id ? 'border-[#1a4fa0] text-[#1a4fa0] bg-primary/5' : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${activeTab === tab.id ? 'bg-[#1a4fa0] text-white' : 'bg-slate-200 text-slate-500'}`}>
                                {activeTab > tab.id ? <span className="material-symbols-outlined text-[16px]">check</span> : tab.id}
                            </div>
                            <span className={`font-headline font-bold text-sm ${activeTab === tab.id ? 'text-[#1a4fa0]' : ''}`}>{tab.name}</span>
                        </button>
                    ))}
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-8">
                    
                    {/* Tab 1: Personal Info */}
                    {activeTab === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Full Name <span className="text-error">*</span></label>
                                    <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} required className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="e.g. Rahul Sharma" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Date of Birth <span className="text-error">*</span></label>
                                    <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} required className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Gender <span className="text-error">*</span></label>
                                    <select name="gender" value={formData.gender} onChange={handleInputChange} required className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Blood Group</label>
                                    <input type="text" name="blood_group" value={formData.blood_group} onChange={handleInputChange} className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="e.g. B+" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Aadhaar Number <span className="text-error">*</span></label>
                                    <input type="text" name="aadhaar_number" value={formData.aadhaar_number} onChange={handleInputChange} required className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="12-digit number" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">PAN Number <span className="text-error">*</span></label>
                                    <input type="text" name="pan_number" value={formData.pan_number} onChange={handleInputChange} required className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all uppercase" placeholder="ABCDE1234F" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Mobile <span className="text-error">*</span></label>
                                    <input type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange} required className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="10-digit number" />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Email Address</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="e.g. rahul@example.com" />
                                </div>
                                
                                <div className="space-y-1.5">
                                    <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Upload Photo (JPG/PNG)</label>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <input 
                                                type="file" 
                                                name="photo" 
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="w-full bg-surface-container px-4 py-2.5 rounded-xl text-xs border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-[#1a4fa0] hover:file:bg-primary/20 cursor-pointer" 
                                            />
                                        </div>
                                        {formData.photo_url && (
                                            <div className="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden shrink-0 bg-white">
                                                <img src={formData.photo_url} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Permanent Address <span className="text-error">*</span></label>
                                    <textarea name="permanent_address" value={formData.permanent_address} onChange={handleInputChange} required rows="3" className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"></textarea>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Current Address</label>
                                        <label className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80">
                                            <input type="checkbox" name="same_address" checked={formData.same_address} onChange={(e) => { handleInputChange(e); if(e.target.checked) setFormData(prev => ({...prev, current_address: prev.permanent_address})) }} className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20 accent-[#1a4fa0]" />
                                            <span className="text-xs font-medium text-slate-500">Same as Permanent</span>
                                        </label>
                                    </div>
                                    <textarea name="current_address" value={formData.current_address} onChange={handleInputChange} disabled={formData.same_address} required rows="3" className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"></textarea>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Employment Details */}
                    {activeTab === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Department <span className="text-error">*</span></label>
                                    <select name="dept_id" value={formData.dept_id} onChange={handleInputChange} required className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                                        <option value="">Select Department</option>
                                        {departments.map(d => <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Designation <span className="text-error">*</span></label>
                                    <select name="desig_id" value={formData.desig_id} onChange={handleInputChange} required className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                                        <option value="">Select Designation</option>
                                        {designations.map(d => <option key={d.desig_id} value={d.desig_id}>{d.desig_name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Location <span className="text-error">*</span></label>
                                    <select name="loc_id" value={formData.loc_id} onChange={handleInputChange} required className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                                        <option value="">Select Location</option>
                                        {locations.map(d => <option key={d.loc_id} value={d.loc_id}>{d.loc_name}</option>)}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full md:w-2/3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Date of Joining <span className="text-error">*</span></label>
                                    <input type="date" name="date_of_joining" value={formData.date_of_joining} onChange={handleInputChange} required className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Employment Type <span className="text-error">*</span></label>
                                    <select name="employment_type" value={formData.employment_type} onChange={handleInputChange} required className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Salary & Compliance */}
                    {activeTab === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            
                            <h3 className="font-headline font-bold text-lg text-slate-800 border-b pb-2">Salary Components</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Basic Pay (₹) <span className="text-error">*</span></label>
                                    <input type="number" name="basic_pay" value={formData.basic_pay} onChange={handleInputChange} required className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="0.00" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">HRA (₹)</label>
                                    <input type="number" name="hra" value={formData.hra} onChange={handleInputChange} className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="0.00" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">DA (₹)</label>
                                    <input type="number" name="da" value={formData.da} onChange={handleInputChange} className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="0.00" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Other Allowances (₹)</label>
                                    <input type="number" name="other_allowances" value={formData.other_allowances} onChange={handleInputChange} className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="0.00" />
                                </div>
                            </div>

                            <h3 className="font-headline font-bold text-lg text-slate-800 border-b pb-2 mt-8">Bank & Compliance</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full lg:w-2/3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Bank Account Number <span className="text-error">*</span></label>
                                    <input type="text" name="bank_account_number" value={formData.bank_account_number} onChange={handleInputChange} required className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Account Number" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">IFSC Code <span className="text-error">*</span></label>
                                    <input type="text" name="ifsc_code" value={formData.ifsc_code} onChange={handleInputChange} required className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all uppercase" placeholder="SBIN0001234" />
                                </div>
                            </div>
                            
                            <div className="flex gap-8 mt-4 p-4 bg-surface-container rounded-xl">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" name="pf_applicable" checked={formData.pf_applicable} onChange={handleInputChange} className="w-5 h-5 rounded border-slate-300 text-[#1a4fa0] focus:ring-[#1a4fa0]/20 accent-[#1a4fa0]" />
                                    <span className="font-bold text-sm text-slate-700 group-hover:text-[#1a4fa0] transition-colors">PF Applicable</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" name="esi_applicable" checked={formData.esi_applicable} onChange={handleInputChange} className="w-5 h-5 rounded border-slate-300 text-[#1a4fa0] focus:ring-[#1a4fa0]/20 accent-[#1a4fa0]" />
                                    <span className="font-bold text-sm text-slate-700 group-hover:text-[#1a4fa0] transition-colors">ESI Applicable</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Tab 4: Nominees */}
                    {activeTab === 4 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            {formData.nominees.map((nominee, idx) => (
                                <div key={idx} className="bg-surface-container-lowest p-6 rounded-2xl ring-1 ring-slate-200 shadow-sm relative group transition-all">
                                    {formData.nominees.length > 1 && (
                                        <button type="button" onClick={() => removeNominee(idx)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-error/10 text-error flex items-center justify-center hover:bg-error hover:text-white transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    )}
                                    <h4 className="font-headline font-bold text-primary mb-4">Nominee {idx + 1}</h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Full Name <span className="text-error">*</span></label>
                                            <input type="text" name="nominee_name" value={nominee.nominee_name} onChange={(e) => handleNomineeChange(idx, e)} required className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Relationship <span className="text-error">*</span></label>
                                            <select name="relationship" value={nominee.relationship} onChange={(e) => handleNomineeChange(idx, e)} required className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                                                <option value="">Select Relationship</option>
                                                <option value="Spouse">Spouse</option>
                                                <option value="Child">Child</option>
                                                <option value="Parent">Parent</option>
                                                <option value="Sibling">Sibling</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Contact Number</label>
                                            <input type="tel" name="contact_number" value={nominee.contact_number} onChange={(e) => handleNomineeChange(idx, e)} className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                                        </div>
                                        <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
                                            <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Address</label>
                                            <textarea name="address" value={nominee.address} onChange={(e) => handleNomineeChange(idx, e)} rows="2" className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"></textarea>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button type="button" onClick={addNominee} className="flex items-center gap-2 text-[#1a4fa0] font-bold text-sm tracking-wide hover:underline underline-offset-4 py-2">
                                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                                Add Another Nominee
                            </button>
                        </div>
                    )}

                    {/* Form Controls */}
                    <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <button 
                            type="button"
                            onClick={handlePrev}
                            disabled={activeTab === 1}
                            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-600 bg-slate-100 hover:bg-slate-200'}`}
                        >
                            Previous Step
                        </button>

                        {activeTab < 4 ? (
                            <button 
                                type="button"
                                onClick={handleNext}
                                className="w-full sm:w-auto px-8 py-3 bg-[#00387e] text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all outline-none"
                            >
                                Next Step
                            </button>
                        ) : (
                            <button 
                                type="submit"
                                disabled={submitting}
                                className="w-full sm:w-auto editorial-gradient text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                            >
                                {submitting ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                        Registering...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                        Submit Registration
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeRegistration;
