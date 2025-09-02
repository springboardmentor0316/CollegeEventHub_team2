import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
    return (
        <header className="main-header">
            <div className="header-left">
                <Link to="/" className="logo">
                    <i className="logo-icon">CE</i> CampusEventHub
                </Link>
                <span className="preview-mode">Preview Mode</span>
            </div>
            <nav className="header-nav">
                <Link to="/" className="nav-item">
                    <span className="nav-icon">🏠</span> Landing
                </Link>
                <Link to="/student-dashboard" className="nav-item active">
                    <span className="nav-icon">👤</span> Student Dashboard
                </Link>
                <Link to="/admin-dashboard" className="nav-item">
                    <span className="nav-icon">⚙️</span> Admin Dashboard
                </Link>
                <Link to="/events" className="nav-item">
                    <span className="nav-icon">📋</span> Event Listing
                </Link>
                <Link to="/create-event" className="nav-item">
                    <span className="nav-icon">➕</span> Create Event
                </Link>
                <Link to="/login" className="nav-item">
                    <span className="nav-icon">→</span> Auth Flow
                </Link>
            </nav>
        </header>
    );
};

export default Header;