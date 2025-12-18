// components/ContactPage.tsx
import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";

export const ContactPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl bg-white shadow-xl rounded-3xl p-10 text-center border border-gray-100">
        <h1 className="text-3xl font-serif font-bold text-brand-taupe mb-6">
          Contact Us
        </h1>

        <p className="text-sm text-gray-500 mb-6">
          Last updated on <strong>18-12-2025 12:51:42</strong>
        </p>

        <p className="text-gray-700 mb-6">
          You may contact us using the information below:
        </p>

        <div className="space-y-4 text-left text-gray-800 text-sm">
          <p>
            <strong>Merchant Legal entity name:</strong> VAIBHAV PRAKASH
          </p>

          <p>
            <strong>Registered Address:</strong><br />
            GROUND FLOOR, BUILDING NO.8/14, ROAD NO.1, SARVODAYA NAGAR,<br />
            EAST GOLA ROAD, HANUMAN JI TEMPLE, DANAPUR, PATNA,<br />
            DINAPUR-CUM-KHAGAUL, BIHAR, PIN: 801503
          </p>

          <p>
            <strong>Operational Address:</strong><br />
            GROUND FLOOR, BUILDING NO.8/14, ROAD NO.1, SARVODAYA NAGAR,<br />
            EAST GOLA ROAD, HANUMAN JI TEMPLE, DANAPUR, PATNA,<br />
            DINAPUR-CUM-KHAGAUL, BIHAR, PIN: 801503
          </p>

          <p className="flex items-center gap-2">
            <Phone size={16} className="text-brand-taupe" />{" "}
            <span>9110106473</span>
          </p>

          <p className="flex items-center gap-2">
            <Mail size={16} className="text-brand-taupe" />{" "}
            <a href="mailto:tanya@bhkinterior.com" className="text-brand-taupe hover:underline">
              tanya@bhkinterior.com
            </a>
          </p>
        </div>

        <button
          onClick={onBack}
          className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-white bg-brand-taupe px-6 py-2.5 rounded-full hover:bg-stone-800 transition-all"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};
