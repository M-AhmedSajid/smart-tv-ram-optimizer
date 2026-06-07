import { Check } from "lucide-react";

export const MetricsPanel = ({ totalHits, totalMisses, pageFaults }) => {
  const totalRequests = totalHits + totalMisses;
  const ratio = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;
  const faults = pageFaults ?? totalMisses;

  return (
    <div className="bg-bento-surface border border-bento-border rounded-xl p-4 shadow-sm flex-1 flex flex-col justify-between">
      <div className="flex items-center gap-1.5 mb-3 border-b border-bento-border/55 pb-1.5">
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
          <p className="text-xl font-black text-white font-mono leading-none">
            {totalHits}
          </p>
          <span className="text-[8px] text-gray-500 font-mono uppercase">
            In Cache
          </span>
        </div>

        {/* Page Faults Box */}
        <div className="bg-bento-bg border border-bento-border rounded-lg p-2.5">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[9px] font-mono font-bold tracking-wider uppercase text-sky-400">
              Page Faults
            </span>
            <span className="w-2 h-2 rounded-full bg-sky-400" />
          </div>
          <p className="text-xl font-black text-white font-mono leading-none">
            {faults}
          </p>
          <span className="text-[8px] text-gray-500 font-mono uppercase">
            Miss Count
          </span>
        </div>
      </div>

      {/* Hit Ratio & Mathematical State */}
      <div className="bg-bento-bg border border-bento-border rounded-lg p-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] font-mono uppercase tracking-wider text-sky-400 font-bold">
            Cache Hit Ratio (H.R.)
          </span>
          <span className="text-[10px] font-mono text-white font-extrabold bg-bento-surface border border-bento-border px-1.5 py-0.5 rounded leading-none">
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
