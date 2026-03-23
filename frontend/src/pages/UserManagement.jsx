import { useState, useEffect } from 'react';
import api from '../api/axios';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
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
        fetchUsers();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await api.post('/users', formData);
            if (res.data.success) {
                setMessage({ type: 'success', text: 'User created successfully!' });
                setFormData({ name: '', email: '', password: '', role: 'Viewer' });
                setShowAddModal(false);
                fetchUsers();
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create user' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="w-full animate-in fade-in duration-500 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                <div>
                    <h2 className="font-headline font-black text-4xl text-[#00387e] tracking-tight">Access Control</h2>
                    <p className="text-on-surface-variant text-sm mt-1 font-medium">Manage administrative privileges and staff access levels.</p>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="editorial-gradient text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all flex items-center gap-3"
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
                                    <th className="py-5 px-8 font-label text-[10px] font-black text-on-surface-variant uppercase tracking-[0.1em] text-center">Status</th>
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
                                        <td className="py-5 px-8 text-center uppercase text-[10px] font-black text-success tracking-widest">
                                            Active
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl relative z-10 p-10 ring-1 ring-white/20 animate-in zoom-in-95 duration-300">
                        <div className="text-center mb-8">
                            <h3 className="font-headline font-black text-2xl text-slate-800">New Staff Member</h3>
                            <p className="text-xs font-medium text-slate-500 mt-2">Assign roles and credentials for new administrators.</p>
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
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all"
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

                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button" 
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={saving}
                                    className="flex-1 editorial-gradient text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/40 disabled:opacity-50 transition-all"
                                >
                                    {saving ? 'Creating...' : 'Grant Access'}
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
