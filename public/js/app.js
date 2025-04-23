// Main application logic
class App {
    constructor() {
        this.auth = window.auth;
        this.db = firebase.firestore();
        this.currentView = 'home';
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Navigation links
        document.getElementById('home-link').addEventListener('click', () => this.showHome());
        document.getElementById('login-link').addEventListener('click', () => this.showLogin());
        document.getElementById('register-link').addEventListener('click', () => this.showRegister());

        // Forms
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('register-form').addEventListener('submit', (e) => this.handleRegister(e));

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
        this.hideAllSections();
        const dashboardSection = document.getElementById('dashboard-section');
        const dashboardContent = document.getElementById('dashboard-content');
        dashboardSection.style.display = 'block';

        const user = this.auth.currentUser;
        if (!user) return;

        try {
            const userDoc = await this.db.collection('users').doc(user.uid).get();
            const userData = userDoc.data();

            if (userData.userType === 'student') {
                this.loadStudentDashboard(dashboardContent);
            } else if (userData.userType === 'teacher') {
                this.loadTeacherDashboard(dashboardContent);
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
            dashboardContent.innerHTML = '<p>Error loading dashboard. Please try again.</p>';
        }
    }

    loadStudentDashboard(container) {
        container.innerHTML = `
            <div class="dashboard-grid">
                <div class="dashboard-card">
                    <h3>Book Appointment</h3>
                    <button onclick="app.showBookAppointment()">Book New Appointment</button>
                </div>
                <div class="dashboard-card">
                    <h3>My Appointments</h3>
                    <div id="student-appointments"></div>
                </div>
            </div>
        `;
        this.loadStudentAppointments();
    }

    loadTeacherDashboard(container) {
        container.innerHTML = `
            <div class="dashboard-grid">
                <div class="dashboard-card">
                    <h3>Schedule Management</h3>
                    <button onclick="app.showScheduleManagement()">Manage Schedule</button>
                </div>
                <div class="dashboard-card">
                    <h3>Upcoming Appointments</h3>
                    <div id="teacher-appointments"></div>
                </div>
            </div>
        `;
        this.loadTeacherAppointments();
    }

    async loadStudentAppointments() {
        const container = document.getElementById('student-appointments');
        const user = this.auth.currentUser;
        if (!user) return;

        try {
            const appointments = await this.db
                .collection('appointments')
                .where('studentId', '==', user.uid)
                .orderBy('date', 'desc')
                .get();

            if (appointments.empty) {
                container.innerHTML = '<p>No appointments found.</p>';
                return;
            }

            const appointmentsList = appointments.docs.map(doc => {
                const data = doc.data();
                return `
                    <div class="appointment-card">
                        <p>Date: ${new Date(data.date.toDate()).toLocaleDateString()}</p>
                        <p>Time: ${data.time}</p>
                        <p>Status: ${data.status}</p>
                    </div>
                `;
            }).join('');

            container.innerHTML = appointmentsList;
        } catch (error) {
            console.error('Error loading appointments:', error);
            container.innerHTML = '<p>Error loading appointments. Please try again.</p>';
        }
    }

    async loadTeacherAppointments() {
        const container = document.getElementById('teacher-appointments');
        const user = this.auth.currentUser;
        if (!user) return;

        try {
            const appointments = await this.db
                .collection('appointments')
                .where('teacherId', '==', user.uid)
                .orderBy('date', 'desc')
                .get();

            if (appointments.empty) {
                container.innerHTML = '<p>No appointments found.</p>';
                return;
            }

            const appointmentsList = appointments.docs.map(doc => {
                const data = doc.data();
                return `
                    <div class="appointment-card">
                        <p>Date: ${new Date(data.date.toDate()).toLocaleDateString()}</p>
                        <p>Time: ${data.time}</p>
                        <p>Student: ${data.studentName}</p>
                        <p>Status: ${data.status}</p>
                    </div>
                `;
            }).join('');

            container.innerHTML = appointmentsList;
        } catch (error) {
            console.error('Error loading appointments:', error);
            container.innerHTML = '<p>Error loading appointments. Please try again.</p>';
        }
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

    showHome() {
        this.hideAllSections();
        document.getElementById('login-section').style.display = 'block';
    }

    showLogin() {
        this.hideAllSections();
        document.getElementById('login-section').style.display = 'block';
    }

    showRegister() {
        this.hideAllSections();
        document.getElementById('register-section').style.display = 'block';
    }

    hideAllSections() {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('register-section').style.display = 'none';
        document.getElementById('dashboard-section').style.display = 'none';
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            await this.auth.login(email, password);
            this.loadUserDashboard();
        } catch (error) {
            alert('Login failed: ' + error.message);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const userType = document.getElementById('user-type').value;

        try {
            await this.auth.register(email, password, name, userType);
            this.loadUserDashboard();
        } catch (error) {
            alert('Registration failed: ' + error.message);
        }
    }
}

// Initialize app
const app = new App();
window.app = app; 