import React from "react";
export default function MessageModal({ type = "info", title, message, onClose, buttonText = "Okay" }) {
    const getIcon = () => {
        switch (type) {
            case "success":
                return (
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30 mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                );
            case "error":
                return (
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30 mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30 mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                    </div>
                );
        }
    };

    const getButtonClass = () => {
        switch (type) {
            case "success":
                return "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20";
            case "error":
                return "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20";
            default:
                return "bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20";
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <div className="bg-[#111827] border border-white/10 rounded-[2rem] w-full max-w-md p-10 shadow-2xl text-center transform animate-in zoom-in-95 duration-300">

                {getIcon()}

                <h2 className="text-2xl font-bold mb-3 text-white">
                    {title || (type === "error" ? "Something went wrong" : type === "success" ? "Success!" : "Notification")}
                </h2>

                <p className="text-gray-400 mb-8 text-lg leading-relaxed">
                    {message}
                </p>

                <button
                    onClick={onClose}
                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all active:scale-[0.98] shadow-lg ${getButtonClass()}`}
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
}
