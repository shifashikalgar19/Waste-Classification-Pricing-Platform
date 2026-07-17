import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#0b0f1a] text-white overflow-hidden">

      <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-cyan-500/30 rounded-full blur-[120px]" />

      {/* HERO */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-16 items-center">

          {/* LEFT */}
          <div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                ScrapX
              </span>
              <br />
              Smart AI Scrap Marketplace
            </h1>

            <p className="text-gray-400 text-lg mb-10 max-w-xl">
              An intelligent platform that uses computer vision, machine learning,
              smart logistics, and digital payments to modernize scrap recycling.
            </p>

            <div className="flex gap-6">
              <Link
                to="/predict"
                className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 font-semibold shadow-lg overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="material-icons-outlined">
                    analytics
                  </span>
                  Estimate Price
                </span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition" />
              </Link>

              <Link
                to="/login"
                className="px-8 py-4 rounded-xl border border-white/20 hover:border-cyan-400 transition flex items-center gap-2"
              >
                <span className="material-icons-outlined">
                  login
                </span>
                Place Order
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl">
              <h3 className="text-xl font-semibold mb-6">
                AI Prediction Pipeline
              </h3>

              {[
                { icon: "image", text: "Scrap Image Input" },
                { icon: "memory", text: "CNN Classification" },
                { icon: "trending_up", text: "Price Estimation Engine" },
                { icon: "local_shipping", text: "Smart Pickup Allocation" },
                { icon: "payments", text: "Digital Payout" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 py-3 border-b border-white/10 last:border-none"
                >
                  <span className="material-icons-outlined text-cyan-400">
                    {item.icon}
                  </span>
                  <span className="text-gray-300">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative z-10 py-32 px-6">
        <h2 className="text-4xl font-bold text-center mb-20">
          How ScrapX Works
        </h2>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          {[
            {
              icon: "photo_camera",
              title: "Upload Scrap",
              desc: "Users upload scrap images and provide weight details.",
            },
            {
              icon: "psychology",
              title: "AI Analysis",
              desc: "CNN model identifies material and estimates fair price.",
            },
            {
              icon: "paid",
              title: "Pickup & Pay",
              desc: "Smart logistics assigns pickup and payment is processed.",
            },
          ].map((step, i) => (
            <div
              key={i}
              className="group relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-10 hover:border-cyan-400 transition-all hover:-translate-y-3"
            >
              <span className="material-icons-outlined text-5xl text-cyan-400 mb-6 block">
                {step.icon}
              </span>
              <h3 className="text-xl font-semibold mb-4">
                {step.title}
              </h3>
              <p className="text-gray-400">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-32 text-center">
        <h2 className="text-4xl font-bold mb-6">
          Experience the Future of Scrap Recycling
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto mb-10">
          Transparent pricing, AI intelligence, and seamless logistics —
          all in one powerful platform.
        </p>

        <Link
          to="/signup"
          className="inline-flex items-center gap-3 px-10 py-5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-lg font-semibold shadow-xl hover:scale-105 transition"
        >
          <span className="material-icons-outlined">
            rocket_launch
          </span>
          Get Started
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 py-10 text-center text-gray-500 text-sm border-t border-white/10">
        © {new Date().getFullYear()} ScrapX • AI-Powered Scrap Marketplace
      </footer>
    </div>
  );
}
