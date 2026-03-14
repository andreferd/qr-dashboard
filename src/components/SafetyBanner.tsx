"use client";

import { useState } from "react";
import { ShieldAlert, X } from "lucide-react";

export default function SafetyBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 flex items-start gap-3">
      <ShieldAlert className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1 text-sm text-yellow-200/80">
        <span className="font-semibold text-yellow-300">Use links at your own risk.</span>{" "}
        Auction winners are not vetted or endorsed. Never sign suspicious transactions or
        share your private keys. Always DYOR before interacting with any project.
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-yellow-400/50 hover:text-yellow-400 transition-colors flex-shrink-0"
        aria-label="Dismiss safety notice"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
