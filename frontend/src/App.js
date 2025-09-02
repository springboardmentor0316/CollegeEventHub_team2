import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import RegistrationSuccess from './components/RegistrationSuccess';
import StudentDashboard from './components/StudentDashboard';
import EventListingPage from './components/EventListingPage';
import AdminDashboard from './components/AdminDashboard';
import CreateEventPage from './components/CreateEventPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/registration-success" element={<RegistrationSuccess />} />
      <Route path="/forgot-password" element={<ResetPasswordPage />} />
      <Route path="/student-dashboard" element={<StudentDashboard />} />
      <Route path="/events" element={<EventListingPage />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/create-event" element={<CreateEventPage />} />
    </Routes>
  );
}

export default App;