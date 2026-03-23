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
                <div className="flex flex-col items-center">
                    <div style={{ width: '128px', height: '128px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 24px auto', flexShrink: 0, background: 'white', padding: '4px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1), 0 0 0 4px #c0392b20' }}>
                        <img 
                            src="/KDMPMACU_Ltd_Logo.png" 
                            alt="KDMPMACULTD Logo" 
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            onError={(e) => {
                                e.target.outerHTML = '<div style="width:100%; height:100%; background:#c0392b; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);"><span style="color:white; font-family:material-symbols-outlined; font-size:48px;">agriculture</span></div>';
                            }}
                        />
                    </div>
                    <h2 className="font-headline font-black text-3xl tracking-tight text-[#1a4fa0] uppercase">KDMPMACULTD</h2>
                    <p className="text-on-surface-variant text-[10px] uppercase font-black tracking-widest mt-3">Dairy Management Portal</p>
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
