import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AuthForm.css';

const ResetPasswordPage = () => {
    const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP and new password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSendOtp = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('/api/auth/send-reset-otp', { email });
            if (response.data.success) {
                setMessage('OTP sent to your email address.');
                setStep(2); // Move to the next step
            } else {
                setMessage(response.data.message);
            }
        } catch (error) {
            setMessage('Error sending OTP. Please try again.');
        }
    };

    const handleResetPassword = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('/api/auth/reset-password', { email, otp, newPassword });
            if (response.data.success) {
                alert('Password has been reset successfully! Please log in.');
                navigate('/login');
            } else {
                setMessage(response.data.message);
            }
        } catch (error) {
            setMessage('Error resetting password. The OTP may be incorrect or expired.');
        }
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
                            <div className="form-group">
                                <label htmlFor="reset-email">Email address</label>
                                <input type="email" id="reset-email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                            <button type="submit" className="btn btn-primary">Send OTP</button>
                        </form>
                    </>
                )}

                {step === 2 && (
                    <>
                        <h2>Enter OTP & New Password</h2>
                        <form onSubmit={handleResetPassword}>
                            <div className="form-group">
                                <label htmlFor="otp">OTP</label>
                                <input type="text" id="otp" placeholder="Enter the OTP from your email" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="new-password">New Password</label>
                                <input type="password" id="new-password" placeholder="Enter your new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                            </div>
                            <button type="submit" className="btn btn-primary">Reset Password</button>
                        </form>
                    </>
                )}
                
                {message && <p className="message">{message}</p>}
                <Link to="/login" className="back-link">← Back to Login</Link>
            </div>
        </div>
    );
};

export default ResetPasswordPage;