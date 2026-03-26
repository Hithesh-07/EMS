import { useState, useEffect } from 'react';
import api from '../api/axios';
import MasterDataManagement from './MasterDataManagement';

const UserManagement = () => {
    const [view, setView] = useState('access'); // 'access' or 'master'
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Viewer'
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/users');
            if (res.data.success) {
                setUsers(res.data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (view === 'access') fetchUsers();
    }, [view]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            if (editingUser) {
                const res = await api.put(`/users/${editingUser.user_id}`, {
                    name: formData.name,
                    role: formData.role
                });
                if (res.data.success) {
                    setMessage({ type: 'success', text: 'User updated successfully!' });
                    setShowEditModal(false);
                }
            } else {
                const res = await api.post('/users', formData);
                if (res.data.success) {
                    setMessage({ type: 'success', text: 'User created successfully!' });
                    setShowAddModal(false);
                }
            }
            setFormData({ name: '', email: '', password: '', role: 'Viewer' });
            fetchUsers();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Action failed' });
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            password: '' // Not used for edit
        });
        setShowEditModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to PERMANENTLY delete this user?')) return;
        try {
            const res = await api.delete(`/users/${id}`);
            if (res.data.success) {
                setMessage({ type: 'success', text: 'User removed successfully' });
                fetchUsers();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Delete failed');
        }
    };

    return (
        <div className="w-full animate-in fade-in duration-500 max-w-6xl mx-auto">
            {/* Main Admin Navigation */}
            <div className="flex gap-4 mb-2 bg-[#00387e]/5 p-2 rounded-3xl w-fit">
                <button 
                    onClick={() => setView('access')}
                    className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        view === 'access' ? 'bg-[#00387e] text-white shadow-lg' : 'text-[#00387e] hover:bg-[#00387e]/10'
                    }`}
                >
                    Access Control
                </button>
                <button 
                    onClick={() => setView('master')}
                    className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        view === 'master' ? 'bg-[#00387e] text-white shadow-lg' : 'text-[#00387e] hover:bg-[#00387e]/10'
                    }`}
                >
                    Master Data
                </button>
            </div>

            {view === 'access' ? (
                <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 mt-6">
                    <div>
                        <h2 className="font-headline font-black text-4xl text-[#00387e] tracking-tight">Access Control</h2>
                        <p className="text-on-surface-variant text-sm mt-1 font-medium">Manage administrative privileges and staff access levels.</p>
                    </div>
                    <button 
                        onClick={() => {
                            setEditingUser(null);
                            setFormData({ name: '', email: '', password: '', role: 'Viewer' });
                            setShowAddModal(true);
                        }}
                        className="editorial-gradient text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all flex items-center gap-3"
                    >
                        <span className="material-symbols-outlined text-[20px]">person_add</span>
                        Create New Account
                    </button>
                </div>

                {message.text && (
                    <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 animate-bounce shadow-sm ${message.type === 'success' ? 'bg-success-container/30 text-success border border-success/20' : 'bg-error-container/30 text-error border border-error/20'}`}>
                        <span className="material-symbols-outlined text-[18px]">{message.type === 'success' ? 'check_circle' : 'error'}</span>
                        <span className="text-xs font-bold leading-none">{message.text}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white rounded-[2.5rem] shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="py-5 px-8 font-label text-[10px] font-black text-on-surface-variant uppercase tracking-[0.1em]">Full Name</th>
                                        <th className="py-5 px-8 font-label text-[10px] font-black text-on-surface-variant uppercase tracking-[0.1em]">Email Address</th>
                                        <th className="py-5 px-8 font-label text-[10px] font-black text-on-surface-variant uppercase tracking-[0.1em]">System Role</th>
                                        <th className="py-5 px-8 font-label text-[10px] font-black text-on-surface-variant uppercase tracking-[0.1em]">Created On</th>
                                        <th className="py-5 px-8 font-label text-[10px] font-black text-on-surface-variant uppercase tracking-[0.1em] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                                    <span className="text-xs font-bold text-slate-400">Loading directory...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : users.map(user => (
                                        <tr key={user.user_id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="py-5 px-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary font-black text-[10px] group-hover:scale-110 transition-transform">
                                                        {user.name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <span className="font-bold text-slate-800 text-sm">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-8 text-sm font-medium text-slate-500">{user.email}</td>
                                            <td className="py-5 px-8">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                                                    user.role === 'Admin' ? 'bg-primary-fixed text-on-primary-fixed-variant' : 
                                                    user.role === 'HR Manager' ? 'bg-secondary-fixed text-on-secondary-fixed-variant' : 
                                                    'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="py-5 px-8 text-sm text-slate-400 font-medium">
                                                {new Date(user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="py-5 px-8 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleEdit(user)}
                                                        className="w-8 h-8 rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all flex items-center justify-center"
                                                        title="Edit User"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(user.user_id)}
                                                        className="w-8 h-8 rounded-xl bg-error-container/10 text-error hover:bg-error hover:text-white transition-all flex items-center justify-center"
                                                        title="Delete User"
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
                </div>
                </>
            ) : (
                <div className="mt-8">
                    <div className="mb-10">
                        <h2 className="font-headline font-black text-4xl text-[#00387e] tracking-tight">Organization Master Data</h2>
                        <p className="text-on-surface-variant text-sm mt-1 font-medium">Configure core organizational units, hierarchies, and locations.</p>
                    </div>
                    <MasterDataManagement />
                </div>
            )}

            {/* Create/Edit User Modal */}
            {(showAddModal || showEditModal) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}></div>
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl relative z-10 p-10 ring-1 ring-white/20 animate-in zoom-in-95 duration-300">
                        <div className="text-center mb-8">
                            <h3 className="font-headline font-black text-2xl text-slate-800">
                                {showEditModal ? 'Update Account' : 'New Staff Member'}
                            </h3>
                            <p className="text-xs font-medium text-slate-500 mt-2">
                                {showEditModal ? 'Modify user privileges and identity.' : 'Assign roles and credentials for new administrators.'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                                <input 
                                    type="text" 
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all"
                                    placeholder="Enter full name..."
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                                <input 
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    disabled={showEditModal}
                                    required
                                    className={`w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm outline-none transition-all ${showEditModal ? 'opacity-50 cursor-not-allowed' : 'focus:ring-4 focus:ring-primary/5 focus:border-primary'}`}
                                    placeholder="email@editorial.com"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">System Role</label>
                                <select 
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all cursor-pointer"
                                >
                                    <option value="Viewer">Viewer (Read Only)</option>
                                    <option value="HR Manager">HR Manager</option>
                                    <option value="Accounts">Accounts</option>
                                    <option value="Admin">Super Admin</option>
                                </select>
                            </div>
                            
                            {!showEditModal && (
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Initial Password</label>
                                    <input 
                                        type="password" 
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            )}

                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button" 
                                    onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
                                    className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={saving}
                                    className="flex-1 editorial-gradient text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/40 disabled:opacity-50 transition-all"
                                >
                                    {saving ? 'Processing...' : (showEditModal ? 'Update User' : 'Grant Access')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
