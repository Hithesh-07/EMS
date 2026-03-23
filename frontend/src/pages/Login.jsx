import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/dashboard';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const result = await login(email, password);
            if (result.success) {
                navigate(from, { replace: true });
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative overflow-hidden font-body text-on-surface">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-1/3 editorial-gradient opacity-10"></div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>

            <div className="w-full max-w-md bg-surface-container-lowest rounded-[2.5rem] p-10 shadow-2xl shadow-primary/5 ring-1 ring-slate-200/50 relative z-10 animate-in fade-in zoom-in-95 duration-500">
                
                {/* Logo / Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-[#00387e] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20 rotate-3 hover:rotate-0 transition-transform duration-300">
                        <span className="material-symbols-outlined text-white text-3xl">admin_panel_settings</span>
                    </div>
                    <h2 className="font-headline font-black text-3xl tracking-tight text-on-surface">Admin Portal</h2>
                    <p className="text-on-surface-variant text-sm mt-3 font-medium">Please sign in to access secure administrative tools.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-error-container/20 border border-error/20 rounded-2xl flex items-center gap-3 text-error text-xs font-bold animate-in slide-in-from-top-2">
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-label font-black text-on-surface-variant uppercase tracking-widest pl-1">Email Address</label>
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-[20px]">mail</span>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                                className="w-full bg-surface-container pl-12 pr-6 py-4 rounded-2xl text-sm border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-400" 
                                placeholder="admin@editorial.com" 
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-label font-black text-on-surface-variant uppercase tracking-widest pl-1">Password</label>
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-[20px]">lock_person</span>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                                className="w-full bg-surface-container pl-12 pr-6 py-4 rounded-2xl text-sm border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-400" 
                                placeholder="••••••••" 
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pb-2">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-300 text-primary focus:ring-primary/20 accent-[#00387e]" />
                            <span className="text-xs font-medium text-slate-500 group-hover:text-slate-700 transition-colors">Remember me</span>
                        </label>
                        <button type="button" className="text-xs font-bold text-primary hover:underline underline-offset-4">Forgot Password?</button>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full editorial-gradient text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-wait"
                    >
                        {loading ? (
                            <>
                                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                                Authenticating...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[20px]">login</span>
                                Sign In
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t border-slate-100 text-center">
                    <p className="text-xs text-slate-400 font-medium">
                        Not an admin? <button className="text-primary font-bold hover:underline underline-offset-4" onClick={() => navigate('/dashboard')}>Return to Dashboard</button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
