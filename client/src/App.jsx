import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';
import LoadingScreen from './components/LoadingScreen';
import ErrorBoundary from './components/ErrorBoundary';

const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const OAuth = lazy(() => import('./pages/auth/OAuth'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const Resume = lazy(() => import('./pages/resume/Resume'));
const Roadmap = lazy(() => import('./pages/roadmap/Roadmap'));
const Learning = lazy(() => import('./pages/learning/Learning'));
const Bookmarks = lazy(() => import('./pages/bookmarks/Bookmarks'));
const Progress = lazy(() => import('./pages/progress/Progress'));
const Settings = lazy(() => import('./pages/settings/Settings'));
const Admin = lazy(() => import('./pages/dashboard/Admin'));

const ProtectedRoute = ({ children, roles }) => {
  const { user, booting } = useAuth();
  if (booting) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, booting } = useAuth();
  if (booting) return <LoadingScreen />;
  if (user) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                <Route path="/auth/oauth" element={<OAuth />} />
              </Route>
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="/resume" element={<Resume />} />
                <Route path="/roadmap" element={<Roadmap />} />
                <Route path="/learning/:skill?" element={<Learning />} />
                <Route path="/bookmarks" element={<Bookmarks />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Admin /></ProtectedRoute>} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
