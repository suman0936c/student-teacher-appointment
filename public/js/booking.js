// Get DOM elements
const bookingForm = document.getElementById('booking-form');
const appointmentsList = document.getElementById('appointments-list');
const teacherList = document.getElementById('teacher-list');
const studentList = document.getElementById('student-list');

// Initialize booking functionality
function initBooking() {
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }
    
    // Load appointments based on user role
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
            const userData = userDoc.data();
            
            if (userData.role === 'teacher') {
                loadTeacherAppointments(user.uid);
                loadStudents();
            } else if (userData.role === 'student') {
                loadStudentAppointments(user.uid);
                loadTeachers();
            }
        }
    });
}

// Handle booking form submission
async function handleBookingSubmit(e) {
    e.preventDefault();
    
    const teacherId = document.getElementById('teacher-select').value;
    const date = document.getElementById('appointment-date').value;
    const time = document.getElementById('appointment-time').value;
    const subject = document.getElementById('subject').value;
    const notes = document.getElementById('notes').value;
    
    try {
        const user = firebase.auth().currentUser;
        if (!user) throw new Error('User not authenticated');
        
        const teacherDoc = await firebase.firestore().collection('users').doc(teacherId).get();
        const teacherData = teacherDoc.data();
        
        const appointment = {
            studentId: user.uid,
            teacherId: teacherId,
            teacherName: teacherData.name,
            date: date,
            time: time,
            subject: subject,
            notes: notes,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await firebase.firestore().collection('appointments').add(appointment);
        
        // Show success message
        showSuccess('Appointment booked successfully!');
        bookingForm.reset();
        loadTeacherAppointments(teacherId);
    } catch (error) {
        console.error('Error submitting booking:', error);
        showError('booking-error', error.message);
    }
}

// Load teacher's appointments
async function loadTeacherAppointments(teacherId) {
    try {
        const appointmentsRef = firebase.firestore().collection('appointments')
            .where('teacherId', '==', teacherId)
            .orderBy('date', 'asc')
            .orderBy('time', 'asc');
            
        const snapshot = await appointmentsRef.get();
        
        if (appointmentsList) {
            appointmentsList.innerHTML = '';
            
            snapshot.forEach(doc => {
                const appointment = doc.data();
                const appointmentElement = createAppointmentElement(doc.id, appointment);
                appointmentsList.appendChild(appointmentElement);
            });
        }
    } catch (error) {
        console.error('Error loading appointments:', error);
        showError('appointments-error', 'Failed to load appointments');
    }
}

// Load student's appointments
async function loadStudentAppointments(studentId) {
    try {
        const appointmentsRef = firebase.firestore().collection('appointments')
            .where('studentId', '==', studentId)
            .orderBy('date', 'asc')
            .orderBy('time', 'asc');
            
        const snapshot = await appointmentsRef.get();
        
        if (appointmentsList) {
            appointmentsList.innerHTML = '';
            
            snapshot.forEach(doc => {
                const appointment = doc.data();
                const appointmentElement = createAppointmentElement(doc.id, appointment);
                appointmentsList.appendChild(appointmentElement);
            });
        }
    } catch (error) {
        console.error('Error loading appointments:', error);
        showError('appointments-error', 'Failed to load appointments');
    }
}

// Load available teachers
async function loadTeachers() {
    try {
        const teachersSnapshot = await firebase.firestore()
            .collection('users')
            .where('role', '==', 'teacher')
            .get();

        const teacherSelect = document.getElementById('teacher-select');
        teacherSelect.innerHTML = '<option value="">Select a teacher</option>';

        if (teachersSnapshot.empty) {
            console.log('No teachers found');
            return;
        }

        teachersSnapshot.forEach(doc => {
            const teacher = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = `${teacher.name} (${teacher.subjects ? teacher.subjects.join(', ') : 'No subjects'})`;
            teacherSelect.appendChild(option);
        });

        // Also populate the teacher list in the dashboard
        if (teacherList) {
            teacherList.innerHTML = '';
            teachersSnapshot.forEach(doc => {
                const teacher = doc.data();
                const teacherCard = document.createElement('div');
                teacherCard.className = 'user-card';
                teacherCard.innerHTML = `
                    <h4>${teacher.name}</h4>
                    <p>Subjects: ${teacher.subjects ? teacher.subjects.join(', ') : 'No subjects'}</p>
                    <button class="btn btn-primary" onclick="selectTeacher('${doc.id}')">Book Appointment</button>
                `;
                teacherList.appendChild(teacherCard);
            });
        }
    } catch (error) {
        console.error('Error loading teachers:', error);
        showError('booking-error', 'Failed to load teachers');
    }
}

// Load available students
async function loadStudents() {
    try {
        const studentsRef = firebase.firestore().collection('users')
            .where('role', '==', 'student');
            
        const snapshot = await studentsRef.get();
        
        if (studentList) {
            studentList.innerHTML = '';
            
            snapshot.forEach(doc => {
                const student = doc.data();
                const studentElement = createStudentElement(doc.id, student);
                studentList.appendChild(studentElement);
            });
        }
    } catch (error) {
        console.error('Error loading students:', error);
        showError('students-error', 'Failed to load students');
    }
}

// Load appointments for the current user
async function loadAppointments() {
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            console.log('No user logged in');
            return;
        }

        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        if (!userDoc.exists) {
            console.log('User document not found');
            return;
        }

        const userData = userDoc.data();
        console.log('User role:', userData.role);

        let appointmentsQuery;
        if (userData.role === 'teacher') {
            appointmentsQuery = firebase.firestore()
                .collection('appointments')
                .where('teacherId', '==', user.uid);
        } else {
            appointmentsQuery = firebase.firestore()
                .collection('appointments')
                .where('studentId', '==', user.uid);
        }

        const appointmentsSnapshot = await appointmentsQuery.get();
        console.log('Found appointments:', appointmentsSnapshot.size);

        const appointmentsList = document.getElementById('appointments-list');
        if (!appointmentsList) {
            console.error('Appointments list element not found');
            return;
        }

        appointmentsList.innerHTML = '';

        if (appointmentsSnapshot.empty) {
            appointmentsList.innerHTML = '<p>No appointments found</p>';
            return;
        }

        appointmentsSnapshot.forEach(doc => {
            const appointment = doc.data();
            console.log('Appointment data:', appointment);
            const appointmentElement = createAppointmentElement(doc.id, appointment, userData.role);
            appointmentsList.appendChild(appointmentElement);
        });
    } catch (error) {
        console.error('Error loading appointments:', error);
        showError('booking-error', 'Failed to load appointments');
    }
}

// Create appointment element
function createAppointmentElement(id, appointment) {
    const div = document.createElement('div');
    div.className = 'appointment-card';
    
    // Format date and time
    const date = new Date(appointment.date + 'T' + appointment.time);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    div.innerHTML = `
        <div class="appointment-header">
            <h4>Appointment with ${appointment.teacherName}</h4>
            <span class="status ${appointment.status}">${appointment.status}</span>
        </div>
        <div class="appointment-details">
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${formattedTime}</p>
            <p><strong>Subject:</strong> ${appointment.subject}</p>
            ${appointment.notes ? `<p><strong>Notes:</strong> ${appointment.notes}</p>` : ''}
        </div>
        <div class="appointment-actions">
            <button class="btn btn-danger" onclick="cancelAppointment('${id}')">Cancel</button>
        </div>
    `;
    
    return div;
}

// Create teacher element
function createTeacherElement(id, teacher) {
    const div = document.createElement('div');
    div.className = 'teacher-item';
    div.innerHTML = `
        <h3>${teacher.name}</h3>
        <p><strong>Email:</strong> ${teacher.email}</p>
        <p><strong>Subjects:</strong> ${teacher.subjects?.join(', ') || 'Not specified'}</p>
        <button onclick="selectTeacher('${id}')" class="btn btn-primary">Book Appointment</button>
    `;
    return div;
}

// Create student element
function createStudentElement(id, student) {
    const div = document.createElement('div');
    div.className = 'student-item';
    div.innerHTML = `
        <h3>${student.name}</h3>
        <p><strong>Email:</strong> ${student.email}</p>
    `;
    return div;
}

// Update appointment status
window.updateAppointmentStatus = async (appointmentId, status) => {
    try {
        await firebase.firestore().collection('appointments').doc(appointmentId).update({
            status: status
        });
        showSuccess(`Appointment ${status} successfully!`);
        loadAppointments(); // Reload appointments to show updated status
    } catch (error) {
        console.error('Error updating appointment status:', error);
        showError('booking-error', 'Failed to update appointment status');
    }
};

// Cancel appointment
async function cancelAppointment(id) {
    try {
        await firebase.firestore().collection('appointments').doc(id).delete();
        showSuccess('Appointment cancelled successfully!');
        loadTeacherAppointments(firebase.auth().currentUser.uid);
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        showError('appointment-error', 'Failed to cancel appointment');
    }
}

// Select teacher for booking
function selectTeacher(teacherId) {
    const teacherSelect = document.getElementById('teacher-select');
    if (teacherSelect) {
        teacherSelect.value = teacherId;
        document.getElementById('booking').style.display = 'block';
        document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
    }
}

// Show success message
function showSuccess(message) {
    const successElement = document.getElementById('success-message');
    if (successElement) {
        successElement.textContent = message;
        successElement.style.display = 'block';
        setTimeout(() => {
            successElement.style.display = 'none';
        }, 3000);
    }
}

// Initialize booking when DOM is loaded
document.addEventListener('DOMContentLoaded', initBooking); 