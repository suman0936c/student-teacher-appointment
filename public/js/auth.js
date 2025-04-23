import { auth, db } from '../src/config/firebase.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut 
} from 'firebase/auth';
import { 
    doc, 
    setDoc, 
    getDoc, 
    serverTimestamp 
} from 'firebase/firestore';

// Authentication functions
class Auth {
    constructor() {
        this.auth = auth;
        this.db = db;
        this.currentUser = null;
    }

    // Register new user
    async register(email, password, userType, additionalData) {
        try {
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
            const user = userCredential.user;

            // Add user data to Firestore
            await setDoc(doc(this.db, 'users', user.uid), {
                email: user.email,
                userType: userType,
                ...additionalData,
                createdAt: serverTimestamp()
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
            const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
            this.currentUser = userCredential.user;
            return this.currentUser;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    // Logout user
    async logout() {
        try {
            await signOut(this.auth);
            this.currentUser = null;
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

    // Get user data from Firestore
    async getUserData(userId) {
        try {
            const docRef = doc(this.db, 'users', userId);
            const docSnap = await getDoc(docRef);
            return docSnap.exists() ? docSnap.data() : null;
        } catch (error) {
            console.error('Error getting user data:', error);
            throw error;
        }
    }
}

// Initialize auth
const authInstance = new Auth();

// Export auth instance
export default authInstance; 