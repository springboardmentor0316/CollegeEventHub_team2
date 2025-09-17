import React from 'react';

const AnalyticsTab = () => {
    return(
        <div className="panel full-width">
             <h3>Analytics & Reports</h3>
             <div className="panels-grid">
                <div className="panel">
                    <h4>Event Performance</h4>
                    <ul className="performance-list">
                        <li><label>Average Registration Rate</label><div className="progress-bar"><div style={{width: '87%'}}></div></div><span>87%</span></li>
                        <li><label>Average Attendance Rate</label><div className="progress-bar"><div style={{width: '94%'}}></div></div><span>94%</span></li>
                        <li><label>User Satisfaction</label><div className="progress-bar"><div style={{width: '96%'}}></div></div><span>4.8/5.0</span></li>
                    </ul>
                </div>
                <div className="panel">
                    <h4>Popular Event Categories</h4>
                    <ul className="categories-list">
                         <li><label>Technology</label><div className="progress-bar"><div style={{width: '32%', backgroundColor: '#3498db'}}></div></div><span>32%</span></li>
                         <li><label>Career & Networking</label><div className="progress-bar"><div style={{width: '28%', backgroundColor: '#2ecc71'}}></div></div><span>28%</span></li>
                         <li><label>Arts & Culture</label><div className="progress-bar"><div style={{width: '20%', backgroundColor: '#9b59b6'}}></div></div><span>20%</span></li>
                         <li><label>Sports & Recreation</label><div className="progress-bar"><div style={{width: '12%', backgroundColor: '#e67e22'}}></div></div><span>12%</span></li>
                         <li><label>Academic</label><div className="progress-bar"><div style={{width: '8%', backgroundColor: '#f1c40f'}}></div></div><span>8%</span></li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
export default AnalyticsTab;