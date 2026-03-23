import { useState, useEffect } from 'react';
import api from '../api/axios';

const DocumentVault = () => {
    const [employees, setEmployees] = useState([]);
    const [selectedEmp, setSelectedEmp] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const mandatoryList = [
        { type: 'Aadhar Card', code: 'AADHAR' },
        { type: 'PAN Card', code: 'PAN' },
        { type: 'Educational Degree', code: 'DEGREE' },
        { type: 'Relieving Letter', code: 'RELIEVING' },
        { type: 'PRAN / PF Form', code: 'PF_FORM' },
        { type: 'Passport Photo', code: 'PHOTO' }
    ];

    useEffect(() => {
        const fetchEmps = async () => {
            try {
                const res = await api.get('/employees');
                if (res.data.success) setEmployees(res.data.data);
            } catch (err) { console.error(err); }
        };
        fetchEmps();
    }, []);

    const fetchDocuments = async (id) => {
        setLoading(true);
        try {
            const res = await api.get(`/documents/${id}`);
            if (res.data.success) setDocuments(res.data.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleSelect = (emp) => {
        setSelectedEmp(emp);
        fetchDocuments(emp.emp_id);
    };

    const handleUpload = async (e, docType) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('document', file);
        formData.append('doc_type', docType);

        try {
            const res = await api.post(`/documents/${selectedEmp.emp_id}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                alert(`${docType} uploaded successfully!`);
                fetchDocuments(selectedEmp.emp_id);
            }
        } catch (err) {
            alert("Upload failed. Please check file size/type.");
        } finally {
            setUploading(false);
        }
    };

    const getDocStatus = (code) => {
        const doc = documents.find(d => d.doc_type === code);
        return doc ? doc : null;
    };

    const filteredEmployees = employees.filter(e => 
        e.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        e.emp_id.includes(searchTerm)
    );

    return (
        <div className="w-full animate-in fade-in duration-500 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
                <div className="flex-1">
                    <h2 className="font-headline font-black text-4xl text-[#00387e] tracking-tight">Compliance Vault</h2>
                    <p className="text-on-surface-variant text-sm mt-1 font-medium">Verify and manage mandatory employee documentation for audit compliance.</p>
                </div>
                <div className="w-full md:w-80 group relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                    <input 
                        type="text" 
                        placeholder="Search employee by name or ID..."
                        className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && filteredEmployees.length > 0 && !selectedEmp && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto animate-in slide-in-from-top-2">
                            {filteredEmployees.map(emp => (
                                <div 
                                    key={emp.emp_id} 
                                    onClick={() => handleSelect(emp)}
                                    className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between border-b last:border-0"
                                >
                                    <span className="font-bold text-sm text-slate-700">{emp.full_name}</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{emp.emp_id}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Employee Info Card */}
                <div className="w-full lg:w-1/3">
                    {selectedEmp ? (
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm ring-1 ring-slate-200/50 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                               <span className="material-symbols-outlined text-8xl">verified_user</span>
                           </div>
                           <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center text-primary font-black text-2xl mb-6">
                               {selectedEmp.full_name.split(' ').map(n => n[0]).join('')}
                           </div>
                           <h3 className="font-headline font-black text-2xl text-[#00387e]">{selectedEmp.full_name}</h3>
                           <p className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] mt-2 mb-6">Employee ID: {selectedEmp.emp_id}</p>
                           
                           <div className="space-y-4 pt-6 border-t border-slate-100">
                               <div className="flex justify-between items-center text-sm">
                                   <span className="text-slate-400 font-medium">Department</span>
                                   <span className="font-bold text-slate-700">{selectedEmp.dept_name || 'Unassigned'}</span>
                               </div>
                               <div className="flex justify-between items-center text-sm">
                                   <span className="text-slate-400 font-medium">Designation</span>
                                   <span className="font-bold text-slate-700">{selectedEmp.desig_name || 'Unassigned'}</span>
                               </div>
                               <div className="flex justify-between items-center text-sm">
                                   <span className="text-slate-400 font-medium">Join Date</span>
                                   <span className="font-bold text-slate-700">{new Date(selectedEmp.date_of_joining).toLocaleDateString()}</span>
                               </div>
                           </div>
                           <button 
                               onClick={() => setSelectedEmp(null)}
                               className="mt-10 w-full bg-slate-50 hover:bg-slate-100 text-slate-500 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-colors border border-slate-100"
                           >
                               Switch Employee
                           </button>
                        </div>
                    ) : (
                        <div className="bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 p-20 flex flex-col items-center justify-center text-center">
                            <span className="material-symbols-outlined text-6xl text-slate-300 mb-6">person_search</span>
                            <p className="text-sm font-bold text-slate-400">Search and select an employee to view mandatory compliance docs.</p>
                        </div>
                    )}
                </div>

                {/* Checklist Grid */}
                <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {mandatoryList.map(item => {
                            const doc = getDocStatus(item.code);
                            return (
                                <div key={item.code} className="bg-white rounded-[2rem] p-8 shadow-sm ring-1 ring-slate-200/50 hover:ring-primary/20 transition-all flex flex-col justify-between min-h-[180px]">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-lg leading-tight">{item.type}</h4>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mandatory</span>
                                        </div>
                                        {doc ? (
                                            <span className="material-symbols-outlined text-success fill-icon text-2xl">check_circle</span>
                                        ) : (
                                            <span className="material-symbols-outlined text-error text-2xl">pending_actions</span>
                                        )}
                                    </div>

                                    {doc ? (
                                        <div className="bg-success-container/10 p-4 rounded-xl flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="material-symbols-outlined text-success">draft</span>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-success uppercase leading-none">Verified</span>
                                                    <span className="text-[9px] text-slate-500 truncate max-w-[120px]">{doc.file_name}</span>
                                                </div>
                                            </div>
                                            <button className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline px-2 py-1">View</button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            <p className="text-[10px] text-slate-400 font-medium">PDF or Scanned Copy required.</p>
                                            <label className="cursor-pointer">
                                                <div className={`w-full text-center py-3 rounded-xl border border-dashed border-slate-300 text-[10px] font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-all ${uploading ? 'opacity-50 cursor-wait' : ''}`}>
                                                    {uploading ? 'Uploading...' : 'Upload Document'}
                                                </div>
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    disabled={!selectedEmp || uploading} 
                                                    onChange={(e) => handleUpload(e, item.code)} 
                                                />
                                            </label>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentVault;
