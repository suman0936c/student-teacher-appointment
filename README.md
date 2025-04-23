# Student-Teacher Booking Appointment System

A web-based appointment booking system that allows students and lecturers to manage their appointments efficiently.

## Features

### Admin Module
- Add/Update/Delete Teachers
- Approve Student Registrations
- Manage System Settings

### Teacher Module
- Login/Logout
- Schedule Appointments
- Approve/Cancel Appointments
- View Messages
- View All Appointments

### Student Module
- Register/Login
- Search Teachers
- Book Appointments
- Send Messages

## Technologies Used
- HTML5
- CSS3
- JavaScript
- Firebase (Authentication, Firestore, Storage)

## Project Structure
```
booking-system/
├── public/
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── images/
├── src/
│   ├── components/
│   ├── services/
│   └── utils/
├── package.json
└── README.md
```

## Setup and Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/booking-system.git
```

2. Install dependencies
```bash
npm install
```

3. Configure Firebase
   - Create a Firebase project
   - Enable Authentication and Firestore
   - Add your Firebase configuration to `src/config/firebase.js`

4. Run the project
```bash
npm start
```

## Firebase Configuration

The project uses Firebase for:
- User Authentication
- Real-time Database
- Cloud Storage

## Testing

The project includes test cases for:
- User Authentication
- Appointment Booking
- Message System
- Teacher Management

## Deployment

The application can be deployed on:
- Firebase Hosting
- GitHub Pages
- Any static web hosting service

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
