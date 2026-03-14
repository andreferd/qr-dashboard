"use client";

export default function FaviconImage({
  src,
  className = "w-12 h-12 rounded-xl bg-card-border",
}: {
  src: string;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt=""
      className={className}
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  );
}
