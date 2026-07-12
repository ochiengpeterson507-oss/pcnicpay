import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthProvider';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLayout from './pages/Admin/AdminLayout';

import AdminOverview from './pages/Admin/Overview';
import Members from './pages/Admin/Members';
import Expenses from './pages/Admin/Expenses';

import Contributions from './pages/Admin/Contributions';

import Reports from './pages/Admin/Reports';
import Posters from './pages/Admin/Posters';

import Notifications from './pages/Admin/Notifications';
import Announcements from './pages/Admin/Announcements';
import Gallery from './pages/Admin/Gallery';
import SupabaseDiagnostic from './components/SupabaseDiagnostic';





function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/diagnostic" element={<SupabaseDiagnostic />} />
        <Route path="/register" element={<Register />} />
        
        {/* Regular Member Dashboard */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminOverview />} />
          <Route path="members" element={<Members />} />
          <Route path="transactions" element={<div className="p-4">Transactions (Coming Soon)</div>} />
          <Route path="contributions" element={<Contributions />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="events" element={<div className="p-4">Events (Coming Soon)</div>} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="posters" element={<Posters />} />
          <Route path="reports" element={<Reports />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="audit" element={<div className="p-4">Audit Logs (Coming Soon)</div>} />
          <Route path="settings" element={<div className="p-4">Settings (Coming Soon)</div>} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
