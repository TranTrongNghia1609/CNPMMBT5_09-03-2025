import { createContext, useContext, useState, useEffect } from 'react';
import { loginAPI, logoutAPI, getProfileAPI, registerAPI } from '../util/api';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Kiểm tra authentication khi app load
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const response = await getProfileAPI();
                setUser(response.data.user);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Auth check failed:', error);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                setIsAuthenticated(false);
            }
        }
        setLoading(false);
    };

    const login = async (credentials) => {
        try {
            const response = await loginAPI(credentials);
            const { user, accessToken, refreshToken } = response.data;
            
            // Lưu tokens vào localStorage
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            
            setUser(user);
            setIsAuthenticated(true);
            
            return { success: true, user };
        } catch (error) {
            console.error('Login failed:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Login failed' 
            };
        }
    };

    const logout = async () => {
        try {
            await logoutAPI();
        } catch (error) {
            console.error('Logout API failed:', error);
        } finally {
            // Clear tokens và state
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const register = async (userData) => {
        try {
            const response = await registerAPI(userData);
            return { 
                success: true, 
                message: response.data.message 
            };
        } catch (error) {
            console.error('Registration failed:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Registration failed' 
            };
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        register,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;