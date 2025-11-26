import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { lazy, Suspense } from "react";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { googleClientId } from "./constants";
import { ThemeProvider } from "./contexts/ThemeContext";

// Public pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import CoursePage from "./pages/CoursePage";
import GenerateCourse from "./pages/GenerateCourse";
import DashboardLayout from "./components/layouts/DashboardLayout";
import ProfilePricing from "./pages/ProfilePricing";
import PaymentDetails from "./pages/PaymentDetails";
import Profile from "./pages/Profile";
import Certificate from "./pages/Certificate";
import PaymentSuccess from "./pages/PaymentSuccess";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import PaymentPending from "./pages/PaymentPending";
import PaymentFailed from "./pages/PaymentFailed";
import SubscriptionBillingPolicy from "./pages/SubscriptionBillingPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import CancellationPolicy from "./pages/CancellationPolicy";
import QuizPage from "./pages/QuizPage";
import BlogPost from "./pages/BlogPost";

// Admin layout
import AdminLayout from "./components/layouts/AdminLayout";

// Lazy-loaded admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminCourses = lazy(() => import("./pages/admin/AdminCourses"));
const AdminPaidUsers = lazy(() => import("./pages/admin/AdminPaidUsers"));
const AdminAdmins = lazy(() => import("./pages/admin/AdminAdmins"));
const AdminContacts = lazy(() => import("./pages/admin/AdminContacts"));
const AdminTerms = lazy(() => import("./pages/admin/AdminTerms"));
const AdminPrivacy = lazy(() => import("./pages/admin/AdminPrivacy"));
const AdminCancellation = lazy(() => import("./pages/admin/AdminCancellation"));
const AdminRefund = lazy(() => import("./pages/admin/AdminRefund"));
const AdminSubscriptionBilling = lazy(() => import("./pages/admin/AdminSubscriptionBilling"));
const AdminCreateBlog = lazy(() => import("./pages/admin/AdminCreateBlog"));
const AdminBlogs = lazy(() => import("./pages/admin/AdminBlogs"));

// Loading component for admin routes
const AdminLoading = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading admin panel...</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered:', registration);
      })
      .catch(error => {
        console.log('SW registration failed:', error);
      });
  });
}

// Service worker registration
// TODO: Add failed payment link in server.js
// TODO: Compare main server with edited server file

const App = () => (
  <GoogleOAuthProvider clientId={googleClientId}>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />

                {/* Dashboard Routes */}
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="generate-course" element={<GenerateCourse />} />
                  <Route path="pricing" element={<ProfilePricing />} />
                  <Route path="payment/:planId" element={<PaymentDetails />} />
                  <Route path="profile" element={<Profile />} />
                </Route>

                {/* Course Routes */}
                <Route path="/course/:courseId" element={<CoursePage />} />
                <Route path="/course/:courseId/certificate" element={<Certificate />} />
                <Route path="/course/:courseId/quiz" element={<QuizPage />} />

                {/* Payment Routes */}
                <Route path="/payment-success/:planId" element={<PaymentSuccess />} />
                <Route path="/payment-pending" element={<PaymentPending />} />
                <Route path="/payment-failed" element={<PaymentFailed />} />

                {/* Static Pages */}
                <Route path="/about" element={<About />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/cancellation-policy" element={<CancellationPolicy />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/subscription-billing-policy" element={<SubscriptionBillingPolicy />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogPost />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Suspense fallback={<AdminLoading />}><AdminDashboard /></Suspense>} />
                  <Route path="users" element={<Suspense fallback={<AdminLoading />}><AdminUsers /></Suspense>} />
                  <Route path="courses" element={<Suspense fallback={<AdminLoading />}><AdminCourses /></Suspense>} />
                  <Route path="paid-users" element={<Suspense fallback={<AdminLoading />}><AdminPaidUsers /></Suspense>} />
                  <Route path="admins" element={<Suspense fallback={<AdminLoading />}><AdminAdmins /></Suspense>} />
                  <Route path="contacts" element={<Suspense fallback={<AdminLoading />}><AdminContacts /></Suspense>} />
                  <Route path="terms" element={<Suspense fallback={<AdminLoading />}><AdminTerms /></Suspense>} />
                  <Route path="privacy" element={<Suspense fallback={<AdminLoading />}><AdminPrivacy /></Suspense>} />
                  <Route path="cancellation" element={<Suspense fallback={<AdminLoading />}><AdminCancellation /></Suspense>} />
                  <Route path="refund" element={<Suspense fallback={<AdminLoading />}><AdminRefund /></Suspense>} />
                  <Route path="subscription-billing" element={<Suspense fallback={<AdminLoading />}><AdminSubscriptionBilling /></Suspense>} />
                  <Route path="create-blog" element={<Suspense fallback={<AdminLoading />}><AdminCreateBlog /></Suspense>} />
                  <Route path="blogs" element={<Suspense fallback={<AdminLoading />}><AdminBlogs /></Suspense>} />
                </Route>

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </HelmetProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </GoogleOAuthProvider>
);

export default App;
