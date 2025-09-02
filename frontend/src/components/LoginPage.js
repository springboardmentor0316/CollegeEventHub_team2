import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './AuthForm.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    // Function to handle form submission
    const handleLogin = async (event) => {
        event.preventDefault();

    // Add this line for debugging
    console.log('Sending to backend:', { email, password });

    try {
        const response = await axios.post('/api/auth/login', { email, password });

        // CRITICAL CHECK: Only proceed if the backend says the login was successful.
        if (response.data.success) {
            login(response.data.user);
            navigate('/student-dashboard'); // Navigate to the dashboard
        } else {
            // If success is false, show the error message from the backend.
            alert('Login failed: ' + response.data.message);
        }

    } catch (error) {
        // This handles network errors or if the backend sends a non-200 status code.
        alert('Login failed. Please check your credentials.');
        console.error('Login error:', error);
    }
};

    return (
        <div className="auth-page">
            <div className="form-container">
                <Link to="/" className="logo"><i className="logo-icon">CE</i> CampusEventHub</Link>
                <h2>Login to your account</h2>
                
                {/* Add onSubmit to the form tag */}
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
                    <div className="form-group">
                        <label htmlFor="login-password">Password</label>
                        <input
                            type="password"
                            id="login-password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
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