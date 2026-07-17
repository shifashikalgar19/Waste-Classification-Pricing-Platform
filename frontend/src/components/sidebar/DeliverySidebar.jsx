import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

export default function DeliverySidebar() {
  const { logout } = useAuth();

  return (
    <div className="h-full flex flex-col">

      {/* LOGO */}
      <div className="px-6 py-6 text-2xl font-extrabold tracking-wide text-green-400">
        ScrapX Delivery
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 space-y-2">

        {/* DASHBOARD */}
        <NavLink
          to="/delivery"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive
                ? "bg-green-500/15 text-green-400"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`
          }
        >
          <span className="material-icons-outlined text-xl">
            dashboard
          </span>
          Dashboard
        </NavLink>

        {/* MY ASSIGNMENTS */}
        <NavLink
          to="/delivery/assignments"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive
                ? "bg-green-500/15 text-green-400"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`
          }
        >
          <span className="material-icons-outlined text-xl">
            local_shipping
          </span>
          My Assignments
        </NavLink>

        {/* COMPLETED */}
        <NavLink
          to="/delivery/completed"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive
                ? "bg-green-500/15 text-green-400"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`
          }
        >
          <span className="material-icons-outlined text-xl">
            task_alt
          </span>
          Completed Orders
        </NavLink>

        <div className="my-4 border-t border-white/10" />

        {/* ACCOUNT */}
        <NavLink
          to="/delivery/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive
                ? "bg-green-500/15 text-green-400"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`
          }
        >
          <span className="material-icons-outlined text-xl">
            manage_accounts
          </span>
          Account
        </NavLink>

      </nav>

      {/* LOGOUT */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition"
        >
          <span className="material-icons-outlined text-xl">
            logout
          </span>
          Logout
        </button>
      </div>

    </div>
  );
}
