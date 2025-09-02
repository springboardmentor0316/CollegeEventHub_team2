import React from 'react';

const UsersTab = () => {
    return(
        <div className="panels-grid">
            <div className="panel">
                <h3>User Statistics</h3>
                <ul className="user-stats-list">
                    <li><span>Active Students</span><span>3,024</span></li>
                    <li><span>Faculty Members</span><span>156</span></li>
                    <li><span>Event Organizers</span><span>67</span></li>
                    <li><span>New This Month</span><span>+247</span></li>
                </ul>
            </div>
            <div className="panel">
                <h3>Recent User Activity</h3>
                <ul className="user-activity-list">
                    <li>John Smith - Registered for Tech Summit <span>21m ago</span></li>
                    <li>Sarah Johnson - Created new event proposal <span>37m ago</span></li>
                    <li>Mike Chen - Updated profile information <span>49m ago</span></li>
                    <li>Lisa Wong - Cancelled event registration <span>1hr ago</span></li>
                </ul>
            </div>
        </div>
    );
};
export default UsersTab;