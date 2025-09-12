import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../axios';

const VerifyEmailPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const verifyToken = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');
            if (!token) {
                toast.error("Verification link not found. Please check your email.");
                setLoading(false);
                return;
            }
    
            try {
                const response = await API.post('/api/auth/verify-email', { token });
                if (response.data.success) {
                    toast.success("Email verified successfully!");
                    if (response.data.role === 'student') navigate('/student-dashboard');
                    else if (response.data.role === 'college_admin') navigate('/admin-dashboard');
                } else {
                    toast.error(response.data.message);
                }
            } catch (error) {
                toast.error("Verification failed. Please try again.");
            } finally {
                setLoading(false);
            }
        };
    
        // Only run verifyToken if token exists
        if (window.location.search.includes('token=')) {
            verifyToken();
        } else {
            setLoading(false);
        }
    }, [navigate]);
    

    return (
        <div className="auth-page">
            {loading ? <h2>Verifying your email...</h2> : <h2>Redirecting...</h2>}
        </div>
    );
};

export default VerifyEmailPage;
