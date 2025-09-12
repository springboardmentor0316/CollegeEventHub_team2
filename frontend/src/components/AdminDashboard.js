
import React, { useState } from 'react';
import Header from './Header';
import OverviewTab from './admin_tabs/OverviewTab';
import EventsTab from './admin_tabs/EventsTab';
import UsersTab from './admin_tabs/UsersTab';
import AnalyticsTab from './admin_tabs/AnalyticsTab';
import MyEventsTab from './admin_tabs/MyEventsTab';
import CreateEventPage from './CreateEventPage';
import './AdminDashboard.css';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [newEvent, setNewEvent] = useState(null); 
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const renderContent = () => {
    if (showCreateForm) {
      return (
        <CreateEventPage
          setShowCreateForm={setShowCreateForm}
          setNewEvent={setNewEvent}
          editingEvent={editingEvent}
          setEditingEvent={setEditingEvent}
          setActiveTab={setActiveTab}
        />
      );
    }

    switch (activeTab) {
      case 'events':
        return <EventsTab />;
      case 'my-events':
        return (
          <MyEventsTab
            newEvent={newEvent}
            setNewEvent={setNewEvent}
            setShowCreateForm={setShowCreateForm}
            setEditingEvent={setEditingEvent}
          />
        );
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
              <h1>Welcome back, {user?.name || user?.email || 'Admin'}</h1>
              <p>CampusEventHub Admin</p>
            </div>
          </div>
          {/* <div className="header-actions">
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingEvent(null);
                setShowCreateForm(true);
              }}
            >
              + Create Event
            </button>
            <button className="btn-secondary">Settings</button>
            <button className="btn-secondary">Sign Out</button>
          </div> */}
        </header>

        <nav className="dashboard-nav">
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={activeTab === 'events' ? 'active' : ''} onClick={() => setActiveTab('events')}>All Events</button>
          <button className={activeTab === 'my-events' ? 'active' : ''} onClick={() => setActiveTab('my-events')}>My Events</button>
          <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>Users</button>
          <button className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>Analytics</button>
        </nav>

        <main className="dashboard-content">{renderContent()}</main>
      </div>
    </>
  );
};

export default AdminDashboard;