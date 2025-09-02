import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
    return (
        <div className="landing-page">
            <header>
                <nav className="container">
                    <Link to="/" className="logo"><i className="logo-icon">CE</i> CampusEventHub</Link>
                    <div className="nav-links">
                        <Link to="#">About</Link>
                        <Link to="#">Features</Link>
                        <Link to="#">Contact</Link>
                        <Link to="/login" className="btn btn-primary">Login</Link>
                    </div>
                </nav>
            </header>

            <main>
                <section className="hero">
                    <div className="container">
                        <h1>Welcome to CampusEventHub</h1>
                        <p>Centralized platform for managing and joining college events</p>
                        <div className="btn-group">
                            <Link to="/login" className="btn btn-primary">Login</Link>
                            <Link to="/register" className="btn btn-secondary">Register</Link>
                        </div>
                    </div>
                </section>

                <section className="features">
                    <div className="container">
                        <h2>Platform Features</h2>
                        <div className="features-grid">
                            <div className="feature-card">
                                <span className="icon">📅</span>
                                <h3>Event Creation</h3>
                                <p>Create and manage college events with ease using our intuitive interface.</p>
                            </div>
                            <div className="feature-card">
                                <span className="icon">👥</span>
                                <h3>Student Participation</h3>
                                <p>Join events, track registrations, and receive updates about upcoming activities.</p>
                            </div>
                            <div className="feature-card">
                                <span className="icon">📊</span>
                                <h3>Analytics</h3>
                                <p>Track event performance, attendance, and engagement with detailed analytics.</p>
                            </div>
                        </div>
                    </div>
                </section>
                
                <section className="cta">
                    <div className="container">
                        <h2>Ready to Get Started?</h2>
                        <p>Join CampusEventHub today and transform how you manage college events.</p>
                        <div className="btn-group">
                            <Link to="/login" className="btn btn-primary">Login</Link>
                            <Link to="/register" className="btn btn-secondary">Register</Link>
                        </div>
                    </div>
                </section>
            </main>
            
            <footer>
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-logo">
                            <Link to="/" className="logo"><i className="logo-icon">CE</i> CampusEventHub</Link>
                        </div>
                        <div className="footer-links">
                            <Link to="#">About</Link>
                            <Link to="#">Features</Link>
                            <Link to="#">Contact</Link>
                            <Link to="#">Privacy</Link>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        &copy; 2025 CampusEventHub. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;