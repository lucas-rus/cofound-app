import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateProject from './pages/CreateProject';
import ProjectDetails from './pages/ProjectDetails';
import MyApplications from './pages/MyApplications';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/AdminDashboard';
import SearchResults from './pages/SearchResults';
import FriendsList from './pages/FriendsList';
import DirectChat from './pages/DirectChat';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/search" element={
              <ProtectedRoute>
                <SearchResults />
              </ProtectedRoute>
            } />
            <Route path="/friends" element={
              <ProtectedRoute>
                <FriendsList />
              </ProtectedRoute>
            } />
            <Route path="/messages/:userId" element={
              <ProtectedRoute>
                <DirectChat />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/create-project" element={
              <ProtectedRoute>
                <CreateProject />
              </ProtectedRoute>
            } />
            <Route path="/projects/:id" element={
              <ProtectedRoute>
                <ProjectDetails />
              </ProtectedRoute>
            } />
            <Route path="/my-applications" element={
              <ProtectedRoute>
                <MyApplications />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/users/:userId" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;