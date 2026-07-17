import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";

// Public pages
import Home from "./pages/Home";
import About from "./pages/About";
import Features from "./pages/Features";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Layout
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// User
import UserHome from "./pages/UserHome";
import UserOrders from "./pages/UserOrders";
import UserProfile from "./pages/UserProfile";
import Predict from "./pages/Predict";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminDelivery from "./pages/admin/AdminDelivery";
import AdminPayments from "./pages/admin/AdminPayments";

// Delivery
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";
import DeliveryAssignments from "./pages/delivery/DeliveryAssignments";
import DeliveryCompleted from "./pages/delivery/DeliveryCompleted";
import DeliveryProfile from "./pages/delivery/DeliveryProfile";


export default function App() {
  const location = useLocation();

  // 👇 hide navbar on dashboard routes
  const hideNavbar =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/delivery");

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/predict" element={<Predict />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ================= USER DASHBOARD ================= */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="user">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserHome />} />
          <Route path="predict" element={<Predict />} />
          <Route path="orders" element={<UserOrders />} />
          <Route path="profile" element={<UserProfile />} />
        </Route>

        {/* ================= ADMIN DASHBOARD ================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="delivery" element={<AdminDelivery />} />
          <Route path="payments" element={<AdminPayments />} />
        </Route>

        {/* ================= DELIVERY DASHBOARD ================= */}
        <Route
          path="/delivery"
          element={
            <ProtectedRoute role="delivery">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DeliveryDashboard />} />
          <Route path="assignments" element={<DeliveryAssignments />} />
          <Route path="completed" element={<DeliveryCompleted />} />
          <Route path="profile" element={<DeliveryProfile />} />

        </Route>
      </Routes>
    </>
  );
}
