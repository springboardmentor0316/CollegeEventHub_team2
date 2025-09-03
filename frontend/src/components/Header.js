

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();           // Clear auth context & cookies
        navigate('/login'); // Redirect to login page
    };

    return (
        <header className="main-header">
            <div className="header-left">
                <Link to="/" className="logo">
                    <i className="logo-icon">CE</i> CampusEventHub
                </Link>
            </div>

            <nav className="header-nav">
                {/* <Link to="/" className="nav-item">🏠 Landing</Link> */}

                {user ? (
                    <>
                        {user.role === 'student' && (
                            <Link to="/student-dashboard" className="nav-item">👤 Student Dashboard</Link>
                        )}
                        {user.role === 'college_admin' && (
                            <>
                                <Link to="/admin-dashboard" className="nav-item">⚙️ Admin Dashboard</Link>
                                <Link to="/create-event" className="nav-item">➕ Create Event</Link>
                                {/* <Link to="/events" className="nav-item">📋 Event Listing</Link> */}
                            </>
                        )}
                        <button onClick={handleLogout} className="nav-item logout-button">⏻ Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-item">→ Login</Link>
                        <Link to="/register" className="nav-item">📝 Register</Link>
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header;
