// events.js - Campus Event Hub Event Management Functions

// Initialize events data
function initializeEvents() {
    if (!localStorage.getItem('events')) {
        localStorage.setItem('events', JSON.stringify(getMockEvents()));
    }
}

// Get mock events data
function getMockEvents() {
    return [
        {
            id: 'event-1',
            title: 'Annual Tech Symposium',
            description: 'Join us for the biggest technology conference of the year featuring keynote speakers, workshops, and networking opportunities.',
            category: 'conference',
            location: 'Main Auditorium',
            start_date: '2024-03-15T09:00:00',
            end_date: '2024-03-15T17:00:00',
            max_participants: 200,
            participants: 145,
            organizer: 'admin-1',
            image: 'https://via.placeholder.com/400x200/4F46E5/FFFFFF?text=Tech+Symposium',
            requirements: 'Laptop recommended for workshops',
            status: 'upcoming',
            created_at: '2024-01-15T10:00:00'
        },
        {
            id: 'event-2',
            title: 'Basketball Tournament',
            description: 'Inter-college basketball championship. Show your skills and team spirit!',
            category: 'sports',
            location: 'College Gymnasium',
            start_date: '2024-03-20T14:00:00',
            end_date: '2024-03-20T18:00:00',
            max_participants: 50,
            participants: 42,
            organizer: 'admin-2',
            image: 'https://via.placeholder.com/400x200/DC2626/FFFFFF?text=Basketball+Tournament',
            requirements: 'Sports attire and shoes required',
            status: 'upcoming',
            created_at: '2024-01-20T11:30:00'
        },
        {
            id: 'event-3',
            title: 'Code Hackathon 2024',
            description: '24-hour coding competition. Build innovative solutions and win exciting prizes!',
            category: 'hackathon',
            location: 'Computer Lab B',
            start_date: '2024-04-05T10:00:00',
            end_date: '2024-04-06T10:00:00',
            max_participants: 100,
            participants: 78,
            organizer: 'admin-1',
            image: 'https://via.placeholder.com/400x200/059669/FFFFFF?text=Code+Hackathon',
            requirements: 'Basic programming knowledge, team of 2-4 members',
            status: 'upcoming',
            created_at: '2024-02-01T09:15:00'
        },
        {
            id: 'event-4',
            title: 'Cultural Fest',
            description: 'Annual cultural festival showcasing dance, music, and art from various traditions.',
            category: 'cultural',
            location: 'Open Amphitheater',
            start_date: '2024-03-25T16:00:00',
            end_date: '2024-03-25T21:00:00',
            max_participants: 300,
            participants: 267,
            organizer: 'admin-3',
            image: 'https://via.placeholder.com/400x200/7C3AED/FFFFFF?text=Cultural+Fest',
            requirements: 'None',
            status: 'upcoming',
            created_at: '2024-02-10T14:20:00'
        },
        {
            id: 'event-5',
            title: 'AI Workshop',
            description: 'Hands-on workshop on Artificial Intelligence and Machine Learning fundamentals.',
            category: 'workshop',
            location: 'Tech Lab A',
            start_date: '2024-03-18T13:00:00',
            end_date: '2024-03-18T16:00:00',
            max_participants: 30,
            participants: 30,
            organizer: 'admin-1',
            image: 'https://via.placeholder.com/400x200/0D9488/FFFFFF?text=AI+Workshop',
            requirements: 'Basic Python knowledge, laptop required',
            status: 'upcoming',
            created_at: '2024-02-15T10:45:00'
        }
    ];
}

// Load events page
function loadEventsPage() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const events = getAllEvents();
    
    const eventsHTML = `
        <div class="navbar">
            <div class="container">
                <a href="#" class="navbar-brand">CampusEventHub</a>
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a href="#" class="nav-link" data-page="dashboard" onclick="${user.role === 'admin' ? 'loadAdminDashboard()' : 'loadStudentDashboard()'}">Dashboard</a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link active" data-page="events" onclick="loadEventsPage()">Events</a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link" data-page="profile">Profile</a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link" onclick="logout()">Logout</a>
                    </li>
                </ul>
            </div>
        </div>
        
        <div class="events-page container">
            <div class="page-header">
                <h1>All Events</h1>
                <p>Discover and register for exciting inter-college events</p>
                
                ${user.role === 'admin' ? `
                <div class="page-actions">
                    <button class="btn" onclick="showCreateEventForm()">+ Create New Event</button>
                </div>
                ` : ''}
            </div>
            
            <div class="filters">
                <div class="filter-group">
                    <label for="categoryFilter">Category:</label>
                    <select id="categoryFilter" onchange="filterEvents()">
                        <option value="">All Categories</option>
                        <option value="sports">Sports</option>
                        <option value="hackathon">Hackathon</option>
                        <option value="cultural">Cultural</option>
                        <option value="workshop">Workshop</option>
                        <option value="conference">Conference</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="statusFilter">Status:</label>
                    <select id="statusFilter" onchange="filterEvents()">
                        <option value="">All Status</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="searchInput">Search:</label>
                    <input type="text" id="searchInput" placeholder="Search events..." oninput="filterEvents()">
                </div>
            </div>
            
            <div class="events-grid" id="eventsGrid">
                ${renderEventsGrid(events)}
            </div>
        </div>
    `;
    
    loadPage('events', eventsHTML);
}

// Render events grid
function renderEventsGrid(events) {
    if (events.length === 0) {
        return '<div class="no-events"><p>No events found matching your criteria.</p></div>';
    }
    
    return events.map(event => `
        <div class="event-card" data-event-id="${event.id}">
            <div class="event-image">
                <img src="${event.image}" alt="${event.title}">
                <span class="event-category">${event.category}</span>
            </div>
            
            <div class="event-content">
                <h3>${event.title}</h3>
                <p class="event-description">${event.description.substring(0, 100)}...</p>
                
                <div class="event-details">
                    <div class="event-detail">
                        <i class="fas fa-calendar"></i>
                        <span>${formatDate(event.start_date)}</span>
                    </div>
                    
                    <div class="event-detail">
                        <i class="fas fa-clock"></i>
                        <span>${formatTime(event.start_date)} - ${formatTime(event.end_date)}</span>
                    </div>
                    
                    <div class="event-detail">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${event.location}</span>
                    </div>
                    
                    <div class="event-detail">
                        <i class="fas fa-users"></i>
                        <span>${event.participants} / ${event.max_participants} participants</span>
                    </div>
                </div>
                
                <div class="event-actions">
                    <button class="btn" onclick="viewEvent('${event.id}')">View Details</button>
                    ${event.participants < event.max_participants ? `
                    <button class="btn btn-primary" onclick="registerForEvent('${event.id}')">Register</button>
                    ` : `
                    <button class="btn btn-disabled" disabled>Full</button>
                    `}
                </div>
            </div>
        </div>
    `).join('');
}

// View event details
function viewEvent(eventId) {
    const event = getEventById(eventId);
    const user = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!event) {
        alert('Event not found!');
        return;
    }
    
    const eventDetailHTML = `
        <div class="event-detail-modal">
            <div class="modal-header">
                <h2>${event.title}</h2>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            
            <div class="modal-body">
                <div class="event-detail-image">
                    <img src="${event.image}" alt="${event.title}">
                </div>
                
                <div class="event-detail-info">
                    <div class="event-meta">
                        <span class="event-category">${event.category}</span>
                        <span class="event-status">${event.status}</span>
                    </div>
                    
                    <p class="event-full-description">${event.description}</p>
                    
                    <div class="event-details-grid">
                        <div class="detail-item">
                            <i class="fas fa-calendar"></i>
                            <div>
                                <strong>Date</strong>
                                <p>${formatDate(event.start_date)}</p>
                            </div>
                        </div>
                        
                        <div class="detail-item">
                            <i class="fas fa-clock"></i>
                            <div>
                                <strong>Time</strong>
                                <p>${formatTime(event.start_date)} - ${formatTime(event.end_date)}</p>
                            </div>
                        </div>
                        
                        <div class="detail-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <div>
                                <strong>Location</strong>
                                <p>${event.location}</p>
                            </div>
                        </div>
                        
                        <div class="detail-item">
                            <i class="fas fa-users"></i>
                            <div>
                                <strong>Participants</strong>
                                <p>${event.participants} / ${event.max_participants}</p>
                            </div>
                        </div>
                    </div>
                    
                    ${event.requirements ? `
                    <div class="event-requirements">
                        <h4>Requirements</h4>
                        <p>${event.requirements}</p>
                    </div>
                    ` : ''}
                    
                    <div class="event-actions">
                        ${user.role === 'admin' ? `
                        <button class="btn btn-secondary" onclick="editEvent('${event.id}')">Edit Event</button>
                        <button class="btn btn-danger" onclick="deleteEvent('${event.id}')">Delete Event</button>
                        ` : `
                        ${event.participants < event.max_participants ? `
                        <button class="btn btn-primary" onclick="registerForEvent('${event.id}')">Register Now</button>
                        ` : `
                        <button class="btn btn-disabled" disabled>Event Full</button>
                        `}
                        `}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    showModal(eventDetailHTML);
}

// Register for event
function registerForEvent(eventId) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const event = getEventById(eventId);
    
    if (!user) {
        alert('Please login to register for events.');
        return;
    }
    
    if (event.participants >= event.max_participants) {
        alert('This event is already full.');
        return;
    }
    
    // Check if user is already registered
    const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
    const existingRegistration = registrations.find(reg => 
        reg.eventId === eventId && reg.userId === user.id
    );
    
    if (existingRegistration) {
        alert('You are already registered for this event.');
        return;
    }
    
    // Register user
    registrations.push({
        id: 'reg-' + Date.now(),
        eventId: eventId,
        userId: user.id,
        registeredAt: new Date().toISOString(),
        status: 'confirmed'
    });
    
    // Update event participants count
    event.participants++;
    updateEvent(event);
    
    localStorage.setItem('registrations', JSON.stringify(registrations));
    
    alert('Successfully registered for the event!');
    closeModal();
    
    // Refresh events page
    loadEventsPage();
}

// Filter events
function filterEvents() {
    const categoryFilter = document.getElementById('categoryFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    let events = getAllEvents();
    
    // Apply filters
    if (categoryFilter) {
        events = events.filter(event => event.category === categoryFilter);
    }
    
    if (statusFilter) {
        events = events.filter(event => event.status === statusFilter);
    }
    
    if (searchTerm) {
        events = events.filter(event => 
            event.title.toLowerCase().includes(searchTerm) ||
            event.description.toLowerCase().includes(searchTerm) ||
            event.location.toLowerCase().includes(searchTerm)
        );
    }
    
    // Update events grid
    document.getElementById('eventsGrid').innerHTML = renderEventsGrid(events);
}

// Get all events
function getAllEvents() {
    return JSON.parse(localStorage.getItem('events') || '[]');
}

// Get event by ID
function getEventById(eventId) {
    const events = getAllEvents();
    return events.find(event => event.id === eventId);
}

// Update event
function updateEvent(updatedEvent) {
    let events = getAllEvents();
    events = events.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
    );
    localStorage.setItem('events', JSON.stringify(events));
}

// Delete event
function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event?')) {
        return;
    }
    
    let events = getAllEvents();
    events = events.filter(event => event.id !== eventId);
    localStorage.setItem('events', JSON.stringify(events));
    
    alert('Event deleted successfully!');
    closeModal();
    loadEventsPage();
}

// Edit event
function editEvent(eventId) {
    const event = getEventById(eventId);
    
    const editFormHTML = `
        <div class="modal-header">
            <h2>Edit Event</h2>
            <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
            <form id="editEventForm">
                <div class="form-group">
                    <label for="editEventTitle">Event Title</label>
                    <input type="text" id="editEventTitle" value="${event.title}" required>
                </div>
                
                <div class="form-group">
                    <label for="editEventDescription">Description</label>
                    <textarea id="editEventDescription" required>${event.description}</textarea>
                </div>
                
                <div class="row">
                    <div class="col-6">
                        <div class="form-group">
                            <label for="editEventCategory">Category</label>
                            <select id="editEventCategory" required>
                                <option value="sports" ${event.category === 'sports' ? 'selected' : ''}>Sports</option>
                                <option value="hackathon" ${event.category === 'hackathon' ? 'selected' : ''}>Hackathon</option>
                                <option value="cultural" ${event.category === 'cultural' ? 'selected' : ''}>Cultural</option>
                                <option value="workshop" ${event.category === 'workshop' ? 'selected' : ''}>Workshop</option>
                                <option value="conference" ${event.category === 'conference' ? 'selected' : ''}>Conference</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="col-6">
                        <div class="form-group">
                            <label for="editEventLocation">Location</label>
                            <input type="text" id="editEventLocation" value="${event.location}" required>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-6">
                        <div class="form-group">
                            <label for="editEventStartDate">Start Date & Time</label>
                            <input type="datetime-local" id="editEventStartDate" value="${event.start_date.replace(' ', 'T')}" required>
                        </div>
                    </div>
                    
                    <div class="col-6">
                        <div class="form-group">
                            <label for="editEventEndDate">End Date & Time</label>
                            <input type="datetime-local" id="editEventEndDate" value="${event.end_date.replace(' ', 'T')}" required>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-6">
                        <div class="form-group">
                            <label for="editEventMaxParticipants">Max Participants</label>
                            <input type="number" id="editEventMaxParticipants" value="${event.max_participants}" min="1" required>
                        </div>
                    </div>
                    
                    <div class="col-6">
                        <div class="form-group">
                            <label for="editEventStatus">Status</label>
                            <select id="editEventStatus" required>
                                <option value="upcoming" ${event.status === 'upcoming' ? 'selected' : ''}>Upcoming</option>
                                <option value="ongoing" ${event.status === 'ongoing' ? 'selected' : ''}>Ongoing</option>
                                <option value="completed" ${event.status === 'completed' ? 'selected' : ''}>Completed</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="editEventImage">Event Image URL</label>
                    <input type="url" id="editEventImage" value="${event.image}">
                </div>
                
                <div class="form-group">
                    <label for="editEventRequirements">Special Requirements</label>
                    <textarea id="editEventRequirements">${event.requirements || ''}</textarea>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn">Update Event</button>
                </div>
            </form>
        </div>
    `;
    
    showModal(editFormHTML);
    
    document.getElementById('editEventForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateExistingEvent(eventId);
    });
}

// Update existing event
function updateExistingEvent(eventId) {
    const event = getEventById(eventId);
    
    const updatedEvent = {
        ...event,
        title: document.getElementById('editEventTitle').value,
        description: document.getElementById('editEventDescription').value,
        category: document.getElementById('editEventCategory').value,
        location: document.getElementById('editEventLocation').value,
        start_date: document.getElementById('editEventStartDate').value,
        end_date: document.getElementById('editEventEndDate').value,
        max_participants: parseInt(document.getElementById('editEventMaxParticipants').value),
        status: document.getElementById('editEventStatus').value,
        image: document.getElementById('editEventImage').value,
        requirements: document.getElementById('editEventRequirements').value
    };
    
    updateEvent(updatedEvent);
    
    alert('Event updated successfully!');
    closeModal();
    loadEventsPage();
}

// Utility functions
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function formatTime(dateString) {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
}

// Initialize events when the script loads
initializeEvents();