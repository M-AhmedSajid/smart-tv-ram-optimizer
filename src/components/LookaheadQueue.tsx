/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AppName, APPS } from "../types";
import { Sparkles } from "lucide-react";

interface LookaheadQueueProps {
  queue: AppName[];
}

export const LookaheadQueue: React.FC<LookaheadQueueProps> = ({ queue }) => {
  return (
    <div className="bg-bento-surface border border-bento-border rounded-xl p-5 mb-6 shadow-md">
      <div className="flex items-center justify-between mb-3 border-b border-[#2d2d34]/60 pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
          <h2 className="text-sm font-semibold tracking-wider uppercase text-gray-200">
            Smart TV Prediction Engine (Future Lookahead Queue)
          </h2>
        </div>
        <span className="text-xs font-mono text-gray-500 bg-[#121214] px-2 py-1 rounded border border-[#2d2d34]">
          Size: 20 Forecasts
        </span>
      </div>

      <p className="text-xs text-gray-400 mb-4 leading-relaxed">
        The Optimal algorithm evaluates this exact sequence of predicted user choices. On a miss, it will prioritize evicting the app needed furthest in the future.
      </p>

      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 overflow-x-auto select-none pointer-events-none py-2">
  {queue.slice(0, 20).map((appName, index) => {
    const app = APPS[appName];
    const Icon = app.icon;

    const isNext = index === 0;

    return (
      <div
        key={`${appName}-${index}`}
        className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border h-[62px] relative ${app.borderColor} ${app.textAccent} ${
          isNext ? "ring-1 ring-amber-500/40" : ""
        }`}
      >
        {/* position */}
        <div className="absolute top-[1.5px] right-[4px] text-[8px] font-mono text-gray-500 font-bold">
          +{index + 1}
        </div>

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
    </div>
  );
};
