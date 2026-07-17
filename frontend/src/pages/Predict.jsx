import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { predictScrap, placeOrder } from "../services/api";
import { useAuth } from "../context/useAuth";
import PriceInvoice from "../components/PriceInvoice";

export default function Predict() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [material, setMaterial] = useState("");
  const [weight, setWeight] = useState("");
  const [price, setPrice] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --------------------------------
  // STEP 1: Analyze Image
  // --------------------------------
  const analyzeImage = async () => {
    if (!image) return;

    setLoading(true);
    setError("");
    setMaterial("");
    setPrice(null);
    setBreakdown(null);

    try {
      const data = await predictScrap(image, 0);
      setMaterial(data.material);
    } catch {
      setError("AI analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // STEP 2: Estimate Price
  // --------------------------------
  const estimatePrice = async () => {
    if (!image || !weight) return;

    if (parseFloat(weight) < 2) {
      setError("Please collect more scrap for order because for below 2kg the delivery person will not go to collect delivery");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await predictScrap(image, weight);
      setPrice(data.estimated_price);
      setBreakdown(data.price_breakdown);
    } catch {
      setError("Price estimation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // STEP 3: Place Order (FIXED)
  // --------------------------------
  const handlePlaceOrder = () => {
    if (!user || !user.access_token) {
      setError("Please login to place an order");
      return;
    }

    if (parseFloat(weight) < 2) {
      setError("Please collect more scrap for order because for below 2kg the delivery person will not go to collect delivery");
      return;
    }

    if (!material || !weight || !price) {
      setError("Incomplete order data");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await placeOrder(
            {
              material,
              weight,
              estimated_price: price,
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              image,
            },
            user.access_token
          );

          navigate("/dashboard/orders");
        } catch {
          setError("Failed to place order. Please try again.");
        }
      },
      () => {
        setError("Location permission is required to place order");
      }
    );
  };

  return (
    <div className="relative min-h-screen bg-[#0b0f1a] text-white overflow-hidden">
      {/* BACKGROUND GLOWS */}
      <div className="absolute -top-40 -left-40 w-[420px] h-[420px] bg-blue-600/25 blur-[140px] rounded-full" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[420px] h-[420px] bg-cyan-500/25 blur-[140px] rounded-full" />

      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-24">
        {/* HEADER */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
            AI Scrap Price
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
              Estimation Engine
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Upload a scrap image, let our AI analyze the material, and receive a
            transparent, data-driven price estimate.
          </p>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10">
          {/* IMAGE UPLOAD */}
          <div className="mb-10">
            <label className="block mb-3 text-sm font-medium text-gray-300">
              Scrap Image Input
            </label>

            <div className="border border-dashed border-white/20 rounded-xl p-6 text-center hover:border-cyan-400 transition">
              <input
                type="file"
                accept="image/*"
                id="upload"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setImage(file);
                  setPreview(URL.createObjectURL(file));
                }}
              />

              <label htmlFor="upload" className="cursor-pointer">
                {!preview ? (
                  <div className="text-gray-400">
                    <span className="material-icons-outlined text-5xl mb-4 block text-cyan-400">
                      cloud_upload
                    </span>
                    Click to upload scrap image
                  </div>
                ) : (
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded-lg shadow-lg"
                  />
                )}
              </label>
            </div>
          </div>

          {/* ANALYZE */}
          <button
            onClick={analyzeImage}
            disabled={!image || loading}
            className={`w-full py-3 rounded-xl font-semibold transition ${!image || loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90"
              }`}
          >
            {loading ? "Analyzing Image..." : "Run AI Analysis"}
          </button>

          {/* MATERIAL + WEIGHT */}
          {material && (
            <div className="mt-10 grid md:grid-cols-2 gap-8">
              <div>
                <label className="block mb-2 text-sm text-gray-300">
                  Detected Material
                </label>
                <input
                  value={material}
                  disabled
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-cyan-400 font-semibold"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-300">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-400 outline-none"
                />
              </div>
            </div>
          )}

          {/* ESTIMATE */}
          {material && (
            <button
              onClick={estimatePrice}
              disabled={!weight || loading}
              className={`w-full mt-8 py-3 rounded-xl font-semibold transition ${!weight || loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90"
                }`}
            >
              {loading ? "Calculating Price..." : "Estimate Final Price"}
            </button>
          )}

          {/* ERROR */}
          {error && (
            <p className="mt-6 text-center text-red-400 text-sm">{error}</p>
          )}
        </div>

        {/* INVOICE + CTA */}
        <div className="mt-16">
          <PriceInvoice
            price={price}
            breakdown={breakdown}
            show={showBreakdown}
            onToggle={() => setShowBreakdown(!showBreakdown)}
          />

          {price && (
            <div className="mt-10 flex justify-center">
              {!user ? (
                <button
                  onClick={() => navigate("/login")}
                  className="px-10 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:opacity-90 transition shadow-lg"
                >
                  Login to Place Order
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  className="px-10 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:opacity-90 transition shadow-lg"
                >
                  Place Order
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
