// Authentication functions
function loadLoginPage() {
    const loginHTML = `
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <h1>Welcome Back</h1>
                    <p>Sign in to your CampusEventHub account</p>
                </div>
                
                <div class="demo-credentials">
                    <h4>Demo Credentials:</h4>
                    <p>Student: student@university.edu / password123</p>
                    <p>College Admin: admin@university.edu / password123</p>
                    <p>Super Admin: superadmin@university.edu / password123</p>
                </div>
                
                <form class="auth-form" id="loginForm">
                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input type="email" id="email" placeholder="Enter your email" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" placeholder="Enter your password" required>
                    </div>
                    
                    <button type="submit" class="btn" style="width: 100%;">Sign In</button>
                </form>
                
                <div class="auth-footer">
                    <p>Don't have an account? <a href="#" onclick="loadRegisterPage()">Sign up</a></p>
                </div>
            </div>
        </div>
    `;
    
    loadPage('login', loginHTML);
    
    // Add form submission handler
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
}

function loadRegisterPage() {
    const registerHTML = `
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <h1>Create Account</h1>
                    <p>Join CampusEventHub today</p>
                </div>
                
                <form class="auth-form" id="registerForm">
                    <div class="form-group">
                        <label for="regName">Full Name</label>
                        <input type="text" id="regName" placeholder="Enter your full name" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="regEmail">Email Address</label>
                        <input type="email" id="regEmail" placeholder="Enter your email" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="regCollege">College/University</label>
                        <input type="text" id="regCollege" placeholder="Enter your college name" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="regRole">Role</label>
                        <select id="regRole" required>
                            <option value="">Select your role</option>
                            <option value="student">Student</option>
                            <option value="college_admin">College Admin</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="regPassword">Password</label>
                        <input type="password" id="regPassword" placeholder="Create a password" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="regConfirmPassword">Confirm Password</label>
                        <input type="password" id="regConfirmPassword" placeholder="Confirm your password" required>
                    </div>
                    
                    <button type="submit" class="btn" style="width: 100%;">Create Account</button>
                </form>
                
                <div class="auth-footer">
                    <p>Already have an account? <a href="#" onclick="loadLoginPage()">Sign in</a></p>
                </div>
            </div>
        </div>
    `;
    
    loadPage('register', registerHTML);
    
    // Add form submission handler
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Get mock users
    const users = getMockUsers();
    
    // Find user with matching credentials
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Store user in localStorage (simulating login)
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Show success message
        showNotification('Login successful!', 'success');
        
        // Load appropriate dashboard
        if (user.role === 'student') {
            loadStudentDashboard();
        } else if (user.role === 'college_admin' || user.role === 'super_admin') {
            loadAdminDashboard();
        }
    } else {
        showNotification('Invalid email or password', 'error');
    }
}

function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const college = document.getElementById('regCollege').value;
    const role = document.getElementById('regRole').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    // Create new user object
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        college,
        role
    };
    
    // Get existing users from localStorage or initialize
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if email already exists
    if (users.some(u => u.email === email)) {
        showNotification('Email already registered', 'error');
        return;
    }
    
    // Add new user and save
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto login the new user
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    showNotification('Account created successfully!', 'success');
    
    // Load appropriate dashboard
    if (newUser.role === 'student') {
        loadStudentDashboard();
    } else if (newUser.role === 'college_admin') {
        loadAdminDashboard();
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    showNotification('Logged out successfully', 'success');
    loadLoginPage();
}