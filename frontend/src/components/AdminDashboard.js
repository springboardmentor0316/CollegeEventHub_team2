import React, { useState } from 'react';
import Header from './Header'; // Reusing the main header
import OverviewTab from './admin_tabs/OverviewTab';
import EventsTab from './admin_tabs/EventsTab';
import UsersTab from './admin_tabs/UsersTab';
import AnalyticsTab from './admin_tabs/AnalyticsTab';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const renderContent = () => {
        switch (activeTab) {
            case 'events':
                return <EventsTab />;
            case 'users':
                return <UsersTab />;
            case 'analytics':
                return <AnalyticsTab />;
            case 'overview':
            default:
                return <OverviewTab />;
        }
    };

    return (
        <>
            <Header />
            <div className="admin-dashboard">
                <header className="dashboard-header">
                    <div className="welcome-section">
                        <div className="avatar admin-avatar">AU</div>
                        <div>
                            <h1>Welcome back, Admin User</h1>
                            <p>CampusEventHub Admin</p>
                        </div>
                    </div>
                    <div className="header-actions">
                        <button className="btn btn-primary">+ Create Event</button>
                        <button className="btn-secondary">Settings</button>
                        <button className="btn-secondary">Sign Out</button>
                    </div>
                </header>

                <nav className="dashboard-nav">
                    <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</button>
                    <button className={activeTab === 'events' ? 'active' : ''} onClick={() => setActiveTab('events')}>Events</button>
                    <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>Users</button>
                    <button className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>Analytics</button>
                </nav>

                <main className="dashboard-content">
                    {renderContent()}
                </main>
            </div>
        </>
    );
};

export default AdminDashboard;