

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthForm.css';
import API from '../axios';
import { toast } from 'react-toastify';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();

        console.log('Sending to backend:', { email, password });

        try {
            const response = await API.post('/api/auth/login', { email, password });
            const { success, message, user } = response.data;

            if (success) {
                login(user); // Save user to context
                toast.success(message || "Login successful!");

                // Redirect based on role
                if (user.role === "student") navigate('/student-dashboard');
                else if (user.role === "college_admin") navigate('/admin-dashboard');
                else navigate('/'); // fallback
            } else {
                // Account not verified
                if (message.toLowerCase().includes("verify your email")) {
                    toast.info(message);
                    navigate('/verify-email', { state: { email } });
                } else {
                    // Invalid credentials or other errors
                    toast.error(message || "Login failed. Please check your credentials.");
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error("Login failed. Please check your credentials or try again later.");
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="auth-page">
            <div className="form-container">
                <Link to="/" className="logo">
                    <i className="logo-icon">CE</i> CampusEventHub
                </Link>
                <h2>Login to your account</h2>
                
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="login-email">Email address</label>
                        <input
                            type="email"
                            id="login-email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group password-group">
                        <label htmlFor="login-password">Password</label>
                        <div className="password-input-container">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="login-password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button 
                                type="button" 
                                className="password-toggle"
                                onClick={togglePasswordVisibility}
                            >
                                {showPassword ? "🙈" : "👁️"}
                                {/* {showPassword ? "👁️" : "🙈"} */}
                            </button>
                         </div>
                    </div>

                    <div className="extra-links">
                        <span></span>
                        <Link to="/forgot-password">Forgot password?</Link>
                    </div>

                    <button type="submit" className="btn btn-primary">Login</button>
                </form>

                <p>Don't have an account? <Link to="/register">Register here</Link></p>
            </div>
        </div>
    );
};

export default LoginPage;
