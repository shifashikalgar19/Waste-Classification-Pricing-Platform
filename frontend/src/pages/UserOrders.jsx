import { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "../context/useAuth";
import PayoutSetupModal from "../components/modals/PayoutSetupModal";

const API_BASE = "http://127.0.0.1:8000";

export default function UserOrders() {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [payoutConfigured, setPayoutConfigured] = useState(false);

  /* ================= CHECK IF USER HAS GLOBAL PAYOUT ================= */
  const checkPayoutStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/users/me`, {
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
      });

      if (!res.ok) return;

      const data = await res.json();
      setPayoutConfigured(!!data?.payout_details?.upi_id);
    } catch {
      setPayoutConfigured(false);
    }
  }, [user]);

  /* ================= FETCH ORDERS ================= */
  const fetchOrders = useCallback(async () => {
    if (!user?.access_token) return;

    try {
      const res = await fetch(`${API_BASE}/orders/my`, {
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setOrders(data);
      setError("");
    } catch {
      setError("Unable to load your orders");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
    checkPayoutStatus();

    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders, checkPayoutStatus]);

  /* ================= FILTER ================= */
  const filteredOrders = useMemo(() => {
    if (filter === "all") return orders;
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  /* ================= STATUS DISPLAY ================= */
  const displayStatus = (order) => {
    if (order.delivery_status === "in_transit") {
      return "DELIVERY ON THE WAY";
    }
    return order.status.toUpperCase();
  };

  const statusStyle = (order) => {
    if (order.delivery_status === "in_transit")
      return "bg-yellow-500/15 text-yellow-400";

    switch (order.status) {
      case "pending":
        return "bg-yellow-500/15 text-yellow-400";
      case "assigned":
        return "bg-blue-500/15 text-blue-400";
      case "collected":
        return "bg-cyan-500/15 text-cyan-400";
      case "completed":
        return "bg-green-500/15 text-green-400";
      case "rejected":
        return "bg-red-500/15 text-red-400";
      default:
        return "bg-gray-500/15 text-gray-400";
    }
  };

  if (loading) return <div className="p-10 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white">
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-24">

        {/* HEADER */}
        <div className="mb-14">
          <h1 className="text-5xl font-extrabold mb-3">My Orders</h1>
          <p className="text-gray-400 text-lg">
            Track the lifecycle of your scrap pickup requests
          </p>
        </div>

        {/* FILTER */}
        <div className="flex gap-3 mb-10 flex-wrap">
          {["all", "pending", "assigned", "collected", "completed", "rejected"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition ${filter === f
                ? "bg-cyan-500/20 text-cyan-400"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {error && <p className="text-red-400">{error}</p>}

        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-300 text-sm">
              <tr>
                <th className="px-6 py-5">Material</th>
                <th className="px-6 py-5">Weight</th>
                <th className="px-6 py-5">Price</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Created</th>
                <th className="px-6 py-5">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id} className="border-t border-white/10">

                  <td className="px-6 py-5">{order.material}</td>
                  <td className="px-6 py-5">{order.weight} kg</td>
                  <td className="px-6 py-5 text-green-400">
                    ₹ {order.estimated_price}
                  </td>

                  <td className="px-6 py-5">
                    <span className={`px-4 py-1.5 rounded-full text-sm ${statusStyle(order)}`}>
                      {displayStatus(order)}
                      {(order.status === "collected" || order.status === "completed") && " (FINAL)"}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-gray-400 text-sm">
                    {new Date(order.created_at).toLocaleString()}
                  </td>

                  <td className="px-6 py-5 space-x-3">

                    {/* ADMIN REJECTED */}
                    {order.status === "rejected" && (
                      <span className="text-red-400 text-sm">
                        Rejected: {order.rejection_reason || "No reason provided"}
                      </span>
                    )}

                    {/* AFTER ADMIN APPROVES (ONLY IF PAYOUT NOT FILLED) */}
                    {order.status === "assigned" &&
                      order.delivery_status !== "in_transit" &&
                      !payoutConfigured && (
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowPayoutModal(true);
                          }}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-xl text-sm font-semibold"
                        >
                          Enter Your Payout Details
                        </button>
                      )}

                    {/* WHEN DELIVERY STARTS */}
                    {order.delivery_status === "in_transit" && (
                      <button
                        onClick={() => setSelectedDelivery(order)}
                        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-xl text-sm font-semibold"
                      >
                        View Delivery Boy Details
                      </button>
                    )}

                    {/* COMPLETED */}
                    {order.status === "completed" && (
                      <span className="text-emerald-400 text-sm">
                        Payment Sent Successfully ✔
                      </span>
                    )}

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </section>

      {/* DELIVERY DETAILS MODAL */}
      {selectedDelivery && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#0f172a] p-8 rounded-2xl w-full max-w-md border border-white/10">

            <h2 className="text-2xl font-bold mb-6">
              Delivery Boy Details
            </h2>

            <p className="mb-3">
              <strong>Name:</strong> {selectedDelivery.delivery_agent_name || "N/A"}
            </p>

            <p className="mb-3">
              <strong>Email:</strong> {selectedDelivery.delivery_agent_email || "N/A"}
            </p>

            <p className="mb-6">
              <strong>Phone:</strong> {selectedDelivery.delivery_agent_phone || "N/A"}
            </p>

            <button
              onClick={() => setSelectedDelivery(null)}
              className="w-full bg-cyan-500 hover:bg-cyan-600 py-2 rounded-lg"
            >
              Close
            </button>

          </div>
        </div>
      )}

      {/* PAYOUT MODAL */}
      {showPayoutModal && (
        <PayoutSetupModal
          token={user.access_token}
          orderId={selectedOrder?._id}
          onClose={() => {
            setShowPayoutModal(false);
            fetchOrders();
            checkPayoutStatus();
          }}
        />
      )}
    </div>
  );
}
