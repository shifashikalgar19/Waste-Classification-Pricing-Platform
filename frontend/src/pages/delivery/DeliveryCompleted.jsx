import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../context/useAuth";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function DeliveryCompleted() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCompleted = useCallback(async () => {
    if (!user?.access_token) return;

    try {
      const res = await fetch(`${API_BASE}/orders/delivery/my-assignments`, {
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
      });

      const data = await res.json();
      const completed = data.filter(o => o.status === "completed" || o.delivery_status === "completed");
      setOrders(completed);
    } catch (err) {
      console.error("Failed to fetch completed assignments", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCompleted();
  }, [fetchCompleted]);

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white overflow-hidden">
     
      <div className="absolute -top-40 -left-40 w-[420px] h-[420px] bg-green-600/10 blur-[140px] rounded-full" />

      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24">
        <div className="mb-14">
          <h1 className="text-5xl font-extrabold mb-3">Successfully Completed</h1>
          <p className="text-gray-400 text-lg">Your history of verified and processed scrap collections.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition backdrop-blur-xl group">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold capitalize text-cyan-400 group-hover:text-cyan-300 transition-colors">{order.material}</h3>
                  <p className="text-sm text-gray-500 mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <span className="bg-green-500/15 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20">
                  COMPLETE
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-medium">Weight</span>
                  <span className="text-white font-bold">{order.weight} kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-medium">Earnings</span>
                  <span className="text-emerald-400 font-bold font-mono">₹ {order.estimated_price}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-2">Customer</p>
                <p className="text-sm text-gray-300 truncate">{order.user_email}</p>
              </div>
            </div>
          ))}

          {loading && <p className="text-gray-500">Loading your success history...</p>}
          {!loading && orders.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
              <p className="text-gray-500 text-lg">No completed orders yet. Start your journey today!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
