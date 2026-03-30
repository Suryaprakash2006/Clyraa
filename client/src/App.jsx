import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import MainLayout from './components/layout/mainLayout';
import Home from './pages/home';
import Login from './pages/login';
import Feed from './pages/feed';
import Register from './pages/register';
import Profile from './pages/profile';
import Communities from './pages/communities';
import CommunityDetails from './pages/communityDetails';
import Groups from './pages/groups';
// import TripDashboard from './pages/tripDashboard';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        
        
        {/* Main Layout Routes */}
        <Route element={<MainLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          <Route path="/profile/:id" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />
          <Route path="/feed" element={
            <ProtectedRoute><Feed /></ProtectedRoute>
          } />
          <Route path="/communities" element={
            <ProtectedRoute><Communities /></ProtectedRoute>
          } />
          <Route path="/community/:id" element={
            <ProtectedRoute><CommunityDetails /></ProtectedRoute>
          } />
          <Route path="/groups" element={
            <ProtectedRoute><Groups /></ProtectedRoute>
          } />
          {/* <Route path="/groups/:groupId/trip" element={
            <ProtectedRoute><TripDashboard /></ProtectedRoute>
          } />  */}
        </Route>
      </Routes>
    </>
  );
}

export default App;
