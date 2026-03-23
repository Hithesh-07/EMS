import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

const EmployeeProfile = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const empId = searchParams.get('id');
    const [activeTab, setActiveTab] = useState('Overview');
    
    // Dynamic State
    const [emp, setEmp] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!empId) return;

        const fetchEmployeeData = async () => {
            setLoading(true);
            try {
                // Parallel requests for optimal speed
                const [empRes, docRes, timeRes] = await Promise.all([
                    api.get(`/employees/${empId}`),
                    api.get(`/documents/employee/${empId}`).catch(() => ({ data: { data: [] } })), // Assuming it exists
                    api.get(`/employees/${empId}/timeline`)
                ]);

                if (empRes.data.success) setEmp(empRes.data.data);
                if (docRes.data?.success) setDocuments(docRes.data.data);
                if (timeRes.data.success) setTimeline(timeRes.data.data);

            } catch (err) {
                console.error("Failed to load profile data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployeeData();
    }, [empId]);

    const getDocBadge = (status) => {
        return status === 'Verified' 
            ? <span className="text-success bg-success-container/30 px-2 py-0.5 rounded text-xs font-bold">Verified</span>
            : <span className="text-error bg-error-container/50 px-2 py-0.5 rounded text-xs font-bold">Pending Review</span>;
    };

    if (loading) {
        return (
            <div className="w-full h-64 flex flex-col items-center justify-center animate-in fade-in duration-500 text-slate-500">
                <span className="material-symbols-outlined text-4xl animate-spin mb-4">progress_activity</span>
                <p className="font-bold text-sm tracking-widest uppercase">Fetching Profile</p>
            </div>
        );
    }

    if (!emp) {
        return (
            <div className="w-full p-8 text-center bg-slate-100 rounded-2xl border-dashed border-2 border-slate-300">
                <h3 className="font-headline font-bold text-xl text-slate-600 mb-2">Employee Not Found</h3>
                <p className="text-slate-500 text-sm">The requested employee ID is invalid or has been removed.</p>
                <button onClick={() => navigate('/employees')} className="mt-4 text-[#1a4fa0] font-bold text-sm tracking-wide hover:underline">Return to Directory</button>
            </div>
        );
    }

    return (
        <div className="w-full animate-in fade-in duration-500">
            {/* Header / Profile Card */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm ring-1 ring-slate-200/50 mb-8 flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-24 editorial-gradient opacity-10"></div>
                
                <div className="w-32 h-32 rounded-2xl bg-white shadow-lg ring-4 ring-white relative z-10 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {emp.photo_url ? (
                        <img src={emp.photo_url} alt={emp.full_name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-[#1a4fa0] flex flex-col items-center justify-center text-4xl font-black text-white uppercase">
                            {emp.full_name ? emp.full_name.split(' ').map(n=>n[0]).join('').substring(0, 2) : 'EM'}
                        </div>
                    )}
                </div>

                <div className="flex-1 relative z-10 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                            <h2 className="font-headline font-black text-3xl text-slate-800 tracking-tight">{emp.full_name}</h2>
                            <div className="flex items-center justify-center md:justify-start gap-3 mt-1 text-sm font-medium text-slate-500">
                                <span className="text-[#1a4fa0] font-bold tracking-widest uppercase text-xs">ID: {emp.emp_id}</span>
                                <span>•</span>
                                <span>{emp.dept_name || 'Department'}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase ${emp.status === 'Active' ? 'bg-success-container/30 text-success' : 'bg-slate-200 text-slate-600'}`}>
                                {emp.status}
                            </span>
                            <button className="bg-slate-100 hover:bg-[#1a4fa0] hover:text-white text-slate-700 px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 group">
                                <span className="material-symbols-outlined text-[16px] group-hover:text-white">edit</span>
                                Edit
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-6">
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Designation</div>
                            <div className="font-medium text-slate-700">{emp.desig_name || 'Designation'}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Email</div>
                            <div className="font-medium text-slate-700">{emp.email || 'N/A'}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Phone</div>
                            <div className="font-medium text-slate-700">{emp.mobile || 'N/A'}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Date of Joining</div>
                            <div className="font-medium text-slate-700">{emp.date_of_joining ? new Date(emp.date_of_joining).toLocaleDateString() : 'N/A'}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="bg-surface-container-lowest rounded-3xl shadow-sm ring-1 ring-slate-200/50 overflow-hidden mb-12">
                <div className="flex overflow-x-auto border-b border-surface-container custom-scrollbar hide-scroll-mobile">
                    {['Overview', 'Documents', 'Timeline', 'Payroll & FnF'].map(tab => (
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
                    {/* Overview Tab */}
                    {activeTab === 'Overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in">
                            <div>
                                <h3 className="font-headline font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">person</span>
                                    Personal Details
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-sm font-medium text-slate-500">Date of Birth</span>
                                        <span className="text-sm font-bold text-slate-700">{emp.date_of_birth ? new Date(emp.date_of_birth).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-sm font-medium text-slate-500">Location</span>
                                        <span className="text-sm font-bold text-slate-700">{emp.loc_name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-sm font-medium text-slate-500">Basic Pay</span>
                                        <span className="text-sm font-bold text-slate-700">₹ {emp.basic_pay || 0}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-sm font-medium text-slate-500">Address</span>
                                        <span className="text-sm font-bold text-slate-700 text-right w-1/2 break-words">{emp.permanent_address || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Documents Tab */}
                    {activeTab === 'Documents' && (
                        <div className="animate-in fade-in">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-headline font-bold text-lg text-slate-800 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">folder_open</span>
                                    Upload & Verification
                                </h3>
                                <button className="editorial-gradient text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[16px]">upload</span>
                                    Upload Document
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {documents && documents.length > 0 ? documents.map(doc => (
                                    <div key={doc.doc_id} className="bg-white border text-center border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative group">
                                        <div className="absolute top-4 right-4">{getDocBadge(doc.verification_status)}</div>
                                        <div className="w-16 h-16 mx-auto bg-primary-fixed/50 text-[#1a4fa0] rounded-2xl flex items-center justify-center mb-4">
                                            <span className="material-symbols-outlined text-3xl">description</span>
                                        </div>
                                        <h4 className="font-bold text-slate-800 text-sm mb-1">{doc.document_type}</h4>
                                        <p className="text-xs text-slate-500 mb-4">{doc.file_name} • {new Date(doc.upload_date).toLocaleDateString()}</p>
                                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-[#1a4fa0] hover:text-white flex items-center justify-center transition-colors">
                                                <span className="material-symbols-outlined text-[16px]">download</span>
                                            </button>
                                            {doc.verification_status !== 'Verified' && (
                                                <button className="w-8 h-8 rounded-full bg-success/10 text-success hover:bg-success hover:text-white flex items-center justify-center transition-colors">
                                                    <span className="material-symbols-outlined text-[16px]">verified</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                        No documents found for this employee.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Timeline Tab */}
                    {activeTab === 'Timeline' && (
                        <div className="animate-in fade-in max-w-2xl mx-auto">
                            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                                {timeline && timeline.length > 0 ? timeline.map((event, index) => (
                                    <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 
                                            ${event.type === 'JOINED' ? 'bg-[#1a4fa0] text-white' : 
                                              event.type === 'PROMOTED' ? 'bg-success text-white' : 
                                              event.type === 'TRANSFERRED' ? 'bg-secondary text-white' : 'bg-slate-300'}`}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">
                                                {event.type === 'JOINED' ? 'login' :
                                                 event.type === 'PROMOTED' ? 'trending_up' :
                                                 event.type === 'TRANSFERRED' ? 'swap_horiz' : 
                                                 event.type === 'EXITED' ? 'logout' : 'circle'}
                                            </span>
                                        </div>

                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl shadow-sm ring-1 ring-slate-100 bg-white">
                                            <div className="flex items-center justify-between space-x-2 mb-1">
                                                <div className="font-bold text-slate-800 text-sm">{event.type}</div>
                                                <time className="font-label text-xs font-bold text-[#1a4fa0]">{new Date(event.date).toLocaleDateString()}</time>
                                            </div>
                                            <div className="text-slate-600 text-xs leading-relaxed">{event.reason || (event.type === 'JOINED' ? 'Joined organization' : 'Transferred')}</div>
                                            <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 inline-block px-2 py-1 rounded">
                                                {event.location || event.dept || 'Standard Location'}
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-8 text-center text-slate-500 w-full relative z-10">
                                        No timeline events mapped for this employee yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfile;
