import { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "../../context/useAuth";

const API_BASE = "http://127.0.0.1:8000";

export default function AdminDelivery() {
  const { user } = useAuth();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentOrders, setAgentOrders] = useState([]);

  /* ================= FETCH DATA ================= */

  const fetchOverview = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/orders/admin/delivery/overview`, {
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch overview");

      const data = await res.json();
      setAgents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Delivery overview error:", err);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchAgentOrders = async (agentId) => {
    try {
      const res = await fetch(`${API_BASE}/orders/all`, {
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
      });

      const data = await res.json();

      const filtered = data.filter(
        (o) => o.delivery_id === agentId
      );

      setAgentOrders(filtered);
    } catch (err) {
      console.error("Failed fetching agent orders", err);
      setAgentOrders([]);
    }
  };

  useEffect(() => {
    if (user?.access_token) {
      fetchOverview();
    }
  }, [user, fetchOverview]);

  /* ================= STATUS DISPLAY ================= */

  const getDisplayStatus = (order) => {
    if (order.delivery_status === "in_transit") {
      return {
        text: "DELIVERY ON THE WAY",
        style: "bg-yellow-500/15 text-yellow-400",
      };
    }

    const map = {
      pending: {
        text: "PENDING",
        style: "bg-yellow-500/15 text-yellow-400",
      },
      assigned: {
        text: "ASSIGNED",
        style: "bg-blue-500/15 text-blue-400",
      },
      collected: {
        text: "COLLECTED",
        style: "bg-cyan-500/15 text-cyan-400",
      },
      completed: {
        text: "COMPLETED",
        style: "bg-green-500/15 text-green-400",
      },
      rejected: {
        text: "REJECTED",
        style: "bg-red-500/15 text-red-400",
      },
    };

    return map[order.status] || {
      text: order.status?.toUpperCase(),
      style: "bg-gray-500/15 text-gray-400",
    };
  };

  /* ================= KPI CALCULATIONS ================= */

  const {
    totalActive,
    totalCompleted,
    totalRevenue,
    disabledCount,
  } = useMemo(() => {
    const active = agents.reduce(
      (sum, a) => sum + (a.active_orders || 0),
      0
    );

    const completed = agents.reduce(
      (sum, a) => sum + (a.completed_orders || 0),
      0
    );

    const revenue = agents.reduce(
      (sum, a) => sum + (a.total_revenue || 0),
      0
    );

    const disabled = agents.filter(
      (a) => a.disabled === true
    ).length;

    return {
      totalActive: active,
      totalCompleted: completed,
      totalRevenue: revenue,
      disabledCount: disabled,
    };
  }, [agents]);

  return (
    <div className="relative min-h-screen bg-[#0b0f1a] text-white overflow-hidden">

      {/* Background Glow */}
      <div className="absolute -top-40 -left-40 w-[420px] h-[420px] bg-blue-600/20 blur-[140px] rounded-full" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[420px] h-[420px] bg-cyan-500/20 blur-[140px] rounded-full" />

      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24">

        {/* HEADER */}
        <div className="mb-14">
          <h1 className="text-5xl font-extrabold mb-3">
            Delivery Operations Control
          </h1>
          <p className="text-gray-400 text-lg">
            Monitor performance, workload distribution and delivery efficiency.
          </p>
        </div>

        {/* KPI SUMMARY */}
        <div className="grid md:grid-cols-4 gap-6 mb-14">
          <KPI label="Active Deliveries" value={totalActive} />
          <KPI label="Completed Deliveries" value={totalCompleted} />
          <KPI
            label="Total Revenue (₹)"
            value={totalRevenue.toFixed(2)}
            highlight
          />
          <KPI label="Disabled Agents" value={disabledCount} danger />
        </div>

        {/* DELIVERY TABLE */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-300 text-sm">
              <tr>
                <th className="px-6 py-5">Agent</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Active Orders</th>
                <th className="px-6 py-5">Completed</th>
                <th className="px-6 py-5">Revenue (₹)</th>
                <th className="px-6 py-5">Efficiency</th>
                <th className="px-6 py-5">Action</th>
              </tr>
            </thead>

            <tbody>
              {!loading &&
                agents.map((agent) => {
                  const activeOrders = agent.active_orders || 0;
                  const completedOrders = agent.completed_orders || 0;
                  const rejectedOrders = agent.rejected_orders || 0;

                  const totalHandled =
                    activeOrders + completedOrders + rejectedOrders;

                  const efficiency =
                    totalHandled > 0
                      ? ((completedOrders / totalHandled) * 100).toFixed(0)
                      : 0;

                  return (
                    <tr
                      key={agent._id}
                      className="border-t border-white/10 hover:bg-white/5 transition"
                    >
                      <td className="px-6 py-5 font-medium">
                        {agent.email}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`px-4 py-1.5 rounded-full text-sm ${agent.disabled
                            ? "bg-red-500/15 text-red-400"
                            : "bg-green-500/15 text-green-400"
                            }`}
                        >
                          {agent.disabled ? "DISABLED" : "ACTIVE"}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-cyan-400 font-semibold">
                        {activeOrders}
                      </td>

                      <td className="px-6 py-5 text-emerald-400 font-semibold">
                        {completedOrders}
                      </td>

                      <td className="px-6 py-5 text-yellow-400 font-semibold">
                        ₹ {(agent.total_revenue || 0).toFixed(2)}
                      </td>

                      <td className="px-6 py-5">
                        <EfficiencyBar percent={efficiency} />
                      </td>

                      <td className="px-6 py-5">
                        <button
                          onClick={() => {
                            setSelectedAgent(agent);
                            fetchAgentOrders(agent._id);
                          }}
                          className="text-cyan-400 hover:underline"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </section>

      {/* AGENT DETAIL MODAL */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-8 w-full max-w-2xl max-h-[85vh] overflow-y-auto">

            <h2 className="text-2xl font-bold mb-6">
              Delivery Agent Details
            </h2>

            <Detail label="Email" value={selectedAgent.email} />

            <h3 className="text-lg font-semibold mt-6 mb-4 text-cyan-400">
              Assigned Orders
            </h3>

            {agentOrders.length === 0 && (
              <p className="text-gray-400">No orders assigned</p>
            )}

            {agentOrders.map((order) => {
              const status = getDisplayStatus(order);

              return (
                <div
                  key={order._id}
                  className="bg-white/5 border border-white/10 rounded-xl p-5 mb-4"
                >
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-sm text-gray-400">
                      Order ID: {order._id}
                    </p>
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${status.style}`}
                    >
                      {status.text}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm">
                    <p><strong>User Email:</strong> {order.user_email}</p>
                    <p><strong>User Name:</strong> {order.payout_details?.full_name || "N/A"}</p>
                    <p><strong>User Phone:</strong> {
                      order.payout_details
                        ? `${order.payout_details.country_code} ${order.payout_details.phone_number}`
                        : "N/A"
                    }</p>
                  </div>
                </div>
              );
            })}

            <button
              onClick={() => setSelectedAgent(null)}
              className="w-full mt-6 bg-cyan-500 hover:bg-cyan-600 py-2 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= COMPONENTS================= */

function KPI({ label, value, highlight, danger }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl">
      <p className="text-gray-400 text-sm">{label}</p>
      <p
        className={`text-3xl font-bold mt-2 ${highlight
          ? "text-green-400"
          : danger
            ? "text-red-400"
            : "text-cyan-400"
          }`}
      >
        {value}
      </p>
    </div>
  );
}

function EfficiencyBar({ percent }) {
  return (
    <div className="w-full bg-white/10 rounded-full h-3">
      <div
        className="bg-cyan-400 h-3 rounded-full transition-all duration-500"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <>
      <p className="text-gray-400 mb-2">{label}</p>
      <p className="mb-4 font-semibold text-white">{value}</p>
    </>
  );
}
