export default function About() {
  return (
    <div className="relative min-h-screen bg-[#0b0f1a] text-white overflow-hidden">

      <div className="absolute -top-40 -left-40 w-[420px] h-[420px] bg-blue-600/25 blur-[140px] rounded-full" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[420px] h-[420px] bg-cyan-500/25 blur-[140px] rounded-full" />

      <section className="relative z-10 max-w-7xl mx-auto px-6 min-h-[90vh] flex items-center">
        <div>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            Building Intelligence
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
              for Scrap Recycling
            </span>
          </h1>

          <p className="text-gray-400 text-lg leading-relaxed">
            ScrapX is an AI-powered platform that brings transparency,
            automation, and intelligence into the traditionally unorganized
            scrap recycling ecosystem.
          </p>
        </div>

        {/* HERO CARD */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <div className="space-y-5">
            {[
              "AI-based scrap material identification",
              "Fair and transparent pricing",
              "Location-aware pickup assignment",
              "Role-based dashboards",
              "Secure payment simulation",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="material-icons-outlined text-cyan-400">
                  check_circle
                </span>
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-6 py-28 grid md:grid-cols-2 gap-12">
       <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-icons-outlined text-cyan-400">
              report_problem
            </span>
            <h3 className="text-2xl font-bold">The Problem</h3>
          </div>
          <p className="text-gray-400 leading-relaxed">
            Scrap trading today relies on manual inspection, inconsistent
            pricing, and informal logistics. Sellers often receive unfair value,
            while buyers face supply and coordination inefficiencies.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-icons-outlined text-cyan-400">
              lightbulb
            </span>
            <h3 className="text-2xl font-bold">The Solution</h3>
          </div>
          <p className="text-gray-400 leading-relaxed">
            ScrapX applies computer vision and machine learning to analyze scrap
            images, estimate material value, and automate the entire transaction
            lifecycle from upload to payout.
          </p>
        </div>
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold mb-14 text-center">
          Technology & Architecture
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: "visibility", title: "Computer Vision", desc: "CNN-based scrap classification from images." },
            { icon: "memory", title: "Machine Learning", desc: "Hybrid ML models for accurate price estimation." },
            { icon: "cloud", title: "Backend", desc: "FastAPI, MongoDB, JWT-secured APIs." },
            { icon: "web", title: "Frontend", desc: "React, Tailwind CSS, role-based UI." },
            { icon: "location_on", title: "Smart Logistics", desc: "Distance-based delivery assignment." },
            { icon: "payments", title: "Payments", desc: "Sandbox digital payment simulation." },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-cyan-400 transition"
            >
              <span className="material-icons-outlined text-4xl text-cyan-400 mb-4 block">
                {item.icon}
              </span>
              <h4 className="text-lg font-semibold mb-2">
                {item.title}
              </h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Academic & Industry Relevance
        </h2>
        <p className="text-gray-400 leading-relaxed">
          ScrapX is developed as a final-year project that bridges academic
          concepts with real-world system design. It demonstrates applied AI,
          full-stack engineering, and scalable product thinking.
        </p>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 py-8 text-center text-gray-500 text-sm border-t border-white/10">
        © {new Date().getFullYear()} ScrapX • Intelligent Scrap Management Platform
      </footer>
    </div>
  );
}
