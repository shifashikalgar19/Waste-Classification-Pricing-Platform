import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/useAuth";
import { MapPin, Mail, Shield, AlertTriangle, AlertCircle, CheckCircle2, XCircle, Trash2, Ban } from "lucide-react";

export default function UserViewModal({ user, onClose, onActionComplete }) {
  const { user: admin } = useAuth();
  const [confirmAction, setConfirmAction] = useState(null); // 'disable' | 'delete' | null
  const [errorMsg, setErrorMsg] = useState("");
  const [activeOrders, setActiveOrders] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const fetchActiveOrders = useCallback(async () => {
    try {
      setLoadingOrders(true);
      const res = await fetch(`http://127.0.0.1:8000/users/${user._id}/active-orders`, {
        headers: { Authorization: `Bearer ${admin.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setActiveOrders(data.count);
      }
    } catch {
      console.error("Failed to fetch active orders");
    } finally {
      setLoadingOrders(false);
    }
  }, [user, admin]);

  useEffect(() => {
    if (user && !user.deleted) {
      fetchActiveOrders();
    }
  }, [user, fetchActiveOrders]);

  if (!user) return null;

  const roleStyles = {
    admin: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    delivery: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    user: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  };

  const handleDisableClick = () => {
    if (activeOrders > 0) {
      setErrorMsg(`Cannot disable this ${user.role} because they have ${activeOrders} active order(s).`);
      return;
    }
    setErrorMsg("");
    setConfirmAction("disable");
  };

  const handleDeleteClick = () => {
    setErrorMsg("");
    setConfirmAction("delete");
  };

  const handleDisable = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/users/${user._id}/disable`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${admin.access_token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.detail || "Failed to disable user.");
        setConfirmAction(null);
        return;
      }
      onClose();
      onActionComplete();
    } catch {
      setErrorMsg("An error occurred. Please try again.");
      setConfirmAction(null);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/users/${user._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${admin.access_token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.detail || "Failed to delete user.");
        setConfirmAction(null);
        return;
      }
      onClose();
      onActionComplete();
    } catch {
      setErrorMsg("An error occurred. Please try again.");
      setConfirmAction(null);
    }
  };

  const isDeleted = user.deleted;
  const isDisabled = user.disabled;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center px-4">
        <div className="w-full max-w-lg bg-[#0b0f1a] border border-white/10 rounded-2xl shadow-2xl p-6 relative flex flex-col max-h-[90vh]">

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1"
          >
            <XCircle className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <Shield className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white">User Overview</h2>
              <p className="text-sm text-gray-400">Detailed account information</p>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{errorMsg}</p>
            </div>
          )}

          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">

            {/* Status Banner for Deleted */}
            {isDeleted && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-red-500 font-semibold text-sm">Account Deleted</p>
                  <p className="text-red-400/80 text-xs mt-0.5">This profile was historically deleted and remains for record-keeping only.</p>
                </div>
              </div>
            )}

            {/* Email Info */}
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-start gap-4 hover:bg-white/10 transition-colors">
              <div className="p-2 bg-black/40 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Email Address</p>
                <p className="text-white font-medium">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Role Info */}
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col gap-2 hover:bg-white/10 transition-colors">
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Assigned Role</p>
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border w-fit ${roleStyles[user.role]}`}>
                  {user.role.toUpperCase()}
                </span>
              </div>

              {/* Status Info */}
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col gap-2 hover:bg-white/10 transition-colors">
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Current Status</p>
                <div className="flex items-center gap-2">
                  {isDeleted ? (
                    <><Trash2 className="w-4 h-4 text-red-500" /><span className="text-red-500 font-bold text-sm">DELETED</span></>
                  ) : isDisabled ? (
                    <><Ban className="w-4 h-4 text-orange-400" /><span className="text-orange-400 font-bold text-sm">DISABLED</span></>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span className="text-emerald-400 font-bold text-sm">ACTIVE</span></>
                  )}
                </div>
              </div>
            </div>

            {/* Active Orders Info */}
            {!isDeleted && (
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors">
                <div>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Active Orders</p>
                  {loadingOrders ? (
                    <div className="h-5 w-16 bg-white/10 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-white font-medium flex items-center gap-2">
                      <span className={`text-lg font-bold ${activeOrders > 0 ? "text-cyan-400" : "text-gray-400"}`}>
                        {activeOrders !== null ? activeOrders : 0}
                      </span>
                      <span className="text-sm text-gray-500 font-normal">in progress</span>
                    </p>
                  )}
                </div>
                {activeOrders > 0 && !isDisabled && (
                  <AlertTriangle className="w-5 h-5 text-yellow-500/70" />
                )}
              </div>
            )}

            {/* Location Info */}
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-start gap-4 hover:bg-white/10 transition-colors">
              <div className="p-2 bg-black/40 rounded-lg">
                <MapPin className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Last Known Location</p>
                {user.location?.address ? (
                  <p className="text-white leading-relaxed text-sm">{user.location.address}</p>
                ) : (
                  <p className="text-gray-500 italic text-sm">Location data not available</p>
                )}
              </div>
            </div>

          </div>

          {/* ACTION BUTTONS */}
          {!isDeleted && (
            <div className="mt-8 pt-6 border-t border-white/10 flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-gray-400 font-medium hover:text-white transition-colors"
              >
                Close
              </button>

              {!isDisabled ? (
                <button
                  onClick={handleDisableClick}
                  disabled={loadingOrders}
                  className="px-5 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 hover:border-orange-500/30 font-semibold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Ban className="w-4 h-4" />
                  Disable User
                </button>
              ) : (
                <button
                  onClick={handleDeleteClick}
                  className="px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 hover:border-red-500/30 font-semibold transition-all flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Permanently Delete
                </button>
              )}
            </div>
          )}

          {isDeleted && (
            <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors w-full sm:w-auto"
              >
                Close Overview
              </button>
            </div>
          )}

        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {confirmAction && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center px-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#121826] border border-white/10 rounded-2xl shadow-2xl p-6 relative">

            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-xl flex-shrink-0 ${confirmAction === 'disable' ? 'bg-orange-500/10 text-orange-400' : 'bg-red-500/10 text-red-500'}`}>
                {confirmAction === 'disable' ? <Ban className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {confirmAction === "disable" ? "Suspend Account" : "Delete Account"}
                </h3>
              </div>
            </div>

            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              {confirmAction === "disable"
                ? `You are about to suspend ${user.email}. They will no longer be able to log in or accept new orders. No active orders are currently assigned based on our checks.`
                : `You are about to permanently delete the profile for ${user.email}. This action cannot be reversed. If historical orders exist, this will act as a soft delete to preserve order integrity.`}
            </p>

            <div className="flex justify-end gap-3 flex-col sm:flex-row">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-5 py-2.5 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors sm:w-auto w-full"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction === "disable" ? handleDisable : handleDelete}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all sm:w-auto w-full flex items-center justify-center gap-2 ${confirmAction === "disable"
                  ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20"
                  : "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20"
                  }`}
              >
                {confirmAction === "disable" ? <Ban className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                {confirmAction === "disable" ? "Confirm Suspension" : "Confirm Deletion"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
