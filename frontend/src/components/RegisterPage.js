import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // 1. Import axios
import './AuthForm.css';

const RegisterPage = () => {
    // 2. Create state variables to hold the form data
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [college, setCollege] = useState('');
    const [role, setRole] = useState('student'); // Default role
    const navigate = useNavigate();

    // 3. Update the handleRegister function to send data
    const handleRegister = async (event) => {
        event.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return; // Stop the function if they don't match
        }

        try {
            const response = await axios.post('/api/auth/register', {
                name,
                email,
                password,
                college,
                role
            });

            if (response.data.success) {
                // Navigate to the success page ONLY if the backend confirms it
                navigate('/registration-success');
            } else {
                alert('Registration failed: ' + response.data.message);
            }
        } catch (error) {
            alert('An error occurred during registration. Please try again.');
            console.error('Registration error:', error);
        }
    };

    return (
        <div className="auth-page">
            <div className="form-container">
                <Link to="/" className="logo"><i className="logo-icon">CE</i> CampusEventHub</Link>
                <h2>Create your account</h2>
                <form onSubmit={handleRegister}>
                    {/* 4. Connect inputs to state with value and onChange */}
                    <div className="form-group">
                        <label htmlFor="reg-name">Full Name</label>
                        <input type="text" id="reg-name" placeholder="Enter your full name" required 
                               value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="reg-email">Email address</label>
                        <input type="email" id="reg-email" placeholder="Enter your email" required
                               value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="reg-password">Password</label>
                        <input type="password" id="reg-password" placeholder="Create a password" required
                               value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="reg-confirm-password">Confirm Password</label>
                        <input 
                            type="password" 
                            id="reg-confirm-password" 
                            placeholder="Confirm your password" 
                            required
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="reg-college">College</label>
                        <select id="reg-college" required
                                value={college} onChange={(e) => setCollege(e.target.value)}>
                            <option value="">Select your college</option>
                            <option value="University of Technology">University of Technology</option>
                            <option value="Institute of Science">Institute of Science</option>
                            <option value="National College of Arts">National College of Arts</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Role</label>
                        <div className="role-selector" onChange={(e) => setRole(e.target.value)}>
                            <label>
                                <input type="radio" name="role" value="student" defaultChecked /> Student
                            </label>
                            <label>
                                <input type="radio" name="role" value="college_admin" /> College Admin
                            </label>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary">Register</button>
                </form>
                <p>Already have an account? <Link to="/login">Login here</Link></p>
            </div>
        </div>
    );
};

export default RegisterPage;