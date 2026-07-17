import { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "../../context/useAuth";
import MessageModal from "../../components/modals/MessageModal";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const statusPriority = {
  pending: 1,
  assigned: 2,
  collected: 3,
  completed: 4,
  rejected: 5,
};

export default function AdminOrders() {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [filter, setFilter] = useState("all");
  const [confirmApprove, setConfirmApprove] = useState(null);
  const [messageConfig, setMessageConfig] = useState(null);

  /* =========================================================
     FETCH ORDERS 
  ========================================================= */
  const fetchOrders = useCallback(async () => {
    if (!user?.access_token) return;

    try {
      const res = await fetch(`${API_BASE}/orders/all`, {
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrders(data);
    } catch {
      console.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const sortedOrders = useMemo(() => {
    return [...orders].sort(
      (a, b) => statusPriority[a.status] - statusPriority[b.status]
    );
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (filter === "all") return sortedOrders;
    return sortedOrders.filter((o) => o.status === filter);
  }, [sortedOrders, filter]);

  /* =========================================================
     ACTIONS
  ========================================================= */
  const approveOrder = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${id}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setMessageConfig({
          type: "error",
          title: "Approval Failed",
          message: data.detail || "Failed to approve order",
        });
        return;
      }

      setMessageConfig({
        type: "success",
        title: "Order Approved",
        message: "Order has been approved and assigned to a delivery partner.",
      });
      fetchOrders();
    } catch (err) {
      setMessageConfig({
        type: "error",
        title: "Network Error",
        message: "Failed to connect to the server.",
      });
    } finally {
      setConfirmApprove(null);
      setSelectedOrder(null);
    }
  };

  const rejectOrder = async () => {
    if (!rejectReason) return;

    setRejecting(true);

    await fetch(`${API_BASE}/orders/${selectedOrder._id}/reject`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${user.access_token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ reason: rejectReason }),
    });

    setRejectReason("");
    setSelectedOrder(null);
    setRejecting(false);
    fetchOrders();
  };

  const executePayout = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${id}/payout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setMessageConfig({
          type: "error",
          title: "Payout Failed",
          message: data.detail || "Failed to execute payout",
        });
        return;
      }

      setMessageConfig({
        type: "success",
        title: "Payout Successful",
        message: "The payout has been executed successfully via PayPal!",
      });
      fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      setMessageConfig({
        type: "error",
        title: "Network Error",
        message: "Failed to connect to the server.",
      });
    }
  };

  /* =========================================================
     STATUS BADGE
  ========================================================= */
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

  const renderLocation = (order) => {
    return order?.location?.address?.display_name || "Location not available";
  };

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white px-6 py-16">

      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-12">
        <h1 className="text-5xl font-extrabold mb-3">Order Management</h1>
        <p className="text-gray-400">
          Monitor, verify and manage all platform orders.
        </p>
      </div>

      {/* FILTERS */}
      <div className="max-w-7xl mx-auto flex gap-3 mb-8 flex-wrap">
        {["all", "pending", "assigned", "collected", "completed", "rejected"].map(
          (f) => (
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
          )
        )}
      </div>

      {/* TABLE */}
      <div className="max-w-7xl mx-auto bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-gray-300 text-sm">
            <tr>
              <th className="px-6 py-5">User</th>
              <th className="px-6 py-5">Material</th>
              <th className="px-6 py-5">Price</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.map((o) => (
              <tr
                key={o._id}
                className="border-t border-white/10 hover:bg-white/5 transition"
              >
                <td className="px-6 py-5 flex items-center gap-2">
                  {o.user_email}

                  {(o.user_deleted || o.user_disabled) && (
                    <span className="text-yellow-400 text-xs bg-yellow-500/10 border border-yellow-500/30 px-2 py-1 rounded-full">
                      User Deleted/Disabled
                    </span>
                  )}
                </td>

                <td className="px-6 py-5 capitalize">{o.material}</td>

                <td className="px-6 py-5 text-green-400 font-semibold">
                  ₹ {o.estimated_price}
                </td>

                <td className="px-6 py-5">
                  {(() => {
                    const status = getDisplayStatus(o);
                    return (
                      <span
                        className={`px-4 py-1.5 rounded-full text-sm font-medium ${status.style}`}
                      >
                        {status.text}
                      </span>
                    );
                  })()}
                </td>

                <td className="px-6 py-5">
                  <button
                    onClick={() => setSelectedOrder(o)}
                    className="text-cyan-400 hover:underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && (
          <div className="py-10 text-center text-gray-400">
            Loading orders...
          </div>
        )}
      </div>

      {/* ================= MODAL ================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center px-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">

            <div className="p-6 border-b border-white/10 flex justify-between">
              <h2 className="text-2xl font-bold">Order Verification</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {(selectedOrder.user_deleted || selectedOrder.user_disabled) && (
              <div className="mx-6 mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-sm text-yellow-300">
                ⚠ This order belongs to a deleted or disabled user.
                The order remains for audit and compliance purposes.
              </div>
            )}

            <div className="p-6 overflow-y-auto space-y-6">
              <img
                src={`${API_BASE}${selectedOrder.image_url}`}
                className="w-full rounded-2xl border border-white/10"
              />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <Info label="Material" value={selectedOrder.material} />
                <Info label="Weight" value={`${selectedOrder.weight} kg`} />
                <Info
                  label={(selectedOrder.status === "collected" || selectedOrder.status === "completed") ? "Final Price" : "Estimated Price"}
                  value={`₹ ${selectedOrder.estimated_price}`}
                  highlight
                />
                <Info
                  label="Pickup Location"
                  value={renderLocation(selectedOrder)}
                  full
                />
              </div>

              {selectedOrder.status === "pending" && (
                <textarea
                  placeholder="Rejection reason (required)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3"
                />
              )}
            </div>

            {selectedOrder.status === "pending" && (
              <div className="p-6 border-t border-white/10 flex gap-3">
                <button
                  onClick={() => setConfirmApprove(selectedOrder._id)}
                  className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600 font-semibold"
                >
                  Approve & Assign
                </button>

                <button
                  disabled={!rejectReason || rejecting}
                  onClick={rejectOrder}
                  className="flex-1 py-3 rounded-xl bg-red-500/80 hover:bg-red-600 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            )}

            {selectedOrder.status === "collected" && selectedOrder.payment_status !== "paid" && (
              <div className="p-6 border-t border-white/10">
                <button
                  onClick={() => executePayout(selectedOrder._id)}
                  className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold text-lg shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-icons-outlined">payments</span>
                  Execute PayPal Payout ($)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* APPROVAL CONFIRMATION MODAL */}
      {confirmApprove && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="bg-[#111827] p-8 rounded-2xl border border-white/10 text-center w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              Confirm Order Approval
            </h3>
            <p className="text-gray-400 mb-6">
              This will assign a delivery agent automatically.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => approveOrder(confirmApprove)}
                className="flex-1 bg-green-500 hover:bg-green-600 py-2 rounded-lg"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmApprove(null)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {messageConfig && (
        <MessageModal
          type={messageConfig.type}
          title={messageConfig.title}
          message={messageConfig.message}
          onClose={() => setMessageConfig(null)}
        />
      )}
    </div>
  );
}

function Info({ label, value, highlight, full }) {
  return (
    <div
      className={`bg-white/5 p-4 rounded-xl border border-white/10 ${full ? "col-span-2" : ""
        }`}
    >
      <p className="text-gray-400 mb-1">{label}</p>
      <p className={`${highlight ? "text-green-400 font-semibold" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}
