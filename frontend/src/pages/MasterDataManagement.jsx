import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const MasterDataManagement = () => {
    const [activeTab, setActiveTab] = useState('departments');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const config = {
        departments: {
            title: 'Departments',
            endpoint: '/departments',
            idField: 'dept_id',
            fields: [
                { name: 'dept_name', label: 'Department Name', type: 'text', required: true },
                { name: 'dept_code', label: 'Code', type: 'text', required: true }
            ],
            columns: [
                { label: 'Name', key: 'dept_name' },
                { label: 'Code', key: 'dept_code' }
            ]
        },
        designations: {
            title: 'Designations',
            endpoint: '/designations',
            idField: 'desig_id',
            fields: [
                { name: 'desig_name', label: 'Designation Name', type: 'text', required: true },
                { name: 'grade', label: 'Grade', type: 'text', required: true }
            ],
            columns: [
                { label: 'Name', key: 'desig_name' },
                { label: 'Grade', key: 'grade' }
            ]
        },
        locations: {
            title: 'Locations',
            endpoint: '/locations',
            idField: 'loc_id',
            fields: [
                { name: 'loc_name', label: 'Location Name', type: 'text', required: true },
                { name: 'loc_code', label: 'Code', type: 'text', required: true }
            ],
            columns: [
                { label: 'Name', key: 'loc_name' },
                { label: 'Code', key: 'loc_code' }
            ]
        }
    };

    const currentConfig = config[activeTab];

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(currentConfig.endpoint);
            if (res.data.success) {
                setData(res.data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentConfig.endpoint]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAction = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            if (editingItem) {
                await api.put(`${currentConfig.endpoint}/${editingItem[currentConfig.idField]}`, formData);
                setMessage({ type: 'success', text: `${currentConfig.title.slice(0, -1)} updated successfully!` });
            } else {
                await api.post(currentConfig.endpoint, formData);
                setMessage({ type: 'success', text: `${currentConfig.title.slice(0, -1)} created successfully!` });
            }
            setShowModal(false);
            setEditingItem(null);
            setFormData({});
            fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Action failed' });
        } finally {
            setSaving(false);
        }
    };

    const handleDeactivate = async (item) => {
        const id = item[currentConfig.idField];
        const newStatus = !item.is_active;
        try {
            await api.put(`${currentConfig.endpoint}/${id}`, { ...item, is_active: newStatus });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to PERMANENTLY delete this record? This should only be done if no records are linked.')) return;
        try {
            await api.delete(`${currentConfig.endpoint}/${id}`);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete');
        }
    };

    const openModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            const initialData = {};
            currentConfig.fields.forEach(f => initialData[f.name] = item[f.name]);
            initialData.is_active = item.is_active;
            setFormData(initialData);
        } else {
            setEditingItem(null);
            const initialData = {};
            currentConfig.fields.forEach(f => initialData[f.name] = '');
            initialData.is_active = true;
            setFormData(initialData);
        }
        setShowModal(true);
    };

    return (
        <div className="w-full">
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200 mb-8 gap-8">
                {Object.keys(config).map(key => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all ${
                            activeTab === key ? 'border-b-2 border-primary text-primary' : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        {config[key].title}
                    </button>
                ))}
            </div>

            {/* Header with Search and Add */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div className="relative w-full sm:w-auto min-w-[300px]">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                    <input 
                        type="text" 
                        placeholder={`Search ${currentConfig.title.toLowerCase()}...`}
                        className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all"
                    />
                </div>
                <button 
                    onClick={() => openModal()}
                    className="editorial-gradient text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all flex items-center gap-3 w-full sm:w-auto justify-center"
                >
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    Add {currentConfig.title.slice(0, -1)}
                </button>
            </div>

            {message.text && (
                <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 shadow-sm ${message.type === 'success' ? 'bg-success-container/30 text-success border border-success/20' : 'bg-error-container/30 text-error border border-error/20'}`}>
                    <span className="material-symbols-outlined text-[18px]">{message.type === 'success' ? 'check_circle' : 'error'}</span>
                    <span className="text-xs font-bold leading-none">{message.text}</span>
                </div>
            )}

            {/* Tables Area */}
            <div className="bg-white rounded-[2.5rem] shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                {currentConfig.columns.map(col => (
                                    <th key={col.key} className="py-5 px-8 font-label text-[10px] font-black text-on-surface-variant uppercase tracking-[0.1em]">{col.label}</th>
                                ))}
                                <th className="py-5 px-8 font-label text-[10px] font-black text-on-surface-variant uppercase tracking-[0.1em] text-center">Status</th>
                                <th className="py-5 px-8 font-label text-[10px] font-black text-on-surface-variant uppercase tracking-[0.1em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={currentConfig.columns.length + 2} className="py-20 text-center">
                                        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                                        <span className="text-xs font-bold text-slate-400">Fetching records...</span>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={currentConfig.columns.length + 2} className="py-20 text-center">
                                        <span className="text-sm font-bold text-slate-400 italic">No {currentConfig.title.toLowerCase()} configured yet.</span>
                                    </td>
                                </tr>
                            ) : data.map(item => (
                                <tr key={item[currentConfig.idField]} className="hover:bg-slate-50/50 transition-colors group">
                                    {currentConfig.columns.map(col => (
                                        <td key={col.key} className="py-5 px-8 text-sm font-bold text-slate-700">{item[col.key]}</td>
                                    ))}
                                    <td className="py-5 px-8 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                                            item.is_active ? 'bg-success-container/30 text-success' : 'bg-slate-100 text-slate-400'
                                        }`}>
                                            {item.is_active ? 'Active' : 'Hidden'}
                                        </span>
                                    </td>
                                    <td className="py-5 px-8 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => openModal(item)}
                                                className="w-8 h-8 rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all flex items-center justify-center"
                                                title="Edit"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                            </button>
                                            <button 
                                                onClick={() => handleDeactivate(item)}
                                                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                                                    item.is_active ? 'bg-amber-50 text-amber-600 hover:bg-amber-500' : 'bg-success-container/20 text-success hover:bg-success'
                                                } hover:text-white`}
                                                title={item.is_active ? 'Deactivate' : 'Activate'}
                                            >
                                                <span className="material-symbols-outlined text-[18px]">{item.is_active ? 'visibility_off' : 'visibility'}</span>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(item[currentConfig.idField])}
                                                className="w-8 h-8 rounded-xl bg-error-container/10 text-error hover:bg-error hover:text-white transition-all flex items-center justify-center"
                                                title="Delete"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CRUD Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm shadow-inner" onClick={() => setShowModal(false)}></div>
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl relative z-10 p-10 ring-1 ring-white/20 animate-in zoom-in-95 duration-300">
                        <div className="text-center mb-8">
                            <h3 className="font-headline font-black text-2xl text-slate-800">{editingItem ? 'Edit' : 'New'} {currentConfig.title.slice(0, -1)}</h3>
                            <p className="text-xs font-medium text-slate-500 mt-2">Manage organizational master data keys.</p>
                        </div>

                        <form onSubmit={handleAction} className="space-y-6">
                            {currentConfig.fields.map(field => (
                                <div key={field.name} className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{field.label}</label>
                                    <input 
                                        type={field.type}
                                        value={formData[field.name] || ''}
                                        onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                                        required={field.required}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all"
                                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                                    />
                                </div>
                            ))}

                            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className="flex-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Visibility Status</p>
                                    <p className="text-[10px] text-slate-500 font-medium">Toggle if this remains active in selectors.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({...formData, is_active: !formData.is_active})}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.is_active ? 'bg-primary' : 'bg-slate-300'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button" 
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={saving}
                                    className="flex-1 editorial-gradient text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/40 disabled:opacity-50 transition-all"
                                >
                                    {saving ? 'Saving...' : 'Confirm Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MasterDataManagement;
