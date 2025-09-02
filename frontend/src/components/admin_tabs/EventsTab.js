import React from 'react';

const EventsTab = () => {
    return(
        <div className="panel full-width">
            <h3>Event Management</h3>
            <ul className="event-management-list">
                <li><p>Tech Innovation Summit</p><span className="status published">Published</span><span>Technology</span><div className="actions"><button>👁️</button><button>✏️</button><button>🗑️</button></div></li>
                <li><p>Student Art Exhibition</p><span className="status draft">Draft</span><span>Arts</span><div className="actions"><button>👁️</button><button>✏️</button><button>🗑️</button></div></li>
                <li><p>Alumni Networking Dinner</p><span className="status published">Published</span><span>Networking</span><div className="actions"><button>👁️</button><button>✏️</button><button>🗑️</button></div></li>
            </ul>
        </div>
    );
};
export default EventsTab;