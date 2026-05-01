import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import PaymentPending from "./pages/PaymentPending";
import PaymentFailed from "./pages/PaymentFailed";
import QuizPage from "./pages/QuizPage";
import BlogPost from "./pages/BlogPost";
import PolicyPage from "./components/PolicyPage";
import { RequireAdmin, RequireAuth } from "./components/RouteGuards";
import { FileText, Shield } from "lucide-react";

// Admin layout
import AdminLayout from "./components/layouts/AdminLayout";

// Lazy-loaded admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminCourses = lazy(() => import("./pages/admin/AdminCourses"));
const AdminPaidUsers = lazy(() => import("./pages/admin/AdminPaidUsers"));
const AdminAdmins = lazy(() => import("./pages/admin/AdminAdmins"));
const AdminContacts = lazy(() => import("./pages/admin/AdminContacts"));
const AdminPolicyEditor = lazy(() => import("./components/admin/AdminPolicyEditor"));
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

const publicPolicies = [
  { path: "/privacy-policy", title: "Privacy Policy", icon: Shield, dataKey: "privacy", contactText: "Contact Us With Questions" },
  { path: "/terms", title: "Terms of Service", icon: FileText, dataKey: "terms" },
  { path: "/cancellation-policy", title: "Subscription Cancellation Policy", icon: FileText, dataKey: "cancel" },
  { path: "/refund-policy", title: "Refund Policy", icon: FileText, dataKey: "refund" },
  { path: "/subscription-billing-policy", title: "Subscription Billing Policy", icon: FileText, dataKey: "billing" },
] as const;

const adminPolicies = [
  ["terms", "Terms of Service", "Manage your terms of service content", "Edit Terms of Service", "terms", "terms", "Start writing Terms of Service.", "Terms of Service saved successfully"],
  ["privacy", "Privacy Policy", "Manage your privacy policy content", "Edit Privacy Policy", "privacy", "privacy", "Start writing Privacy Policy.", "Privacy policy saved successfully"],
  ["cancellation", "Cancellation Policy", "Manage your cancellation policy content", "Edit Cancellation Policy", "cancel", "cancel", "Start writing Cancellation Policy.", "Cancellation policy saved successfully"],
  ["refund", "Refund Policy", "Manage your refund policy content", "Edit Refund Policy", "refund", "refund", "Start writing Refund Policy.", "Refund policy saved successfully"],
  ["subscription-billing", "Subscription & Billing Policy", "Manage subscription and billing policy content", "Edit Subscription & Billing Policy", "billing", "billing", "Start writing Subscription & Billing Policy.", "Subscription & Billing policy saved successfully"],
] as const;

const App = () => (
  <GoogleOAuthProvider clientId={googleClientId}>
    <ThemeProvider>
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
                <Route path="/dashboard" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
                  <Route index element={<Dashboard />} />
                  <Route path="generate-course" element={<GenerateCourse />} />
                  <Route path="pricing" element={<ProfilePricing />} />
                  <Route path="payment/:planId" element={<PaymentDetails />} />
                  <Route path="profile" element={<Profile />} />
                </Route>

                {/* Course Routes */}
                <Route path="/course/:courseId" element={<RequireAuth><CoursePage /></RequireAuth>} />
                <Route path="/course/:courseId/certificate" element={<RequireAuth><Certificate /></RequireAuth>} />
                <Route path="/course/:courseId/quiz" element={<RequireAuth><QuizPage /></RequireAuth>} />

                {/* Payment Routes */}
                <Route path="/payment-success/:planId" element={<RequireAuth><PaymentSuccess /></RequireAuth>} />
                <Route path="/payment-pending" element={<RequireAuth><PaymentPending /></RequireAuth>} />
                <Route path="/payment-failed" element={<PaymentFailed />} />

                {/* Static Pages */}
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                {publicPolicies.map(({ path, ...config }) => (
                  <Route key={path} path={path} element={<PolicyPage config={config} />} />
                ))}
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogPost />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
                  <Route index element={<Suspense fallback={<AdminLoading />}><AdminDashboard /></Suspense>} />
                  <Route path="users" element={<Suspense fallback={<AdminLoading />}><AdminUsers /></Suspense>} />
                  <Route path="courses" element={<Suspense fallback={<AdminLoading />}><AdminCourses /></Suspense>} />
                  <Route path="paid-users" element={<Suspense fallback={<AdminLoading />}><AdminPaidUsers /></Suspense>} />
                  <Route path="admins" element={<Suspense fallback={<AdminLoading />}><AdminAdmins /></Suspense>} />
                  <Route path="contacts" element={<Suspense fallback={<AdminLoading />}><AdminContacts /></Suspense>} />
                  {adminPolicies.map(([path, title, subtitle, cardTitle, storageKey, apiType, placeholder, successMessage]) => (
                    <Route
                      key={path}
                      path={path}
                      element={
                        <Suspense fallback={<AdminLoading />}>
                          <AdminPolicyEditor config={{ title, subtitle, cardTitle, storageKey, apiType, placeholder, successMessage }} />
                        </Suspense>
                      }
                    />
                  ))}
                  <Route path="create-blog" element={<Suspense fallback={<AdminLoading />}><AdminCreateBlog /></Suspense>} />
                  <Route path="blogs" element={<Suspense fallback={<AdminLoading />}><AdminBlogs /></Suspense>} />
                </Route>

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </GoogleOAuthProvider>
);

export default App;
