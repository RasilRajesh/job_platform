import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loginUser, registerUser } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('user');
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });
    const [token, setToken] = useState(() => localStorage.getItem('token'));

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const persistAuth = (nextUser, nextToken) => {
        const normalized = {
            ...nextUser,
            id: nextUser.id || nextUser._id
        };
        localStorage.setItem('token', nextToken);
        localStorage.setItem('user', JSON.stringify(normalized));
        setToken(nextToken);
        setUser(normalized);
    };

    const login = async (credentials) => {
        const data = await loginUser(credentials);
        persistAuth(data.user, data.token);
        return data.user;
    };

    // Register now returns token directly — no second login call needed
    const register = async (payload) => {
        const data = await registerUser(payload);
        persistAuth(data.user, data.token);
        return data.user;
    };

    // Listen for forced logout events (e.g. 401 from API)
    useEffect(() => {
        const handleLogout = () => logout();
        window.addEventListener('auth:logout', handleLogout);
        return () => window.removeEventListener('auth:logout', handleLogout);
    }, []);

    const value = useMemo(() => ({
        user,
        token,
        isAuthenticated: Boolean(token && user),
        login,
        register,
        logout
    }), [user, token]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
