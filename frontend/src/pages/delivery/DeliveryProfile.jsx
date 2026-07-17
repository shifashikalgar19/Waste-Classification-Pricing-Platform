import { useState, useEffect } from "react";
import { useAuth } from "../../context/useAuth";
import MessageModal from "../../components/modals/MessageModal";

const API_BASE = "http://127.0.0.1:8000";

export default function DeliveryProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    country_code: "+91",
    phone_number: "",
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [messageConfig, setMessageConfig] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.access_token) return;
      try {
        const res = await fetch(`${API_BASE}/users/me`, {
          headers: { Authorization: `Bearer ${user.access_token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const profileData = {
            full_name: data.full_name || "",
            email: data.email || "",
            country_code: data.country_code || "+91",
            phone_number: data.phone_number || "",
            current_password: "",
            new_password: "",
            confirm_password: "",
          };
          setForm(profileData);
          setInitialData(profileData);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (form.new_password && form.new_password !== form.confirm_password) {
      setMessageConfig({
        type: "error",
        title: "Validation Error",
        message: "New passwords do not match.",
      });
      return;
    }

    setLoading(true);
    try {
      // 1. Update Profile (Email/Password)
      const profileRes = await fetch(`${API_BASE}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.access_token}`,
        },
        body: JSON.stringify({
          email: form.email,
          current_password: form.current_password,
          new_password: form.new_password || null,
        }),
      });

      if (!profileRes.ok) {
        const data = await profileRes.json();
        throw new Error(data.detail || "Failed to update profile details");
      }

      // 2. Update Delivery Info (Name/Phone)
      const formData = new FormData();
      formData.append("full_name", form.full_name);
      formData.append("country_code", form.country_code);
      formData.append("phone_number", form.phone_number);

      const deliveryRes = await fetch(`${API_BASE}/orders/delivery/profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${user.access_token}` },
        body: formData,
      });

      if (!deliveryRes.ok) {
        const data = await deliveryRes.json();
        throw new Error(data.detail || "Failed to update delivery info");
      }

      setMessageConfig({
        type: "success",
        title: "Profile Updated",
        message: "Your profile has been successfully updated.",
      });

      const updatedData = { ...form, current_password: "", new_password: "", confirm_password: "" };
      setInitialData(updatedData);
      setForm(updatedData);
      setIsEditing(false);

    } catch (err) {
      setMessageConfig({
        type: "error",
        title: "Update Failed",
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (initialData) {
      setForm(initialData);
    }
    setIsEditing(false);
  };

  return (
    <div className="relative min-h-screen bg-[#0b0f1a] text-white p-6 md:p-12">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/10 blur-[120px] rounded-full -z-10" />

      <div className="max-w-4xl mx-auto">
        <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              Profile Settings
            </h1>
            <p className="text-gray-400">
              Manage your personal information and account security.
            </p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-8 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-bold flex items-center gap-2 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </button>
          )}
        </div>

        <form onSubmit={handleUpdate} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* PERSONAL INFO */}
            <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-blue-400">
                <span className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                Personal Details
              </h3>

              <div className="space-y-6">
                <DisplayField
                  label="Full Name"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  editing={isEditing}
                  required
                />

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-500 ml-1">Phone Number</label>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        name="country_code"
                        value={form.country_code}
                        onChange={handleChange}
                        className="w-20 bg-black/40 border border-white/10 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                        required
                      />
                      <input
                        name="phone_number"
                        value={form.phone_number}
                        onChange={handleChange}
                        placeholder="9876543210"
                        className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        required
                      />
                    </div>
                  ) : (
                    <p className="px-5 py-4 bg-white/5 border border-transparent rounded-2xl text-white font-medium">
                      {form.country_code} {form.phone_number}
                    </p>
                  )}
                </div>

                <DisplayField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  editing={isEditing}
                  required
                />
              </div>
            </div>

            {/* SECURITY */}
            <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-emerald-400">
                <span className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                Account Security
              </h3>

              <div className="space-y-6">
                {!isEditing ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Password Status</p>
                        <p className="text-white font-medium">Active & Secure</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 px-2 italic">
                      Click edit to update your login credentials or change your current password.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <DisplayField
                      label="Current Password"
                      name="current_password"
                      type="password"
                      value={form.current_password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      editing={isEditing}
                      required
                    />

                    <div className="pt-6 border-t border-white/5 space-y-6">
                      <DisplayField
                        label="New Password (optional)"
                        name="new_password"
                        type="password"
                        value={form.new_password}
                        onChange={handleChange}
                        placeholder="New password"
                        editing={isEditing}
                      />
                      <DisplayField
                        label="Confirm New Password"
                        name="confirm_password"
                        type="password"
                        value={form.confirm_password}
                        onChange={handleChange}
                        placeholder="Confirm new password"
                        editing={isEditing}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end items-center gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-8 py-4 rounded-2xl font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 px-10 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-900/20 transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" />
                    Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          )}
        </form>
      </div>

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

function DisplayField({ label, editing, ...props }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-500 ml-1">{label}</label>
      {editing ? (
        <input
          {...props}
          className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-700"
        />
      ) : (
        <p className="px-5 py-4 bg-white/5 border border-transparent rounded-2xl text-white font-medium">
          {props.type === "password" ? "••••••••" : (props.value || "Not Set")}
        </p>
      )}
    </div>
  );
}
