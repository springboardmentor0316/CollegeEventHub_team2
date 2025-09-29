
import React, { useState, useEffect } from 'react';
import API from '../../axios';
import { toast } from 'react-toastify';
import './OverviewTab.css';

const OverviewTab = () => {
    const [stats, setStats] = useState({
        totalEvents: 0,
        activeUsers: 0,
        monthlyRegistrations: 0,
        completionRate: 0
    });
    const [pendingRegistrations, setPendingRegistrations] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            console.log("🔄 Starting to fetch dashboard data...");
            
            // Try to fetch from admin endpoints first, fallback to direct endpoints
            try {
                // Fetch dashboard stats
                console.log("📊 Fetching stats from /api/admin/dashboard/stats");
                const statsResponse = await API.get('/api/admin/dashboard/stats');
                console.log("✅ Stats response:", statsResponse.data);
                setStats(statsResponse.data);
            } catch (error) {
                console.log("❌ Admin stats endpoint not available:", error.response?.data || error.message);
                console.log("Using fallback stats calculation...");
                
                // Fallback: Calculate stats manually
                const eventsResponse = await API.get('/api/events/all_events');
                const totalEvents = eventsResponse.data.events?.length || 0;
                
                // Simple fallback stats
                setStats({
                    totalEvents,
                    activeUsers: totalEvents * 10,
                    monthlyRegistrations: totalEvents * 5,
                    completionRate: 75
                });
            }

            // Fetch pending registrations
            try {
                console.log("📋 Fetching pending registrations from /api/registrations/pending");
                // const pendingResponse = await API.get('/api/registrations/pending');
                const pendingResponse = await API.get('/api/admin/pending-registrations'); 
                console.log("✅ Pending registrations response:", pendingResponse.data);
                console.log("📝 Number of pending registrations:", pendingResponse.data.registrations?.length);
                
                if (pendingResponse.data.registrations && pendingResponse.data.registrations.length > 0) {
                    console.log("📋 Pending registrations details:");
                    pendingResponse.data.registrations.forEach((reg, index) => {
                        console.log(`  ${index + 1}. ID: ${reg._id}, Event: ${reg.event?.title}, User: ${reg.user?.name}, Status: ${reg.status}`);
                    });
                } else {
                    console.log("❌ No pending registrations found in response");
                }
                
                setPendingRegistrations(pendingResponse.data.registrations || []);
            } catch (error) {
                console.log("❌ Pending registrations endpoint error:", error.response?.data || error.message);
                console.log("❌ Full error details:", error);
                setPendingRegistrations([]);
            }

            // Fetch recent activities (fallback to static data)
            try {
                console.log("📝 Fetching activities from /api/admin/dashboard/activities");
                const activitiesResponse = await API.get('/api/admin/dashboard/activities');
                console.log("✅ Activities response:", activitiesResponse.data);
                setRecentActivities(activitiesResponse.data.activities || []);
            } catch (error) {
                console.log("❌ Activities endpoint not available:", error.response?.data || error.message);
                setRecentActivities([
                    {
                        message: "New registration for 'wd'",
                        by: "destimi",
                        timestamp: "3 hours ago"
                    },
                    {
                        message: "New registration for 'btwbg'",
                        by: "",
                        timestamp: ""
                    }
                ]);
            }

        } catch (error) {
            console.error("❌ Error fetching dashboard data:", error);
            toast.error("Error loading dashboard data");
        } finally {
            setLoading(false);
            console.log("🏁 Finished loading dashboard data");
        }
    };

    const handleApprove = async (registrationId) => {
        try {
            console.log(`✅ Approving registration: ${registrationId}`);
            await API.put(`/api/registrations/${registrationId}/status`, { 
                status: 'approved' 
            });
            toast.success("Registration approved successfully!");
            
            // Remove from pending list and update stats
            setPendingRegistrations(prev => 
                prev.filter(reg => reg._id !== registrationId)
            );
            setStats(prev => ({
                ...prev,
                monthlyRegistrations: prev.monthlyRegistrations + 1
            }));

        } catch (error) {
            console.error("❌ Error approving registration:", error);
            toast.error("Error approving registration");
        }
    };

    const handleReject = async (registrationId) => {
        try {
            console.log(`❌ Rejecting registration: ${registrationId}`);
            await API.put(`/api/registrations/${registrationId}/status`, { 
                status: 'rejected' 
            });
            toast.success("Registration rejected successfully!");
            
            // Remove from pending list
            setPendingRegistrations(prev => 
                prev.filter(reg => reg._id !== registrationId)
            );

        } catch (error) {
            console.error("❌ Error rejecting registration:", error);
            toast.error("Error rejecting registration");
        }
    };

    const refreshData = () => {
        console.log("🔄 Manually refreshing dashboard data...");
        fetchDashboardData();
    };

    if (loading) {
        return (
            <div className="overview-tab">
                <div className="loading">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="overview-tab">
            <div className="dashboard-header">
                <h1>Admin Dashboard</h1>
                <p className="dashboard-subtitle">Manage your events and registrations</p>
            </div>

            <div className="divider"></div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-number">{stats.totalEvents}</div>
                    <div className="stat-title">Total Events</div>
                    <div className="stat-description">Your created events</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats.activeUsers}</div>
                    <div className="stat-title">Active Users</div>
                    <div className="stat-description">Registered for your events</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats.monthlyRegistrations}</div>
                    <div className="stat-title">This Month Registrations</div>
                    <div className="stat-description">For your events</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats.completionRate}%</div>
                    <div className="stat-title">Completion Rate</div>
                    <div className="stat-description">Your event success rate</div>
                </div>
            </div>
            
            <div className="content-grid">
                <div className="content-section">
                    <h3 className="section-title">Recent Activities</h3>
                    <div className="activities-list">
                        {recentActivities.length > 0 ? (
                            recentActivities.map((activity, index) => (
                                <div key={index} className="activity-item">
                                    <div className="activity-message">
                                        <strong>{activity.message}</strong>
                                        {activity.by && (
                                            <span className="activity-meta">
                                                by {activity.by} {activity.timestamp && `- ${activity.timestamp}`}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="activity-item">
                                <div className="activity-message">No recent activities</div>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="content-section">
                    <div className="section-header">
                        <h3 className="section-title">Pending Approvals</h3>
                        <div className="section-subtitle">Your Events Only</div>
                    </div>
                    
                    {pendingRegistrations.length > 0 ? (
                        <div className="approvals-list">
                            {pendingRegistrations.map(registration => (
                                <div key={registration._id} className="approval-item">
                                    <div className="approval-content">
                                        <div className="approval-title">
                                            <strong>New registration for "{registration.event?.title || 'Unknown Event'}"</strong>
                                        </div>
                                        <div className="approval-details">
                                            <span>by {registration.user?.name || 'Unknown User'}</span>
                                            {registration.event?.startDate && (
                                                <span> - {new Date(registration.event.startDate).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="approval-actions">
                                        <button 
                                            className="btn btn-approve"
                                            onClick={() => handleApprove(registration._id)}
                                        >
                                            Approve
                                        </button>
                                        <button 
                                            className="btn btn-reject"
                                            onClick={() => handleReject(registration._id)}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>No pending registrations to approve</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;






