import { NavLink } from "react-router-dom";

export default function AdminSidebar({ onLogout }) {
  return (
    <div className="h-full flex flex-col">

      {/* LOGO */}
      <div className="px-6 py-6 text-2xl font-extrabold tracking-wide text-cyan-400">
        ScrapX Admin
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 space-y-2">

        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive
              ? "bg-cyan-500/15 text-cyan-400"
              : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`
          }
        >
          <span className="material-icons-outlined text-xl">shield</span>
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/orders"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive
              ? "bg-cyan-500/15 text-cyan-400"
              : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`
          }
        >
          <span className="material-icons-outlined text-xl">fact_check</span>
          Review Orders
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive
              ? "bg-cyan-500/15 text-cyan-400"
              : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`
          }
        >
          <span className="material-icons-outlined text-xl">group</span>
          Users
        </NavLink>

        <NavLink
          to="/admin/delivery"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive
              ? "bg-cyan-500/15 text-cyan-400"
              : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`
          }
        >
          <span className="material-icons-outlined text-xl">local_shipping</span>
          Delivery Agents
        </NavLink>

        <NavLink
          to="/admin/payments"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive
              ? "bg-cyan-500/15 text-cyan-400"
              : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`
          }
        >
          <span className="material-icons-outlined text-xl">payments</span>
          Payments
        </NavLink>

        <div className="my-4 border-t border-white/10" />

        <NavLink
          to="/admin/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive
              ? "bg-cyan-500/15 text-cyan-400"
              : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`
          }
        >
          <span className="material-icons-outlined text-xl">manage_accounts</span>
          Account
        </NavLink>

      </nav>

      {/* LOGOUT (BOTTOM FIXED) */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition"
        >
          <span className="material-icons-outlined text-xl">logout</span>
          Logout
        </button>
      </div>

    </div>
  );
}
