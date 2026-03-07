"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden transition-all duration-300 hover:border-brand-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-5 text-left flex items-center justify-between bg-white hover:bg-surface-muted transition-colors"
      >
        <span className="text-lg font-semibold text-text-primary-dark pr-4">
          {question}
        </span>
        <ChevronDownIcon
          className={`w-5 h-5 text-brand flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="px-6 pb-5">
          <p className="text-text-body leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
}
