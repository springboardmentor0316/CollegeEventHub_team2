function showCreateEventForm() {
    const modalHTML = `
        <div class="modal-header">
            <h2>Create New Event</h2>
            <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
            <form id="createEventForm">
                <div class="form-group">
                    <label for="eventTitle">Event Title</label>
                    <input type="text" id="eventTitle" required>
                </div>
                
                <div class="form-group">
                    <label for="eventDescription">Description</label>
                    <textarea id="eventDescription" required></textarea>
                </div>
                
                <div class="row">
                    <div class="col-6">
                        <div class="form-group">
                            <label for="eventCategory">Category</label>
                            <select id="eventCategory" required>
                                <option value="">Select category</option>
                                <option value="sports">Sports</option>
                                <option value="hackathon">Hackathon</option>
                                <option value="cultural">Cultural</option>
                                <option value="workshop">Workshop</option>
                                <option value="conference">Conference</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="col-6">
                        <div class="form-group">
                            <label for="eventLocation">Location</label>
                            <input type="text" id="eventLocation" required>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-6">
                        <div class="form-group">
                            <label for="eventStartDate">Start Date & Time</label>
                            <input type="datetime-local" id="eventStartDate" required>
                        </div>
                    </div>
                    
                    <div class="col-6">
                        <div class="form-group">
                            <label for="eventEndDate">End Date & Time</label>
                            <input type="datetime-local" id="eventEndDate" required>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-6">
                        <div class="form-group">
                            <label for="eventMaxParticipants">Max Participants</label>
                            <input type="number" id="eventMaxParticipants" min="1" required>
                        </div>
                    </div>
                    
                    <div class="col-6">
                        <div class="form-group">
                            <label for="eventImage">Event Image URL</label>
                            <input type="url" id="eventImage" placeholder="https://example.com/image.jpg">
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="eventRequirements">Special Requirements</label>
                    <textarea id="eventRequirements" placeholder="Any special equipment, skills, or prerequisites..."></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn">Create Event</button>
                </div>
            </form>
        </div>
    `;
    
    // Show modal with the form
    showModal(modalHTML);
    
    // Add form submission handler
    document.getElementById('createEventForm').addEventListener('submit', function(e) {
        e.preventDefault();
        createNewEvent();
    });
}

function createNewEvent() {
    const form = document.getElementById('createEventForm');
    const user = JSON.parse(localStorage.getItem('currentUser'));
    
    const newEvent = {
        id: 'event-' + Date.now(),
        title: document.getElementById('eventTitle').value,
        description: document.getElementById('eventDescription').value,
        category: document.getElementById('eventCategory').value,
        location: document.getElementById('eventLocation').value,
        start_date: document.getElementById('eventStartDate').value,
        end_date: document.getElementById('eventEndDate').value,
        max_participants: parseInt(document.getElementById('eventMaxParticipants').value),
        image: document.getElementById('eventImage').value || 'https://via.placeholder.com/400x200?text=Event+Image',
        requirements: document.getElementById('eventRequirements').value,
        organizer: user.id,
        participants: 0,
        status: 'upcoming',
        created_at: new Date().toISOString()
    };
    
    // Save to localStorage (in a real app, this would be an API call)
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    events.push(newEvent);
    localStorage.setItem('events', JSON.stringify(events));
    
    // Close modal and refresh the dashboard
    closeModal();
    
    // Show success message
    alert('Event created successfully!');
    
    // Reload the appropriate dashboard
    if (user.role === 'admin') {
        loadAdminDashboard();
    } else {
        loadStudentDashboard();
    }
}

// Helper functions for modal and date formatting
function showModal(content) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            ${content}
        </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        document.body.removeChild(modal);
    }
    document.body.style.overflow = 'auto';
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}