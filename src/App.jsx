// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import your components
import AuthContainer from './AuthContainer';       // Admin login and dashboard
import StudentPortal from './StudentPortal';       // Student portal via QR code

function App() {
    return (
        <Router>
            <Routes>
                {/* Redirect root ("/") to the Student Portal */}
                <Route path="/" element={<Navigate to="/admin" replace />} />

                {/* Admin Portal routes */}
                <Route path="/admin" element={<AuthContainer />} />

                {/* Student Portal route */}
                <Route path="/student" element={<StudentPortal />} />

                {/* 404 - Catch-all route */}
                <Route
                    path="*"
                    element={
                        <div style={{ color: 'white', padding: '2rem' }}>
                            <h1>404 - Page Not Found</h1>
                        </div>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
