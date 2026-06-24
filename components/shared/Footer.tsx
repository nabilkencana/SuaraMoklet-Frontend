import React from "react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <div>
          <span className="font-semibold text-slate-700">SuaraMoklet</span>
          <span className="mx-2">•</span>
          <span>© {new Date().getFullYear()} SuaraMoklet. Governance & Firmness.</span>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <a href="#" className="hover:text-red-600 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-red-600 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-red-600 transition-colors">Contact School</a>
          <a href="#" className="hover:text-red-600 transition-colors">Support</a>
        </div>
      </div>
    </footer>
  );
}
