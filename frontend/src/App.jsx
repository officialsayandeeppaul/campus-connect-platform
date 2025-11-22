import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminRegister from './pages/auth/AdminRegister';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import UserDetails from './pages/admin/UserDetails';
import AdminMessages from './pages/admin/Messages';
import AdminOpportunities from './pages/admin/Opportunities';
import AdminEvents from './pages/admin/Events';
import AdminCollaborations from './pages/admin/Collaborations';
import CollaborationsManagement from './pages/admin/CollaborationsManagement';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import Opportunities from './pages/student/Opportunities';
import OpportunityDetails from './pages/student/OpportunityDetails';
import SavedOpportunities from './pages/student/SavedOpportunities';
import Collaborations from './pages/student/Collaborations';
import CollaborationDetails from './pages/student/CollaborationDetails';
import CreateCollaboration from './pages/student/CreateCollaboration';
import CollaborationApplicants from './pages/student/CollaborationApplicants';
import Events from './pages/student/Events';
import EventDetails from './pages/student/EventDetails';
import CreateEvent from './pages/student/CreateEvent';
import Profile from './pages/student/Profile';
import Messages from './pages/student/Messages';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/Dashboard';
import PostOpportunity from './pages/recruiter/PostOpportunity';
import ManageApplications from './pages/recruiter/ManageApplications';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    // Redirect based on role
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    if (user?.role === 'recruiter') return <Navigate to="/recruiter" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/secret-admin-register"
        element={
          <PublicRoute>
            <AdminRegister />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password/:token"
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/:userId"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UserDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/messages"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminMessages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/opportunities"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminOpportunities />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/events"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminEvents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/collaborations"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <CollaborationsManagement />
          </ProtectedRoute>
        }
      />

      {/* Student Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/opportunities"
        element={
          <ProtectedRoute>
            <Opportunities />
          </ProtectedRoute>
        }
      />
      <Route
        path="/opportunities/:id"
        element={
          <ProtectedRoute>
            <OpportunityDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/opportunities/saved"
        element={
          <ProtectedRoute>
            <SavedOpportunities />
          </ProtectedRoute>
        }
      />
      <Route
        path="/collaborations"
        element={
          <ProtectedRoute>
            <Collaborations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/collaborations/create"
        element={
          <ProtectedRoute>
            <CreateCollaboration />
          </ProtectedRoute>
        }
      />
      <Route
        path="/collaborations/edit/:id"
        element={
          <ProtectedRoute>
            <CreateCollaboration />
          </ProtectedRoute>
        }
      />
      <Route
        path="/collaborations/:id/applicants"
        element={
          <ProtectedRoute>
            <CollaborationApplicants />
          </ProtectedRoute>
        }
      />
      <Route
        path="/collaborations/:id"
        element={
          <ProtectedRoute>
            <CollaborationDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <Events />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/create"
        element={
          <ProtectedRoute>
            <CreateEvent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/:id"
        element={
          <ProtectedRoute>
            <EventDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        }
      />

      {/* Recruiter Routes */}
      <Route
        path="/recruiter"
        element={
          <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
            <RecruiterDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/post-opportunity"
        element={
          <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
            <PostOpportunity />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/applications"
        element={
          <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
            <ManageApplications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/profile"
        element={
          <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/messages"
        element={
          <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
            <Messages />
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            user?.role === 'admin' ? (
              <Navigate to="/admin" replace />
            ) : user?.role === 'recruiter' ? (
              <Navigate to="/recruiter" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* 404 Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
