import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signupUser } from "../services/api";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await signupUser({
        email: form.email,
        password: form.password,
        role: "user",
      });

      navigate("/login");
    } catch (err) {
      setError(
        err?.message ||
          err?.detail ||
          "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0b0f1a] text-white flex items-center justify-center overflow-hidden">

      {/* BACKGROUND GLOWS */}
      <div className="absolute -top-40 -left-40 w-[420px] h-[420px] bg-blue-600/25 blur-[140px] rounded-full" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[420px] h-[420px] bg-cyan-500/25 blur-[140px] rounded-full" />

      {/* CARD */}
      <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl">

        {/* HEADER */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold mb-2">
            Create Your Account
          </h2>
          <p className="text-gray-400 text-sm">
            Sign up as a ScrapX user and start selling scrap smartly
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <p className="mb-4 text-sm text-red-400 text-center">
            {error}
          </p>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* EMAIL */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-400 outline-none"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 pr-12 text-white focus:border-cyan-400 outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <span className="material-icons-outlined text-xl">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                required
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 pr-12 text-white focus:border-cyan-400 outline-none"
              />

              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <span className="material-icons-outlined text-xl">
                  {showConfirm ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold transition ${
              loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90"
            }`}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {/* FOOTER */}
        <div className="mt-8 text-center space-y-3 text-sm">
          <p className="text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-cyan-400 hover:underline"
            >
              Login
            </Link>
          </p>

          <Link
            to="/"
            className="inline-flex items-center gap-1 text-gray-400 hover:text-white transition"
          >
            <span className="material-icons-outlined text-sm">
              arrow_back
            </span>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
