import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "../../context/useAuth";
import MessageModal from "../../components/modals/MessageModal";

const API_BASE = "http://127.0.0.1:8000";

export default function DeliveryAssignments() {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [filter, setFilter] = useState("all");

  const [orderToComplete, setOrderToComplete] = useState(null);
  const [messageConfig, setMessageConfig] = useState(null);


  const fetchAssignments = useCallback(async () => {
    if (!user?.access_token) return;

    try {
      const res = await fetch(
        `${API_BASE}/orders/delivery/my-assignments`,
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        }
      );

      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch assignments", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  /* ================= FILTER ================= */

  const filteredOrders = useMemo(() => {
    if (filter === "all") return orders;
    return orders.filter(
      (o) => (o.delivery_status || o.status) === filter
    );
  }, [orders, filter]);

  /* ================= KPI ================= */

  const stats = useMemo(() => {
    const count = (status) =>
      orders.filter(
        (o) => (o.delivery_status || o.status) === status
      ).length;

    return {
      assigned: count("assigned"),
      in_transit: count("in_transit"),
      collected: count("collected"),
      completed: count("completed"),
    };
  }, [orders]);

  /* ================= NAVIGATION ================= */

  const navigateToUser = (order) => {
    const { latitude, longitude } = order.location;

    if (!navigator.geolocation) {
      setMessageConfig({
        type: "error",
        title: "Navigation Error",
        message: "Geolocation is not supported by your browser.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const originLat = position.coords.latitude;
        const originLng = position.coords.longitude;

        const url = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${latitude},${longitude}&travelmode=driving`;

        window.open(url, "_blank");
      },
      (error) => {
        console.error("GPS error:", error);

        const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;

        window.open(fallbackUrl, "_blank");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };


  /* ================= START PICKUP ================= */
  const [starting, setStarting] = useState(false);

  const startPickup = async (order) => {
    setStarting(true);
    try {
      const res = await fetch(
        `${API_BASE}/orders/${order._id}/delivery/left`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        }
      );

      if (res.ok) {
        setSelectedOrder(null);
        fetchAssignments();
      } else {
        const data = await res.json();
        setMessageConfig({
          type: "error",
          title: "Pickup Failed",
          message: data.detail || "Failed to start pickup",
        });
      }
    } catch (err) {
      console.error("Start pickup error", err);
      setMessageConfig({
        type: "error",
        title: "Network Error",
        message: "Network error starting pickup",
      });
    } finally {
      setStarting(false);
    }
  };

  /* ================= STATUS STYLE ================= */

  const statusStyle = (status) => {
    switch (status) {
      case "assigned":
        return "bg-blue-500/15 text-blue-400";
      case "in_transit":
        return "bg-yellow-500/15 text-yellow-400";
      case "collected":
        return "bg-cyan-500/15 text-cyan-400";
      case "completed":
        return "bg-green-500/15 text-green-400";
      default:
        return "bg-gray-500/15 text-gray-400";
    }
  };

  /* ================= UI ================= */

  return (
    <div className="relative min-h-screen bg-[#0b0f1a] text-white overflow-hidden">

      {/* Background Glow */}
      <div className="absolute -top-40 -left-40 w-[420px] h-[420px] bg-green-600/20 blur-[140px] rounded-full" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[420px] h-[420px] bg-cyan-500/20 blur-[140px] rounded-full" />

      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24">

        {/* HEADER */}
        <div className="mb-14">
          <h1 className="text-5xl font-extrabold mb-3">
            Delivery Control Center
          </h1>
          <p className="text-gray-400 text-lg">
            Manage assignments and track real-time pickup progress.
          </p>
        </div>

        {/* KPI SECTION */}
        <div className="grid md:grid-cols-4 gap-6 mb-14">
          <KPI label="Assigned" value={stats.assigned} blue />
          <KPI label="On The Way" value={stats.in_transit} yellow />
          <KPI label="Collected" value={stats.collected} cyan />
          <KPI label="Completed" value={stats.completed} green />
        </div>

        {/* FILTER BAR */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {["all", "assigned", "in_transit", "collected", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition ${filter === f
                ? "bg-cyan-500/20 text-cyan-400"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
            >
              {f.replace("_", " ").toUpperCase()}
            </button>
          ))}
        </div>

        {/* TABLE */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-300 text-sm">
              <tr>
                <th className="px-6 py-5">Material</th>
                <th className="px-6 py-5">User</th>
                <th className="px-6 py-5">Price</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-gray-400">
                    Loading assignments...
                  </td>
                </tr>
              )}

              {!loading &&
                filteredOrders.map((order) => {
                  const status =
                    order.delivery_status || order.status;

                  return (
                    <tr
                      key={order._id}
                      className="border-t border-white/10 hover:bg-white/5 transition"
                    >
                      <td className="px-6 py-5 font-semibold capitalize">
                        {order.material}
                      </td>

                      <td className="px-6 py-5 text-gray-300">
                        <div className="flex items-center gap-3">
                          <span>{order.user_email}</span>

                          <button
                            onClick={() => setSelectedUserDetails(order)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/40 transition"
                            title="View User Details"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-4 h-4 text-cyan-400"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" y1="16" x2="12" y2="12" />
                              <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                          </button>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-green-400 font-semibold">
                        ₹ {order.estimated_price}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`px-4 py-1.5 rounded-full text-sm ${statusStyle(
                            status
                          )}`}
                        >
                          {status.replace("_", " ").toUpperCase()}
                        </span>
                      </td>

                      <td className="px-6 py-5 space-x-3">
                        <button
                          onClick={() => navigateToUser(order)}
                          className="text-cyan-400 hover:underline"
                        >
                          Navigate
                        </button>

                        {order.delivery_status === "assigned" && (
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-yellow-400 hover:underline"
                          >
                            Start Pickup
                          </button>
                        )}

                        {order.delivery_status === "in_transit" && (
                          <button
                            onClick={() => setOrderToComplete(order)}
                            className="text-emerald-400 font-bold hover:underline"
                          >
                            Complete Order
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL */}
      {/* USER DETAILS MODAL */}
      {selectedUserDetails && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-3xl p-8 shadow-2xl">

            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">
                User Information
              </h2>

              <button
                onClick={() => setSelectedUserDetails(null)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            {/* USER BASIC INFO */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">

              <Info label="Full Name" value={
                selectedUserDetails.payout_details?.full_name || "Not Provided"
              } />

              <Info label="Email" value={selectedUserDetails.user_email} />

              <Info label="Phone Number" value={
                selectedUserDetails.payout_details
                  ? `${selectedUserDetails.payout_details.country_code} ${selectedUserDetails.payout_details.phone_number}`
                  : "Not Provided"
              } />

              <Info label="Material" value={selectedUserDetails.material} />

            </div>

            {/* ADDRESS SECTION */}
            {selectedUserDetails.payout_details && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <p className="text-cyan-400 font-semibold mb-4">
                  Pickup Address
                </p>

                <div className="space-y-2 text-gray-300">
                  <p>
                    {selectedUserDetails.payout_details.building}
                  </p>

                  <p>
                    Flat {selectedUserDetails.payout_details.flat}
                  </p>

                  <p>
                    {selectedUserDetails.payout_details.area}
                  </p>

                  <p>
                    {selectedUserDetails.payout_details.city},{" "}
                    {selectedUserDetails.payout_details.state}
                  </p>

                  <p>
                    Pincode: {selectedUserDetails.payout_details.pincode}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedUserDetails(null)}
              className="w-full mt-8 bg-cyan-500 hover:bg-cyan-600 py-3 rounded-xl font-semibold transition"
            >
              Close
            </button>

          </div>
        </div>
      )}

      {orderToComplete && (
        <CompleteOrderModal
          order={orderToComplete}
          onClose={() => {
            setOrderToComplete(null);
            fetchAssignments();
          }}
          accessToken={user.access_token}
        />
      )}

      {/* START PICKUP CONFIRMATION MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-white/10 rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center border border-yellow-500/30 mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Start Journey?</h2>
              <p className="text-gray-400 mb-8">
                Confirm that you are leaving for the pickup location for <strong>{selectedOrder.material}</strong> collection.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 font-semibold transition"
                  disabled={starting}
                >
                  Cancel
                </button>
                <button
                  onClick={() => startPickup(selectedOrder)}
                  className="flex-1 px-6 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold shadow-lg shadow-yellow-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={starting}
                >
                  {starting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-gray-900" />
                  ) : (
                    "Let's Go!"
                  )}
                </button>
              </div>
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

/* ================= COMPLETE ORDER MODAL ================= */

function CompleteOrderModal({ order, onClose, accessToken }) {
  const [material, setMaterial] = useState(order.material);
  const [weight, setWeight] = useState(order.weight);
  const [price, setPrice] = useState(order.estimated_price);
  const [loadingPrice, setLoadingPrice] = useState(false);

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [isManualEditing, setIsManualEditing] = useState(false);

  const materials = [
    "aluminum", "copper", "brass", "iron", "stainless_steel", "zinc",
    "nickel", "lead", "tin", "gold", "silver", "plastic", "rubber",
    "glass", "wood", "ewaste"
  ];

  const fetchUpdatedPrice = useCallback(async (mat, w) => {
    if (!w || w <= 0) return;
    setLoadingPrice(true);
    try {
      const res = await fetch(`${API_BASE}/price?material=${mat}&weight=${w}`);
      const data = await res.json();
      setPrice(data.estimated_price);
    } catch (err) {
      console.error("Price fetch error", err);
    } finally {
      setLoadingPrice(false);
    }
  }, []);

  useEffect(() => {
    if (!isManualEditing) return;

    const hasChanged = material !== order.material || parseFloat(weight) !== parseFloat(order.weight);
    if (!hasChanged) {
      setPrice(order.estimated_price);
      return;
    }

    const timer = setTimeout(() => {
      fetchUpdatedPrice(material, weight);
    }, 500); // Debounce
    return () => clearTimeout(timer);
  }, [material, weight, isManualEditing, order.material, order.weight, order.estimated_price, fetchUpdatedPrice]);

  const handleSendOtp = async () => {
    try {
      const res = await fetch(`${API_BASE}/orders/${order._id}/delivery/send-otp`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setError("");
        if (data.otp !== "Sent to email") {
          console.log("OTP for testing:", data.otp);
        }
      } else {
        setError(data.detail || "Failed to send OTP");
      }
    } catch (err) {
      setError("Network error sending OTP");
    }
  };

  const handleVerify = async () => {
    if (!otp) return setError("Enter OTP");
    setVerifying(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("otp", otp);
      formData.append("final_material", material);
      formData.append("final_weight", weight);

      const res = await fetch(`${API_BASE}/orders/${order._id}/delivery/verify-otp`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        onClose();
      } else {
        setError(data.detail || "Verification failed");
      }
    } catch (err) {
      setError("Network error verifying OTP");
    } finally {
      setVerifying(false);
    }
  };

  const isMaterialChanged = material !== order.material;
  const isWeightChanged = parseFloat(weight) !== parseFloat(order.weight);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[60] p-4">
      <div className="bg-[#111827] border border-white/10 rounded-[2.5rem] w-full max-w-2xl p-10 shadow-2xl overflow-y-auto max-h-[95vh]">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Order Verification
            </h2>
            <p className="text-gray-400 mt-1">Compare original order with actual items</p>
          </div>
          <button onClick={() => onClose()} className="text-gray-500 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* ORIGINAL VS ACTUAL COMPARISON */}
          <div className="grid grid-cols-2 gap-6">
            {/* ORIGINAL SIDE */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Original Request</p>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-400">Material</p>
                  <p className="text-lg font-medium text-white capitalize">{order.material.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Weight</p>
                  <p className="text-lg font-medium text-white">{order.weight} kg</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Est. Price</p>
                  <p className="text-lg font-bold text-emerald-400/70">₹ {order.estimated_price}</p>
                </div>
              </div>
            </div>

            {/* ACTUAL SIDE (EDITABLE) */}
            <div className={`bg-white/5 border rounded-2xl p-5 transition-colors ${(isMaterialChanged || isWeightChanged) ? 'border-yellow-500/30' : 'border-white/5'}`}>
              <div className="flex justify-between items-center mb-4">
                <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Verified Details</p>
                <div className="flex items-center gap-2">
                  {!isManualEditing ? (
                    <button
                      onClick={() => setIsManualEditing(true)}
                      className="text-[10px] font-bold bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded-md transition-all flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      EDIT
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsManualEditing(false);
                        setMaterial(order.material);
                        setWeight(order.weight);
                        setPrice(order.estimated_price);
                      }}
                      className="text-[10px] font-bold bg-red-500/20 hover:bg-red-500/30 text-red-400 px-2 py-1 rounded-md transition-all"
                    >
                      RESET
                    </button>
                  )}
                  {(isMaterialChanged || isWeightChanged) && (
                    <span className="flex h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                  )}
                </div>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Actual Material</label>
                  <select
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    disabled={!isManualEditing}
                    className={`w-full bg-white/5 border rounded-xl px-3 py-2 outline-none transition-all capitalize disabled:opacity-50 disabled:cursor-not-allowed ${isMaterialChanged ? 'border-yellow-500/50 text-yellow-400' : 'border-white/10 text-white'}`}
                  >
                    {materials.map(m => (
                      <option key={m} value={m} className="bg-gray-900 text-white capitalize">{m.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Actual Weight (kg)</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    disabled={!isManualEditing}
                    className={`w-full bg-white/5 border rounded-xl px-3 py-2 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isWeightChanged ? 'border-yellow-500/50 text-yellow-400' : 'border-white/10 text-white'}`}
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Final Price</p>
                  <p className="text-xl font-bold text-emerald-400 tracking-tight flex items-center gap-2">
                    ₹ {price}
                    {loadingPrice && <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-emerald-400" />}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {(isMaterialChanged || isWeightChanged) && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-yellow-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              <p className="text-xs text-yellow-200/80">Details differ from original request. Final price has been adjusted accordingly.</p>
            </div>
          )}

          {/* USER INFO PANEL */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-500/30 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400 font-semibold truncate">{order.user_email}</p>
                {order.payout_details && (
                  <p className="text-[11px] text-gray-500 truncate mt-0.5">
                    {order.payout_details.building}, {order.payout_details.area}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* OTP FLOW */}
          <div className="pt-4 border-t border-white/10">
            {!otpSent ? (
              <button
                onClick={handleSendOtp}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-cyan-900/20 transition-all transform active:scale-[0.98]"
              >
                Send Verification OTP to Customer
              </button>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400 ml-1 text-center block">Enter Customer's OTP</label>
                  <input
                    type="text"
                    maxLength="4"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center text-3xl font-mono tracking-[1rem] focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="****"
                  />
                </div>

                {error && <p className="text-red-400 text-sm text-center font-medium bg-red-400/10 py-2 rounded-lg">{error}</p>}

                <button
                  onClick={handleVerify}
                  disabled={verifying}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 py-4 rounded-2xl font-bold text-xl shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-3"
                >
                  {verifying ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white" />
                  ) : (
                    "Confirm Collection"
                  )}
                </button>

                <button
                  onClick={() => setOtpSent(false)}
                  className="w-full text-gray-500 hover:text-gray-300 text-sm font-medium transition-colors"
                >
                  Change details or re-send OTP
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* COMPONENTS */

function KPI({ label, value, blue, yellow, cyan, green }) {
  const color =
    blue
      ? "text-blue-400"
      : yellow
        ? "text-yellow-400"
        : cyan
          ? "text-cyan-400"
          : green
            ? "text-green-400"
            : "text-white";

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${color}`}>
        {value}
      </p>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="font-semibold text-white">{value}</p>
    </div>
  );
}
