import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/useAuth";

const API_BASE = "http://127.0.0.1:8000";

export default function UserProfile() {
  const { user } = useAuth();

  /* ================= ACCOUNT STATE ================= */

  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* ================= PAYOUT STATE ================= */

  const [payout, setPayout] = useState({
    building: "",
    flat: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
    upi_id: "",
  });

  const [editingPayout, setEditingPayout] = useState(false);
  const [payoutMessage, setPayoutMessage] = useState("");
  const [payoutError, setPayoutError] = useState("");
  const [payoutLoading, setPayoutLoading] = useState(false);

  /* ================= FETCH USER PROFILE ================= */

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/users/me`, {
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
      });

      if (!res.ok) return;

      const data = await res.json();

      if (data?.payout_details) {
        setPayout(data.payout_details);
      }
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  useEffect(() => {
    if (user?.access_token) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  /* =========================================================
     UPDATE PROFILE
  ========================================================= */

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!currentPassword) {
      setError("Current password is required");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.access_token}`,
        },
        body: JSON.stringify({
          email,
          current_password: currentPassword,
          new_password: newPassword || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Update failed");
      }

      setMessage("Profile updated successfully ✔");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     PAYOUT EDIT HANDLERS
  ========================================================= */

  const handlePayoutChange = (e) => {
    setPayout({ ...payout, [e.target.name]: e.target.value });
  };

  const handlePayoutSave = async () => {
    setPayoutLoading(true);
    setPayoutError("");
    setPayoutMessage("");

    try {
      const res = await fetch(`${API_BASE}/users/payout-details`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.access_token}`,
        },
        body: JSON.stringify(payout),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to update payout details");
      }

      setPayoutMessage("Payout details updated successfully ✔");
      setEditingPayout(false);
    } catch (err) {
      setPayoutError(err.message);
    } finally {
      setPayoutLoading(false);
    }
  };

  /* ========================================================= */

  return (
    <div className="relative min-h-screen bg-[#0b0f1a] text-white overflow-hidden">
      <div className="absolute -top-40 -left-40 w-[420px] h-[420px] bg-blue-600/25 blur-[140px] rounded-full" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[420px] h-[420px] bg-cyan-500/25 blur-[140px] rounded-full" />

      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-24">

        <div className="mb-14">
          <h1 className="text-5xl font-extrabold mb-3">Profile Settings</h1>
          <p className="text-gray-400 text-lg">
            Manage your account security and payout information
          </p>
        </div>

        <div className="space-y-14">

          {/* ================= ACCOUNT SECURITY ================= */}

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10">
            <h2 className="text-2xl font-bold mb-8 text-cyan-400">
              Account Security
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-8">
              <div>
                <label className="block mb-2 text-sm text-gray-300">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-300">
                  Current Password *
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-lg px-4 py-3"
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-lg px-4 py-3"
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}
              {message && <p className="text-green-400 text-sm">{message}</p>}

              <button
                type="submit"
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500"
              >
                {loading ? "Updating..." : "Save Changes"}
              </button>
            </form>
          </div>

          {/* ================= PAYOUT INFO ================= */}

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-cyan-400">
                Payout Information
              </h2>

              {!editingPayout && (
                <button
                  onClick={() => setEditingPayout(true)}
                  className="px-4 py-2 bg-green-500 rounded-lg text-sm"
                >
                  Edit
                </button>
              )}
            </div>

            {!editingPayout ? (
              <div className="grid md:grid-cols-2 gap-6 text-gray-300">
                {Object.entries(payout).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-xs text-gray-400 capitalize">
                      {key.replace("_", " ")}
                    </p>
                    <p className="mt-1 font-medium">{value || "—"}</p>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  {Object.keys(payout).map((field) => (
                    <input
                      key={field}
                      name={field}
                      value={payout[field]}
                      onChange={handlePayoutChange}
                      placeholder={field.replace("_", " ")}
                      className="bg-black/40 border border-white/10 rounded-lg px-4 py-3"
                    />
                  ))}
                </div>

                {payoutError && (
                  <p className="text-red-400 mt-4 text-sm">{payoutError}</p>
                )}
                {payoutMessage && (
                  <p className="text-green-400 mt-4 text-sm">
                    {payoutMessage}
                  </p>
                )}

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={handlePayoutSave}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl"
                  >
                    {payoutLoading ? "Saving..." : "Save"}
                  </button>

                  <button
                    onClick={() => setEditingPayout(false)}
                    className="px-6 py-3 bg-gray-700 rounded-xl"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </section>
    </div>
  );
}
