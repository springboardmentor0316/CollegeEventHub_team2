// Utility functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = notification ;{type};
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 4px;
        color: white;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s;
    `;
    
    // Set background color based on type
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#17a2b8',
        warning: '#ffc107'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function formatDateTime(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Load different page content
function loadPage(pageId, content) {
    const app = document.getElementById('app');
    app.innerHTML = content;
    
    // Update active navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        }
    });
}

// Mock data functions
function getMockEvents() {
    return [
        {
            id: '1',
            college_id: '1',
            title: 'Inter-College Hackathon 2024',
            description: 'A 48-hour coding marathon bringing together the brightest minds from various colleges to solve real-world problems.',
            category: 'hackathon',
            location: 'Tech University Main Campus',
            start_date: '2024-06-15T09:00:00',
            end_date: '2024-06-17T17:00:00',
            created_at: '2024-05-01T10:00:00',
            participants: 107,
            max_participants: 200,
            tags: ['coding', 'programming', 'technology']
        },
        {
            id: '2',
            college_id: '2',
            title: 'Cultural Fest - Harmony 2024',
            description: 'A celebration of diverse cultures with performances, food stalls, and art exhibitions from different colleges.',
            category: 'cultural',
            location: 'City Cultural Center',
            start_date: '2024-07-20T13:30:00',
            end_date: '2024-07-21T03:30:00',
            created_at: '2024-05-10T14:00:00',
            participants: 342,
            max_participants: 500,
            tags: ['music', 'dance', 'art', 'food']
        },
        {
            id: '3',
            college_id: '3',
            title: 'Basketball Championship',
            description: 'Annual inter-college basketball tournament with teams competing for the championship trophy.',
            category: 'sports',
            location: 'University Sports Complex',
            start_date: '2024-06-05T10:00:00',
            end_date: '2024-06-07T18:00:00',
            created_at: '2024-04-20T09:00:00',
            participants: 160,
            max_participants: 200,
            tags: ['basketball', 'sports', 'competition']
        },
        {
            id: '4',
            college_id: '1',
            title: 'Web Development Workshop',
            description: 'Hands-on workshop covering modern web development technologies and best practices.',
            category: 'workshop',
            location: 'Tech University Computer Lab',
            start_date: '2024-05-25T14:00:00',
            end_date: '2024-05-25T17:00:00',
            created_at: '2024-05-05T11:00:00',
            participants: 65,
            max_participants: 80,
            tags: ['web development', 'coding', 'workshop']
        }
    ];
}

function getMockUsers() {
    return [
        {
            id: '1',
            name: 'John Doe',
            email: 'student@university.edu',
            password: 'password123',
            college: 'Tech University',
            role: 'student'
        },
        {
            id: '2',
            name: 'Jane Smith',
            email: 'admin@university.edu',
            password: 'password123',
            college: 'Tech University',
            role: 'college_admin'
        },
        {
            id: '3',
            name: 'Super Admin',
            email: 'superadmin@university.edu',
            password: 'password123',
            college: 'System',
            role: 'super_admin'
        }
    ];
}