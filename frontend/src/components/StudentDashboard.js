import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './StudentDashboard.css';
import DiscoverEvents from './DiscoverEvents';
import MyEvents from './MyEvents';
import Favorites from './Favorites';
import Header from './Header';

const StudentDashboard = () => {
    const { user } = useAuth(); // 2. Get the user object from the context
    const [activeTab, setActiveTab] = useState('discover');
    // Global state for favorited events, initially empty
    const [favoritedEvents, setFavoritedEvents] = useState([]);

    const handleToggleGlobalFavorite = (eventId, isFavorite) => {
        if (isFavorite) {
            // Add to favorites if not already present
            if (!favoritedEvents.some(event => event.id === eventId)) {
                // In a real app, you'd fetch the full event details here
                // For now, let's assume DiscoverEvents passes enough info or you retrieve it.
                // For simplicity, let's mock it for now.
                const eventToAdd = { id: eventId, title: `Event ${eventId}`, date: 'Date', location: 'Location' }; // Mock data
                setFavoritedEvents(prev => [...prev, eventToAdd]);
            }
        } else {
            // Remove from favorites
            setFavoritedEvents(prev => prev.filter(event => event.id !== eventId));
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'my-events':
                return <MyEvents />;
            case 'favorites':
                return <Favorites favoritedEvents={favoritedEvents} />; // Pass favorites to the Favorites tab
            case 'discover':
            default:
                return <DiscoverEvents onToggleFavorite={handleToggleGlobalFavorite} />; // Pass handler to DiscoverEvents
        }
    };

    return (
        <>
            <Header />
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <div className="welcome-section">
                        {/* 3. Display user's initials and name dynamically */}
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