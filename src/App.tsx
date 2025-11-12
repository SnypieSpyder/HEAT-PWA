import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { InstructorsPage } from './pages/public/InstructorsPage';
import { StatementOfFaithPage } from './pages/public/StatementOfFaithPage';
import { ClassesPage } from './pages/public/ClassesPage';
import { ClassDetailPage } from './pages/public/ClassDetailPage';
import { SportsPage } from './pages/public/SportsPage';
import { EventsPage } from './pages/public/EventsPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Dashboard Pages
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { FamilyProfilePage } from './pages/dashboard/FamilyProfilePage';
import { CartPage } from './pages/dashboard/CartPage';
import { CheckoutPage } from './pages/dashboard/CheckoutPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <Layout>
                  <HomePage />
                </Layout>
              }
            />
            <Route
              path="/about"
              element={
                <Layout>
                  <AboutPage />
                </Layout>
              }
            />
            <Route
              path="/contact"
              element={
                <Layout>
                  <ContactPage />
                </Layout>
              }
            />
            <Route
              path="/instructors"
              element={
                <Layout>
                  <InstructorsPage />
                </Layout>
              }
            />
            <Route
              path="/statement-of-faith"
              element={
                <Layout>
                  <StatementOfFaithPage />
                </Layout>
              }
            />
            <Route
              path="/classes"
              element={
                <Layout>
                  <ClassesPage />
                </Layout>
              }
            />
            <Route
              path="/classes/:classId"
              element={
                <Layout>
                  <ClassDetailPage />
                </Layout>
              }
            />
            <Route
              path="/sports"
              element={
                <Layout>
                  <SportsPage />
                </Layout>
              }
            />
            <Route
              path="/events"
              element={
                <Layout>
                  <EventsPage />
                </Layout>
              }
            />

            {/* Auth Routes */}
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/signup" element={<SignupPage />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected Family Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <FamilyProfilePage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CartPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CheckoutPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <AdminDashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
