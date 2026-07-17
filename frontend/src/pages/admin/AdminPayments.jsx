import { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "../../context/useAuth";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function AdminPayments() {
    const { user } = useAuth();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPayments = useCallback(async () => {
        if (!user?.access_token) return;

        try {
            const res = await fetch(`${API_BASE}/orders/all`, {
                headers: {
                    Authorization: `Bearer ${user.access_token}`,
                },
            });

            if (!res.ok) throw new Error();
            const data = await res.json();

            // Filter only paid orders
            const paidOrders = data.filter(o => o.payment_status === "paid");
            setPayments(paidOrders);
        } catch {
            console.error("Failed to fetch payments");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const totalPayout = useMemo(() => {
        return payments.reduce((sum, p) => sum + (p.estimated_price || 0), 0);
    }, [payments]);

    return (
        <div className="min-h-screen bg-[#0b0f1a] text-white px-6 py-16">
            <div className="max-w-7xl mx-auto mb-12 flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-extrabold mb-3">Payment History</h1>
                    <p className="text-gray-400">View and track all PayPal Payouts (USD Converted).</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-end">
                    <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Total Disbursed</p>
                    <p className="text-3xl font-bold text-emerald-400">₹ {totalPayout.toLocaleString()}</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-gray-300 text-xs uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-5">Date</th>
                            <th className="px-6 py-5">Recipient</th>
                            <th className="px-6 py-5">Material</th>
                            <th className="px-6 py-5">Amount (₹)</th>
                            <th className="px-6 py-5">Converted ($)</th>
                            <th className="px-6 py-5">PayPal Batch ID</th>
                            <th className="px-6 py-5">Status</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-white/5">
                        {payments.map((p) => (
                            <tr key={p._id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-5 text-gray-300 text-sm">
                                    {new Date(p.completed_at || p.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-5">
                                    <p className="font-medium text-white group-hover:text-cyan-400 transition-colors uppercase">{p.user_email}</p>
                                    <p className="text-xs text-gray-500">{p.payout_details?.receiver}</p>
                                </td>
                                <td className="px-6 py-5 capitalize text-gray-300">{p.material}</td>
                                <td className="px-6 py-5 font-bold text-emerald-400 font-mono">
                                    {p.estimated_price}
                                </td>
                                <td className="px-6 py-5 text-cyan-400 font-mono">
                                    ${p.payout_details?.amount_usd || (p.estimated_price / 80).toFixed(2)}
                                </td>
                                <td className="px-6 py-5 text-xs text-gray-400 font-mono">
                                    {p.payout_details?.batch_id || "N/A"}
                                </td>
                                <td className="px-6 py-5">
                                    <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
                                        DISBURSED
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {loading && (
                    <div className="py-20 flex flex-col items-center justify-center text-gray-500">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-cyan-500 mb-4" />
                        <p>Loading transaction records...</p>
                    </div>
                )}

                {!loading && payments.length === 0 && (
                    <div className="py-20 text-center text-gray-500">
                        <p className="text-xl mb-2">No successfully executed payouts found.</p>
                        <p className="text-sm">Completed orders with successful PayPal transfers will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
