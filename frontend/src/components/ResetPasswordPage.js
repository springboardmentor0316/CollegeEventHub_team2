

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../axios';
import './AuthForm.css';
import { toast } from 'react-toastify';

const ResetPasswordPage = () => {
    const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP and new password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSendOtp = async (event) => {
        event.preventDefault();
        try {
            const response = await API.post('/api/auth/send-reset-otp', { email });
            if (response.data.success) {
                toast.success('OTP sent to your email address.');
                setStep(2); // Move to the next step
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error('Error sending OTP. Please try again.');
        }
    };

    const handleResetPassword = async (event) => {
        event.preventDefault();
        try {
            const response = await API.post('/api/auth/reset-password', { email, otp, newPassword });
             if (newPassword !== confirmPassword) {
                        toast.error("Passwords do not match!");
                        return;
                 }
                 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                         if (!emailRegex.test(email)) {
                             toast.error("Please enter a valid email address");
                             return;
                         }
            if (response.data.success) {
                toast.success('Password has been reset successfully! Please log in.');
                navigate('/login');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error('Error resetting password. The OTP may be incorrect or expired.');
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="auth-page">
            <div className="form-container">
                <Link to="/" className="logo"><i className="logo-icon">CE</i> CampusEventHub</Link>
                
                {step === 1 && (
                    <>
                        <h2>Reset your password</h2>
                        <p className="form-subtitle">Enter your email address to receive an OTP</p>
                        <form onSubmit={handleSendOtp}>
                            <div className="form-group ">
                                <label htmlFor="reset-email">Email address</label>
                                <input 
                                    type="email" 
                                    id="reset-email" 
                                    placeholder="Enter your email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    required 
                                />
                            </div>
                            <button type="submit" className="btn btn-primary">Send OTP</button>
                        </form>
                    </>
                )}

                {step === 2 && (
                    <>
                        <h2>Enter OTP & New Password</h2>
                        <form onSubmit={handleResetPassword}>
                            <div className="form-group password-group">
                                <label htmlFor="otp">OTP</label>
                                <div className="password-input-container">
                                <input 
                                    type="text" 
                                    id="otp" 
                                    placeholder="Enter the OTP from your email" 
                                    value={otp} 
                                    onChange={(e) => setOtp(e.target.value)} 
                                    required 
                                />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="new-password">New Password</label>
                                <div className="password-input-container">
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    id="new-password" 
                                    placeholder="Enter your new password" 
                                    value={newPassword} 
                                    onChange={(e) => setNewPassword(e.target.value)} 
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


                            <div className="form-group password-group">
                        <label htmlFor="reg-confirm-password">Confirm Password</label>
                        <div className="password-input-container">
                        <input 
                            type={showPassword ? "text" : "password"}
                            id="reg-confirm-password" 
                            placeholder="Confirm your password" 
                            required
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
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

                            <button type="submit" className="btn btn-primary">Reset Password</button>
                        </form>
                    </>
                )}

                <Link to="/login" className="back-link">← Back to Login</Link>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
