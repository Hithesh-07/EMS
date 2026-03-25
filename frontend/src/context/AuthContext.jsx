import api from '../api/axios';
import { setToken, logout as clearAuth, getToken } from '../utils/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = getToken();
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            if (res.data.success) {
                const { token, user } = res.data;
                setToken(token);
                localStorage.setItem('user', JSON.stringify(user));
                setUser(user);
                return { success: true };
            }
        } catch (err) {
            return { 
                success: false, 
                message: err.response?.data?.message || 'Login failed' 
            };
        }
    };

    const logout = () => {
        clearAuth();
        setUser(null);
    };

    const hasRole = (roles) => {
        if (!user) return false;
        if (Array.isArray(roles)) {
            return roles.includes(user.role);
        }
        return user.role === roles;
    };

    const isAdmin = () => user?.role === 'Admin';
    const canManageEmployees = () => ['Admin', 'HR Manager'].includes(user?.role);

    return (
        <AuthContext.Provider value={{ user, login, logout, isAdmin, hasRole, canManageEmployees, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
