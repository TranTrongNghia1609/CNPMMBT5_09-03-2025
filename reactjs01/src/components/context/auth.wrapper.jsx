import { useState } from 'react';
import { useAuth } from './auth.context';

const AuthWrapper = ({ children }) => {
    const { loading, isAuthenticated } = useAuth();

    if (loading) {
        return (
            <div className="loading-wrapper">
                <div className="loading-spinner">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="auth-required">
                <h3>Authentication Required</h3>
                <p>Please login to access this page.</p>
                <a href="/login">Go to Login</a>
            </div>
        );
    }

    return children;
};

export default AuthWrapper;