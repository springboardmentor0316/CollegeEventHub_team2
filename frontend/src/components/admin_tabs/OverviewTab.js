import React from 'react';

const OverviewTab = () => {
    return (
        <div className="overview-tab">
            <div className="stats-grid">
                <div className="stat-card"><h4>Total Events</h4><p>186</p><span>+5% from last month</span></div>
                <div className="stat-card"><h4>Active Users</h4><p>3,247</p><span>+12% from last month</span></div>
                <div className="stat-card"><h4>This Month Registrations</h4><p>1,892</p><span>+15% from last month</span></div>
                <div className="stat-card"><h4>Event Completion Rate</h4><p>94.2%</p><span>+2.1% from last month</span></div>
            </div>
            <div className="panels-grid">
                <div className="panel">
                    <h3>Recent Activities</h3>
                    <ul className="activity-list">
                        <li>Event "Tech Summit" published <span>by Sarah Admin • 5 minutes ago</span></li>
                        <li>New user registration: John Doe <span>by System • 6 minutes ago</span></li>
                        <li>Event capacity updated: Art Exhibition <span>by Mike Admin • 1 hour ago</span></li>
                        <li>High registration volume detected <span>by System • 2 hours ago</span></li>
                    </ul>
                </div>
                <div className="panel">
                    <h3>Pending Approvals</h3>
                    <ul className="approval-list">
                        <li><span className="priority high">High Priority</span><p>Entrepreneurship Workshop</p><button>Approve</button><button>Reject</button></li>
                        <li><span className="priority medium">Medium Priority</span><p>Coding Competition</p><button>Approve</button><button>Reject</button></li>
                        <li><span className="priority high">High Priority</span><p>Cultural Festival</p><button>Approve</button><button>Reject</button></li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
export default OverviewTab;