
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './StudentDashboard.css';
import DiscoverEvents from './DiscoverEvents';
import MyEvents from './MyEvents';
import Favorites from './Favorites';
import Header from './Header';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('discover');
    const [favoritedEvents, setFavoritedEvents] = useState([]);

    const handleToggleGlobalFavorite = (eventId, isFavorite) => {
        if (isFavorite) {
            // Add to favorites if not already present
            if (!favoritedEvents.some(event => event._id === eventId)) {
                // In a real app, you'd fetch the full event details here
                // For now, we'll just store the ID and basic info
                const eventToAdd = { 
                    _id: eventId, 
                    title: `Event ${eventId}`, 
                    startDate: new Date().toISOString(),
                    startTime: '10:00',
                    venue: 'Campus Location',
                    registered: 50,
                    capacity: 100
                };
                setFavoritedEvents(prev => [...prev, eventToAdd]);
            }
        } else {
            // Remove from favorites
            setFavoritedEvents(prev => prev.filter(event => event._id !== eventId));
        }
    };

    const handleNavigateToDiscover = () => {
        setActiveTab('discover');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'my-events':
                return <MyEvents />;
            case 'favorites':
                return <Favorites 
                    favoritedEvents={favoritedEvents} 
                    onToggleFavorite={handleToggleGlobalFavorite}
                    onNavigateToDiscover={handleNavigateToDiscover}
                />;
            case 'discover':
            default:
                return <DiscoverEvents onToggleFavorite={handleToggleGlobalFavorite} />;
        }
    };

    return (
        <>
            <Header />
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <div className="welcome-section">
                        <div className="avatar">
                            {user ? user.name.split(' ').map(n => n[0]).join('') : 'G'}
                        </div>
                        <div>
                            <h1>Welcome back, {user ? user.name : 'Guest'}</h1>
                            <p>Discover amazing campus events</p>
                        </div>
                    </div>
                    <div className="header-actions">
                        <button className="icon-btn">🔔</button>
                        <button className="sign-out-btn">Sign Out</button>
                    </div>
                </div>

                <nav className="dashboard-nav">
                    <button 
                        className={activeTab === 'discover' ? 'active' : ''} 
                        onClick={() => setActiveTab('discover')}>
                        Discover Events
                    </button>
                    <button 
                        className={activeTab === 'my-events' ? 'active' : ''} 
                        onClick={() => setActiveTab('my-events')}>
                        My Events
                    </button>
                    <button 
                        className={activeTab === 'favorites' ? 'active' : ''} 
                        onClick={() => setActiveTab('favorites')}>
                        Favorites
                    </button>
                </nav>

                <main className="dashboard-content">
                    {renderContent()}
                </main>
            </div>
        </>
    );
};

export default StudentDashboard;