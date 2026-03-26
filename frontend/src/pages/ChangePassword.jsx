import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        setLoading(true);
        try {
            const res = await api.put('/auth/change-password', {
                currentPassword,
                newPassword
            });

            if (res.data.success) {
                setMessage({ type: 'success', text: 'Password updated successfully!' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setTimeout(() => navigate('/dashboard'), 2000);
            }
        } catch (err) {
            setMessage({ 
                type: 'error', 
                text: err.response?.data?.message || 'Failed to update password' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm ring-1 ring-slate-200/50">
                <div className="text-center mb-8">
                    <h2 className="font-headline font-black text-2xl text-slate-800">Change Password</h2>
                    <p className="text-sm font-medium text-slate-500 mt-2">Update your security credentials.</p>
                </div>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 ${
                        message.type === 'success' 
                            ? 'bg-success-container/30 text-success border border-success/20' 
                            : 'bg-error-container/30 text-error border border-error/20'
                    }`}>
                        <span className="material-symbols-outlined text-[18px]">
                            {message.type === 'success' ? 'check_circle' : 'error'}
                        </span>
                        <span className="text-xs font-bold">{message.text}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Current Password</label>
                        <input 
                            type="password" 
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all"
                            placeholder="Enter current password..."
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">New Password</label>
                        <input 
                            type="password" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all"
                            placeholder="Enter new password..."
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirm New Password</label>
                        <input 
                            type="password" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all"
                            placeholder="Confirm new password..."
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full editorial-gradient text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/40 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                    >
                        {loading && <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>}
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
