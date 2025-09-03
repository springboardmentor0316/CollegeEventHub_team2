import React from 'react';
import { Link } from 'react-router-dom';
import './AuthForm.css'; // We reuse the same CSS for a consistent look
import API from '../axios';

const RegistrationSuccess = () => {
    return (
        <div className="auth-page">
            <div className="form-container text-center">
                <div className="success-icon">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#2ECC71"/>
                    </svg>
                </div>
                <h2>Registration Successful!</h2>
                <p className="form-subtitle">Your account has been created. You can now sign in.</p>
                <Link to="/login" className="btn btn-primary">Go to Login</Link>
            </div>
        </div>
    );
};

export default RegistrationSuccess;