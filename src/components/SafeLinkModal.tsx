"use client";

import { AlertTriangle, ExternalLink, ShieldAlert, X } from "lucide-react";

interface SafeLinkModalProps {
  url: string | null;
  onClose: () => void;
}

export default function SafeLinkModal({ url, onClose }: SafeLinkModalProps) {
  if (!url) return null;

  const domain = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  })();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card-bg border border-card-border rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-bold">Stay Safe</h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning content */}
        <div className="space-y-3 text-sm text-muted mb-5">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p>
              You are about to visit an <span className="text-foreground font-medium">external third-party link</span> that is not
              affiliated with this dashboard or the QR team.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p>
              <span className="text-foreground font-medium">Never sign suspicious transactions</span> or
              share your seed phrase or private keys with any website.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p>
              Anyone can bid on the QR auction. Winning links are{" "}
              <span className="text-foreground font-medium">not vetted or endorsed</span>. Use all links at your own risk.
            </p>
          </div>
        </div>

        {/* URL preview */}
        <div className="bg-background/50 border border-card-border rounded-lg p-3 mb-5">
          <div className="text-xs text-muted mb-1">You will be taken to:</div>
          <div className="text-sm text-accent font-mono break-all">
            {domain}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-card-border text-sm font-medium hover:bg-card-border/30 transition-colors"
          >
            Go Back
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg bg-accent/20 border border-accent/30 text-accent text-sm font-medium hover:bg-accent/30 transition-colors text-center flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Continue
          </a>
        </div>
      </div>
    </div>
  );
}
