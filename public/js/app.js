// Main application logic
class App {
    constructor() {
        this.auth = window.auth;
        this.db = firebase.firestore();
        this.currentView = 'home';
        this.initializeEventListeners();
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Navigation links
        document.getElementById('home-link').addEventListener('click', () => this.showView('home'));
        document.getElementById('login-link').addEventListener('click', () => this.showView('login'));
        document.getElementById('register-link').addEventListener('click', () => this.showView('register'));

        // Check authentication state
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.updateNavigation(true);
                this.loadUserDashboard();
            } else {
                this.updateNavigation(false);
                this.showView('home');
            }
        });
    }

    // Update navigation based on auth state
    updateNavigation(isLoggedIn) {
        const navLinks = document.querySelector('.nav-links');
        if (isLoggedIn) {
            navLinks.innerHTML = `
                <a href="#" id="dashboard-link">Dashboard</a>
                <a href="#" id="logout-link">Logout</a>
            `;
            document.getElementById('dashboard-link').addEventListener('click', () => this.loadUserDashboard());
            document.getElementById('logout-link').addEventListener('click', () => this.handleLogout());
        } else {
            navLinks.innerHTML = `
                <a href="#" id="home-link">Home</a>
                <a href="#" id="login-link">Login</a>
                <a href="#" id="register-link">Register</a>
            `;
            this.initializeEventListeners();
        }
    }

    // Show different views
    showView(view) {
        this.currentView = view;
        const mainContent = document.getElementById('main-content');
        
        switch(view) {
            case 'home':
                mainContent.innerHTML = this.getHomeView();
                break;
            case 'login':
                mainContent.innerHTML = this.getLoginView();
                this.initializeLoginForm();
                break;
            case 'register':
                mainContent.innerHTML = this.getRegisterView();
                this.initializeRegisterForm();
                break;
        }
    }

    // Get home view HTML
    getHomeView() {
        return `
            <div class="home-container">
                <h1>Welcome to Student-Teacher Booking System</h1>
                <p>Book appointments with teachers easily and efficiently.</p>
                <div class="features">
                    <div class="feature">
                        <h3>For Students</h3>
                        <p>Book appointments with teachers</p>
                        <p>Send messages</p>
                        <p>View your schedule</p>
                    </div>
                    <div class="feature">
                        <h3>For Teachers</h3>
                        <p>Manage appointments</p>
                        <p>View messages</p>
                        <p>Update schedule</p>
                    </div>
                </div>
            </div>
        `;
    }

    // Get login view HTML
    getLoginView() {
        return `
            <div class="form-container">
                <h2>Login</h2>
                <form id="login-form">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" required>
                    </div>
                    <button type="submit">Login</button>
                </form>
            </div>
        `;
    }

    // Get register view HTML
    getRegisterView() {
        return `
            <div class="form-container">
                <h2>Register</h2>
                <form id="register-form">
                    <div class="form-group">
                        <label for="user-type">User Type</label>
                        <select id="user-type" required>
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="name">Full Name</label>
                        <input type="text" id="name" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" required>
                    </div>
                    <button type="submit">Register</button>
                </form>
            </div>
        `;
    }

    // Initialize login form
    initializeLoginForm() {
        const form = document.getElementById('login-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                await this.auth.login(email, password);
                this.loadUserDashboard();
            } catch (error) {
                alert('Login failed: ' + error.message);
            }
        });
    }

    // Initialize register form
    initializeRegisterForm() {
        const form = document.getElementById('register-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userType = document.getElementById('user-type').value;
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                await this.auth.register(email, password, userType, { name });
                this.loadUserDashboard();
            } catch (error) {
                alert('Registration failed: ' + error.message);
            }
        });
    }

    // Load user dashboard
    async loadUserDashboard() {
        const user = this.auth.getCurrentUser();
        if (!user) return;

        const userData = await this.auth.getUserData(user.uid);
        const mainContent = document.getElementById('main-content');

        if (userData.userType === 'student') {
            mainContent.innerHTML = this.getStudentDashboard(userData);
        } else if (userData.userType === 'teacher') {
            mainContent.innerHTML = this.getTeacherDashboard(userData);
        }
    }

    // Get student dashboard HTML
    getStudentDashboard(userData) {
        return `
            <div class="dashboard-container">
                <h2>Welcome, ${userData.name}</h2>
                <div class="dashboard-actions">
                    <button onclick="app.showTeacherList()">Find Teachers</button>
                    <button onclick="app.showMyAppointments()">My Appointments</button>
                    <button onclick="app.showMessages()">Messages</button>
                </div>
            </div>
        `;
    }

    // Get teacher dashboard HTML
    getTeacherDashboard(userData) {
        return `
            <div class="dashboard-container">
                <h2>Welcome, ${userData.name}</h2>
                <div class="dashboard-actions">
                    <button onclick="app.showSchedule()">Manage Schedule</button>
                    <button onclick="app.showAppointments()">View Appointments</button>
                    <button onclick="app.showMessages()">Messages</button>
                </div>
            </div>
        `;
    }

    // Handle logout
    async handleLogout() {
        try {
            await this.auth.logout();
            this.showView('home');
        } catch (error) {
            alert('Logout failed: ' + error.message);
        }
    }
}

// Initialize app
const app = new App();
window.app = app; 