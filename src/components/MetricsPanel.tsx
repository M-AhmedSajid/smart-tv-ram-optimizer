/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Activity, Check, X } from "lucide-react";

interface MetricsPanelProps {
  totalHits: number;
  totalMisses: number;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ totalHits, totalMisses }) => {
  const totalRequests = totalHits + totalMisses;
  const ratio = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;

  return (
    <div className="bg-bento-surface border border-bento-border rounded-xl p-4 shadow-sm flex-1 flex flex-col justify-between">
      <div className="flex items-center gap-1.5 mb-3 border-b border-bento-border/55 pb-1.5">
        <Activity className="w-3.5 h-3.5 text-emerald-400" />
        <h3 className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">
          Core Allocation Metrics
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* Hits Box */}
        <div className="bg-bento-bg border border-bento-border rounded-lg p-2.5">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[9px] font-mono font-bold tracking-wider uppercase text-emerald-400">
              Hits
            </span>
            <Check className="w-3 h-3 text-emerald-400" />
          </div>
          <p className="text-xl font-black text-white font-mono leading-none">{totalHits}</p>
          <span className="text-[8px] text-gray-500 font-mono uppercase">In Cache</span>
        </div>

        {/* Misses Box */}
        <div className="bg-bento-bg border border-bento-border rounded-lg p-2.5">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[9px] font-mono font-bold tracking-wider uppercase text-rose-400">
              Misses
            </span>
            <X className="w-3 h-3 text-rose-400" />
          </div>
          <p className="text-xl font-black text-white font-mono leading-none">{totalMisses}</p>
          <span className="text-[8px] text-gray-500 font-mono uppercase">Uncached</span>
        </div>
      </div>

      {/* Hit Ratio & Mathematical State */}
      <div className="bg-bento-bg border border-bento-border rounded-lg p-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] font-mono uppercase tracking-wider text-sky-400 font-bold">
            Cache Hit Ratio (H.R.)
          </span>
          <span className="text-[10px] font-mono text-white font-extrabold bg-[#202024] border border-bento-border px-1.5 py-0.5 rounded leading-none">
            {ratio.toFixed(1)}%
          </span>
        </div>

        {/* Diagnostic Bar Chart */}
        <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden mb-2">
          <div
            className="bg-sky-400 h-1 rounded-full text-right"
            style={{ width: `${ratio}%` }}
          />
        </div>
      </div>
    </div>
  );
};
