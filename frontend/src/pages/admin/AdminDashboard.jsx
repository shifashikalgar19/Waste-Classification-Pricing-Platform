import { useEffect, useState } from "react";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    pendingOrders: 0,
    approvedOrders: 0,
    activeDeliveries: 0,
    users: 0,
    admins: 0,
    deliveryAgents: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.access_token) return;

    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/stats`, {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to load stats");

        const data = await res.json();
        setStats(data);
      } catch {
        // fallback (keeps UI stable if backend not ready)
        setStats({
          pendingOrders: 0,
          approvedOrders: 0,
          activeDeliveries: 0,
          users: 0,
          admins: 0,
          deliveryAgents: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return (
    <div className="relative min-h-screen bg-[#0b0f1a] text-white overflow-hidden">

      <div className="absolute -top-40 -left-40 w-[420px] h-[420px] bg-blue-600/20 blur-[140px] rounded-full" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[420px] h-[420px] bg-cyan-500/20 blur-[140px] rounded-full" />

      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24">

        {/* HEADER */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 mb-14">
          <h1 className="text-4xl font-extrabold mb-2">
            Admin Control Panel
          </h1>
          <p className="text-gray-400">
            Logged in as{" "}
            <span className="text-cyan-400 font-medium">
              {user?.email}
            </span>
          </p>
        </div>

        <h2 className="text-xl font-semibold mb-6">
          Quick Actions
        </h2>

        <div className="grid md:grid-cols-3 gap-6 mb-16">

          <ActionCard
            title="Review Orders"
            desc="Verify scrap quality, view images, approve or reject orders"
            onClick={() => navigate("/admin/orders")}
          />

          <ActionCard
            title="Manage Users"
            desc="View users, create admins & delivery agents"
            onClick={() => navigate("/admin/users")}
          />

          <ActionCard
            title="Delivery Agents"
            desc="Assign, monitor and manage deliveries"
            onClick={() => navigate("/admin/delivery")}
          />

        </div>

        {/* SYSTEM OVERVIEW */}
        <h2 className="text-xl font-semibold mb-6">
          System Overview
        </h2>

        <div className="grid md:grid-cols-4 gap-6">

          <StatCard
            label="Pending Orders"
            value={stats.pendingOrders}
            loading={loading}
          />

          <StatCard
            label="Approved Orders"
            value={stats.approvedOrders}
            loading={loading}
          />

          <StatCard
            label="Active Deliveries"
            value={stats.activeDeliveries}
            loading={loading}
          />

          <StatCard
            label="Registered Users"
            value={stats.users}
            loading={loading}
          />

        </div>

        {/* USER BREAKDOWN */}
        <div className="grid md:grid-cols-3 gap-6 mt-10">

          <MiniStat
            label="Admins"
            value={stats.admins}
            loading={loading}
          />

          <MiniStat
            label="Delivery Agents"
            value={stats.deliveryAgents}
            loading={loading}
          />

          <MiniStat
            label="End Users"
            value={stats.users}
            loading={loading}
          />

        </div>

      </section>
    </div>
  );
}

/* ===================== COMPONENTS ===================== */

function ActionCard({ title, desc, onClick }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-6 transition"
    >
      <h3 className="text-lg font-semibold mb-2">
        {title}
      </h3>
      <p className="text-gray-400 text-sm">
        {desc}
      </p>
    </div>
  );
}

function StatCard({ label, value, loading }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <p className="text-gray-400 text-sm">
        {label}
      </p>
      <p className="text-3xl font-bold text-cyan-400 mt-2">
        {loading ? "—" : value}
      </p>
    </div>
  );
}

function MiniStat({ label, value, loading }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
      <p className="text-gray-400 text-sm">
        {label}
      </p>
      <p className="text-2xl font-bold text-cyan-400 mt-2">
        {loading ? "—" : value}
      </p>
    </div>
  );
}
