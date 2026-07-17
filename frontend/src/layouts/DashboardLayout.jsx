import { Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

import UserSidebar from "../components/sidebar/UserSidebar";
import AdminSidebar from "../components/sidebar/AdminSidebar";
import DeliverySidebar from "../components/sidebar/DeliverySidebar";

export default function DashboardLayout() {
  const { user, logout } = useAuth();

  const renderSidebar = () => {
    if (!user) return null;

    switch (user.role) {
      case "admin":
        return <AdminSidebar onLogout={logout} />;
      case "delivery":
        return <DeliverySidebar onLogout={logout} />;
      default:
        return <UserSidebar onLogout={logout} />;
    }
  };

  return (
    <div className="h-screen flex bg-[#0b0f1a] text-white overflow-hidden overflow-x-hidden">

      
      {/* ================= SIDEBAR================= */}
      <aside className="w-64 bg-black/40 backdrop-blur-xl border-r border-white/10 fixed inset-y-0 left-0 z-40">
        {renderSidebar()}
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="ml-64 flex-1 h-screen overflow-y-auto">
        <div className="min-h-full p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
