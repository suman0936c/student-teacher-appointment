document.addEventListener('DOMContentLoaded', () => {
    // Get all navigation links and sections
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const dashboardLink = document.getElementById('dashboard-link');
    const logoutLink = document.getElementById('logout-link');
    const registerRole = document.getElementById('register-role');
    const subjectsGroup = document.getElementById('subjects-group');

    // Initialize booking functionality
    initBooking();

    // Function to show a specific section
    function showSection(sectionId) {
        sections.forEach(section => {
            section.style.display = 'none';
        });
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
        }
    }

    // Add click event listeners to navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            if (sectionId) {
                showSection(sectionId);
            }
        });
    });

    // Handle role selection in registration form
    registerRole.addEventListener('change', (e) => {
        subjectsGroup.style.display = e.target.value === 'teacher' ? 'block' : 'none';
    });

    // Show home section by default
    showSection('home');

    // Listen for authentication state changes
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            loginLink.style.display = 'none';
            registerLink.style.display = 'none';
            dashboardLink.style.display = 'block';
            logoutLink.style.display = 'block';
            showSection('dashboard');
            updateUserProfile(user);
        } else {
            // User is signed out
            loginLink.style.display = 'block';
            registerLink.style.display = 'block';
            dashboardLink.style.display = 'none';
            logoutLink.style.display = 'none';
            showSection('home');
        }
    });

    // Handle logout
    logoutLink.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await firebase.auth().signOut();
            showSection('home');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    });
});

// Function to update user profile in the dashboard
async function updateUserProfile(user) {
    try {
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        
        document.getElementById('user-name').textContent = userData.name;
        document.getElementById('user-role').textContent = userData.role;

        // Show/hide appropriate dashboard based on user role
        const teacherDashboard = document.getElementById('teacher-dashboard');
        const studentDashboard = document.getElementById('student-dashboard');
        const bookingSection = document.getElementById('booking');

        if (userData.role === 'teacher') {
            teacherDashboard.style.display = 'block';
            studentDashboard.style.display = 'none';
            bookingSection.style.display = 'none';
        } else {
            teacherDashboard.style.display = 'none';
            studentDashboard.style.display = 'block';
            bookingSection.style.display = 'block';
        }
    } catch (error) {
        console.error('Error updating user profile:', error);
    }
}

// Function to show success message
function showSuccess(message) {
    const successMessage = document.getElementById('success-message');
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 3000);
}

// Function to show error message
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    } else {
        console.error(`Error element with id '${elementId}' not found. Error message: ${message}`);
    }
}

async function loadAppointments() {
    try {
        const user = firebase.auth().currentUser;
        if (!user) return;

        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        const userData = userDoc.data();

        if (userData.role === 'teacher') {
            // Load teacher's appointments
            const appointmentsRef = firebase.firestore().collection('appointments')
                .where('teacherId', '==', user.uid)
                .orderBy('date', 'desc')
                .orderBy('time', 'desc');

            appointmentsRef.onSnapshot(snapshot => {
                const appointmentsList = document.getElementById('teacher-appointments-list');
                if (!appointmentsList) return;

                appointmentsList.innerHTML = '';
                snapshot.forEach(doc => {
                    const appointment = doc.data();
                    const appointmentElement = createAppointmentElement(appointment, doc.id);
                    appointmentsList.appendChild(appointmentElement);
                });
            }, error => {
                if (error.code === 'failed-precondition' || error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
                    console.warn('Firebase connection blocked. Please check your ad blocker settings.');
                    showError('teacher-appointments-error', 'Unable to load appointments. Please disable your ad blocker for this site.');
                } else {
                    console.error('Error loading appointments:', error);
                    showError('teacher-appointments-error', 'Error loading appointments. Please try again later.');
                }
            });
        } else {
            // Load student's appointments
            const appointmentsRef = firebase.firestore().collection('appointments')
                .where('studentId', '==', user.uid)
                .orderBy('date', 'desc')
                .orderBy('time', 'desc');

            appointmentsRef.onSnapshot(snapshot => {
                const appointmentsList = document.getElementById('student-appointments-list');
                if (!appointmentsList) return;

                appointmentsList.innerHTML = '';
                snapshot.forEach(doc => {
                    const appointment = doc.data();
                    const appointmentElement = createAppointmentElement(appointment, doc.id);
                    appointmentsList.appendChild(appointmentElement);
                });
            }, error => {
                if (error.code === 'failed-precondition' || error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
                    console.warn('Firebase connection blocked. Please check your ad blocker settings.');
                    showError('student-appointments-error', 'Unable to load appointments. Please disable your ad blocker for this site.');
                } else {
                    console.error('Error loading appointments:', error);
                    showError('student-appointments-error', 'Error loading appointments. Please try again later.');
                }
            });
        }
    } catch (error) {
        console.error('Error in loadAppointments:', error);
        showError('appointments-error', 'Error loading appointments. Please try again later.');
    }
} 