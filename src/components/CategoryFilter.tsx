"use client";

import { CATEGORIES, type ProjectCategory } from "@/lib/types";
import { getCategoryColor } from "@/lib/data";

interface CategoryFilterProps {
  selected: string | null;
  onSelect: (category: string | null) => void;
}

export default function CategoryFilter({
  selected,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
          selected === null
            ? "bg-accent/20 text-accent border-accent/30"
            : "bg-card-bg text-muted border-card-border hover:border-accent/30"
        }`}
      >
        All
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat === selected ? null : cat)}
          className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
            cat === selected
              ? getCategoryColor(cat)
              : "bg-card-bg text-muted border-card-border hover:border-accent/30"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
