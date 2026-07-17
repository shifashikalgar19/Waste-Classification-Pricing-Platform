import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { loginUser } from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("signup") === "success") {
      setSuccess("Account created successfully. Please login.");
    }
  }, [location.search]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await loginUser(email, password);
      login(data);

      if (data.role === "admin") navigate("/admin");
      else if (data.role === "delivery") navigate("/delivery");
      else navigate("/dashboard");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0b0f1a] text-white flex items-center justify-center overflow-hidden">

      {/* BACKGROUND GLOWS */}
      <div className="absolute -top-40 -left-40 w-[420px] h-[420px] bg-blue-600/25 blur-[140px] rounded-full" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[420px] h-[420px] bg-cyan-500/25 blur-[140px] rounded-full" />

      {/* LOGIN CARD */}
      <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl">

        {/* HEADER */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-400 text-sm">
            Login to access your ScrapX dashboard
          </p>
        </div>

        {/* SUCCESS MESSAGE */}
        {success && (
          <p className="mb-4 text-sm text-green-400 text-center">
            {success}
          </p>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <p className="mb-4 text-sm text-red-400 text-center">
            {error}
          </p>
        )}

        {/* FORM */}
        <form onSubmit={submit} className="space-y-5">

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-400 outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-400 outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold transition ${
              loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* FOOTER LINKS */}
        <div className="mt-8 text-center space-y-3 text-sm">

          <p className="text-gray-400">
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="text-cyan-400 hover:underline"
            >
              Create one
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
