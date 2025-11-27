import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { OrganizationProvider } from './contexts/OrganizationContext';
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
import { SportDetailPage } from './pages/public/SportDetailPage';
import { EventsPage } from './pages/public/EventsPage';
import { EventDetailPage } from './pages/public/EventDetailPage';
import { VolunteersPage } from './pages/public/VolunteersPage';
import { CalendarPage } from './pages/public/CalendarPage';
import { MembershipPage } from './pages/public/MembershipPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Dashboard Pages
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { FamilyProfilePage } from './pages/dashboard/FamilyProfilePage';
import { CartPage } from './pages/dashboard/CartPage';
import { CheckoutPage } from './pages/dashboard/CheckoutPage';
import { EnrollmentsPage } from './pages/dashboard/EnrollmentsPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminClassesPage } from './pages/admin/AdminClassesPage';
import { AdminSportsPage } from './pages/admin/AdminSportsPage';
import { AdminEventsPage } from './pages/admin/AdminEventsPage';
import { AdminInstructorsPage } from './pages/admin/AdminInstructorsPage';
import { AdminFamiliesPage } from './pages/admin/AdminFamiliesPage';
import { AdminVolunteersPage } from './pages/admin/AdminVolunteersPage';
import { AdminWaitlistsPage } from './pages/admin/AdminWaitlistsPage';
import { AdminPagesPage } from './pages/admin/AdminPagesPage';
import { CustomPage } from './pages/public/CustomPage';

function App() {
  return (
    <Router>
      <OrganizationProvider>
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
              path="/sports/:sportId"
              element={
                <Layout>
                  <SportDetailPage />
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
            <Route
              path="/events/:eventId"
              element={
                <Layout>
                  <EventDetailPage />
                </Layout>
              }
            />
            <Route
              path="/volunteers"
              element={
                <Layout>
                  <VolunteersPage />
                </Layout>
              }
            />
            <Route
              path="/calendar"
              element={
                <Layout>
                  <CalendarPage />
                </Layout>
              }
            />
            <Route
              path="/membership"
              element={
                <Layout>
                  <MembershipPage />
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
            <Route
              path="/enrollments"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EnrollmentsPage />
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
            <Route
              path="/admin/classes"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <AdminClassesPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/sports"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <AdminSportsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <AdminEventsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/instructors"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <AdminInstructorsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/families"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <AdminFamiliesPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/volunteers"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <AdminVolunteersPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/waitlists"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <AdminWaitlistsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pages"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <AdminPagesPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Custom Pages (Dynamic - supports nested paths) */}
            <Route
              path="/pages/*"
              element={
                <Layout>
                  <CustomPage />
                </Layout>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </OrganizationProvider>
    </Router>
  );
}

export default App;
