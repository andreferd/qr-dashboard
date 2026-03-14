"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import SafeLinkModal from "./SafeLinkModal";

interface SafeExternalLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export default function SafeExternalLink({
  href,
  children,
  className = "",
}: SafeExternalLinkProps) {
  const [showWarning, setShowWarning] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowWarning(true)}
        className={className}
      >
        {children}
      </button>
      <SafeLinkModal
        url={showWarning ? href : null}
        onClose={() => setShowWarning(false)}
      />
    </>
  );
}
