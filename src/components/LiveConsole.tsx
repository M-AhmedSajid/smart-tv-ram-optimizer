/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Terminal, Copy } from "lucide-react";

interface LiveConsoleProps {
  logs: string[];
}

export const LiveConsole: React.FC<LiveConsoleProps> = ({ logs }) => {
  return (
    <div className="bg-black border border-bento-border rounded-xl p-3.5 shadow-inner flex flex-col h-[180px]">
      <div className="flex items-center justify-between border-b border-bento-border/40 pb-1.5 mb-1.5">
        <div className="flex items-center gap-1">
          <Terminal className="w-3 h-3 text-sky-400" />
          <span className="text-[9px] font-mono tracking-wider font-bold text-gray-400 uppercase">
            Operational Live Log Console
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Pulse diagnostic beacon */}
          <span className="flex h-1.5 w-1.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span className="text-[8px] font-mono text-gray-500 uppercase">
            sys.output
          </span>
        </div>
      </div>

      {/* Narrative list container */}
      <div className="flex-1 overflow-y-auto font-mono text-[11px] text-emerald-400/90 space-y-1 pr-2 custom-scrollbar select-text">
        {logs.length === 0 ? (
          <div className="text-gray-600 italic text-[10px] h-full flex items-center justify-center">
            &gt;_ Ready... awaiting first app stream event.
          </div>
        ) : (
          logs.map((log, index) => {
            // Distinguish colors based on system keywords
            const isHit = log.includes("[HIT]");
            const isMiss = log.includes("[MISS]");
            let textColorClass = "text-emerald-400/80";

            if (isHit) {
              textColorClass = "text-emerald-450 font-semibold";
            } else if (isMiss) {
              textColorClass = "text-rose-400/90 font-medium";
            }

            return (
              <div
                key={`log-${index}`}
                className={`py-0.5 border-b border-bento-border/10 hover:bg-neutral-900/40 rounded leading-relaxed break-words ${textColorClass}`}
              >
                <span className="text-gray-600 font-bold">&gt;&nbsp;</span>
                {log}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
