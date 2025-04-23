// Authentication class
class Auth {
    constructor() {
        this.auth = firebase.auth();
        this.db = firebase.firestore();
        this.currentUser = null;
        
        // Listen for auth state changes
        this.auth.onAuthStateChanged(user => {
            this.currentUser = user;
            if (user) {
                console.log('User is signed in:', user.uid);
            } else {
                console.log('User is signed out');
            }
        });
    }
    
    // Register a new user
    async register(email, password, name, userType) {
        try {
            // Create user with email and password
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Add user data to Firestore
            await this.db.collection('users').doc(user.uid).set({
                name: name,
                email: email,
                userType: userType,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return user;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }
    
    // Login user
    async login(email, password) {
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            return userCredential.user;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }
    
    // Logout user
    async logout() {
        try {
            await this.auth.signOut();
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }
    
    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }
    
    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }
}

// Initialize auth
const auth = new Auth();
window.auth = auth;

// Get form elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const logoutBtn = document.getElementById('logout-btn');

// Add event listener for login form submission
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            // Hide any previous error messages
            hideError('login-error');
            
            // Sign in with email and password
            await firebase.auth().signInWithEmailAndPassword(email, password);
            
            // Clear form
            loginForm.reset();
            
        } catch (error) {
            // Show error message
            showError('login-error', error.message);
        }
    });
}

// Add event listener for registration form submission
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const role = document.getElementById('register-role').value;
        const subjects = document.getElementById('register-subjects').value;
        
        try {
            // Hide any previous error messages
            hideError('register-error');
            
            // Create user with email and password
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            
            // Update user profile
            await userCredential.user.updateProfile({
                displayName: name
            });
            
            // Store additional user data in Firestore
            await firebase.firestore().collection('users').doc(userCredential.user.uid).set({
                name: name,
                email: email,
                role: role,
                subjects: role === 'teacher' ? subjects.split(',').map(s => s.trim()) : [],
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Clear form
            registerForm.reset();
            
        } catch (error) {
            // Show error message
            showError('register-error', error.message);
        }
    });
}

// Add event listener for logout button
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await firebase.auth().signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // Handle login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            await firebase.auth().signInWithEmailAndPassword(email, password);
            showSuccess('Login successful!');
        } catch (error) {
            showError('login-error', error.message);
        }
    });

    // Handle registration form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const role = document.getElementById('register-role').value;
        const subjects = document.getElementById('register-subjects').value;

        try {
            // Create user with email and password
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Add user data to Firestore
            await firebase.firestore().collection('users').doc(user.uid).set({
                name: name,
                email: email,
                role: role,
                subjects: role === 'teacher' ? subjects.split(',').map(s => s.trim()) : [],
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            showSuccess('Registration successful!');
        } catch (error) {
            showError('register-error', error.message);
        }
    });
}); 