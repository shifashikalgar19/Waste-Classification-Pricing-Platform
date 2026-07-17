import { useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

export default function PayoutSetupModal({ token, orderId, onClose }) {
  const [form, setForm] = useState({
    full_name: "",
    country_code: "+91",
    phone_number: "",
    building: "",
    flat: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
    upi_id: "",
    paypal_email: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async () => {
    if (!orderId) {
      setError("Order ID missing");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      const res = await fetch(
        `${API_BASE}/orders/${orderId}/submit-payout-details`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to save details");
      }

      setSuccess("Payout details saved successfully ✔");

      setTimeout(() => {
        onClose();
      }, 1200);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-8 w-full max-w-3xl">

        <h2 className="text-2xl font-bold mb-6 text-white">
          Setup Payout Details
        </h2>

        <div className="grid md:grid-cols-2 gap-6">

          <Input label="Full Name" name="full_name" value={form.full_name} onChange={handleChange} />

          <div>
            <label className="block mb-2 text-sm text-gray-300">
              Phone Number
            </label>
            <div className="flex gap-3">
              <input
                name="country_code"
                value={form.country_code}
                onChange={handleChange}
                className="w-24 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white"
              />
              <input
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white"
              />
            </div>
          </div>

          <Input label="Building" name="building" value={form.building} onChange={handleChange} />
          <Input label="Flat" name="flat" value={form.flat} onChange={handleChange} />
          <Input label="Area" name="area" value={form.area} onChange={handleChange} />
          <Input label="City" name="city" value={form.city} onChange={handleChange} />
          <Input label="State" name="state" value={form.state} onChange={handleChange} />
          <Input label="Pincode" name="pincode" value={form.pincode} onChange={handleChange} />

          <div className="md:col-span-2 grid md:grid-cols-2 gap-6">
            <Input label="UPI ID" name="upi_id" value={form.upi_id} onChange={handleChange} />
            <Input label="PayPal Sandbox Email (Required for Dashboard)" name="paypal_email" value={form.paypal_email} onChange={handleChange} />
          </div>

        </div>

        {error && <p className="text-red-400 mt-4">{error}</p>}
        {success && <p className="text-green-400 mt-4">{success}</p>}

        <div className="flex gap-4 mt-8">
          <button
            onClick={submit}
            disabled={loading}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 rounded-xl font-semibold"
          >
            {loading ? "Saving..." : "Save Details"}
          </button>

          <button
            onClick={onClose}
            className="bg-gray-700 px-6 py-3 rounded-xl"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}

function Input({ label, name, value, onChange }) {
  return (
    <div>
      <label className="block mb-2 text-sm text-gray-300">
        {label}
      </label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white"
      />
    </div>
  );
}
