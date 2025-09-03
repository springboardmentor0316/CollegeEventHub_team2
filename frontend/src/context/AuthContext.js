import React, { createContext, useState, useContext, useEffect } from 'react';
import API from '../axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // 1. Try to load the user from localStorage when the app starts
    const [authUser, setAuthUser] = useState(() => {
        const storedUser = localStorage.getItem('authUser');
        try {
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error("Failed to parse auth user from localStorage", error);
            return null;
        }
    });

    // 2. Use useEffect to update localStorage whenever the user changes
    useEffect(() => {
        if (authUser) {
            localStorage.setItem('authUser', JSON.stringify(authUser));
        } else {
            localStorage.removeItem('authUser');
        }
    }, [authUser]);

    const login = (userData) => {
        setAuthUser(userData);
    };

    // const logout = () => {
    //     setAuthUser(null);
    // };

    const logout = async () => {
        try {
            await API.post('/api/auth/logout'); // backend clears DB token and cookie
        } catch (error) {
            console.error("Logout API error:", error);
        }
        setAuthUser(null);
        document.cookie = 'token=; Max-Age=0; path=/;';
    };
    
    const value = { user: authUser, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};