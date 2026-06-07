import React, { useState } from "react";
import { APPS } from "../types";

export const LookaheadQueue = ({ queue }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-bento-surface border border-bento-border rounded-xl p-5 mb-6 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3 border-b border-bento-border/60 pb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold tracking-wider uppercase text-gray-200">
            Smart TV Prediction Engine (Future Lookahead Queue)
          </h2>
          <span className="text-xs font-mono text-gray-500 bg-bento-bg px-2 py-1 rounded border border-bento-border">
            Size: 15 Forecasts
          </span>
        </div>
        <button
          type="button"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          className="inline-flex items-center justify-center rounded-md border border-bento-border bg-bento-bg px-3 py-2 text-xs font-semibold uppercase tracking-wider text-sky-300 transition hover:bg-[#1c1c20]"
        >
          {isOpen ? "Hide Lookahead" : "Show Lookahead"}
        </button>
      </div>

      <p
        className={
          "text-xs text-gray-400 leading-relaxed" + (isOpen ? " mb-4" : "")
        }
      >
        The Optimal algorithm evaluates this exact sequence of predicted user
        choices. On a miss, it will prioritize evicting the app needed furthest
        in the future.
      </p>

      {isOpen && (
        <div className="grid grid-cols-5 sm:grid-cols-15 gap-2 overflow-x-auto select-none pointer-events-none py-2">
          {queue.slice(0, 15).map((appName, index) => {
            const app = APPS[appName];
            const Icon = app.icon;

            const isNext = index === 0;

            return (
              <div
                key={`${appName}-${index}`}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border h-15.5 relative ${app.borderColor} ${app.textAccent} ${
                  isNext ? "ring-1 ring-amber-500/40" : ""
                }`}
              >
                {/* next badge */}
                {isNext && (
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-amber-500 text-[7px] text-black font-mono font-extrabold px-1 rounded uppercase tracking-widest leading-none py-0.5">
                    Next
                  </div>
                )}

                {/* icon instead of letters */}
                <Icon className="text-sm" />

                {/* label */}
                <div className="text-center mt-0.5 w-full">
                  <p className="text-[8.5px] font-bold text-gray-300 truncate px-1 font-mono uppercase">
                    {app.shortLabel}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
