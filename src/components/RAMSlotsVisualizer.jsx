import { APPS } from "../types";
import { Layers } from "lucide-react";

export const RAMSlotsVisualizer = ({ ram, capacity, slotFlash }) => {
  const slotsToShow = Array.from(
    { length: capacity },
    (_, i) => ram[i] ?? null,
  );

  return (
    <div className="bg-bento-surface border border-bento-border rounded-xl p-4 shadow-sm flex-1 flex flex-col justify-between">
      <div className="flex items-center gap-1.5 mb-3 border-b border-bento-border/55 pb-1.5">
        <Layers className="w-3.5 h-3.5 text-sky-450" />
        <h3 className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">
          RAM Physical Allocation Slots
        </h3>
      </div>

      <div className="flex flex-col gap-2.5">
        {slotsToShow.map((slot, index) => {
          if (slot === null) {
            return (
              <div
                key={`empty-slot-${index}`}
                id={`ram-slot-empty-${index}`}
                className="flex items-center justify-between h-13 border border-dashed border-bento-border bg-bento-bg/30 rounded-lg px-3.5 select-none"
              >
                <div className="flex items-center gap-2">
                  <div className="font-mono text-[9px] font-semibold text-gray-650 bg-bento-bg border border-bento-border px-1 rounded uppercase">
                    Slot {index + 1}
                  </div>
                  <div className="text-[11px] font-bold text-gray-650 uppercase tracking-wider">
                    Empty Slot
                  </div>
                </div>
              </div>
            );
          }

          const appConfig = APPS[slot.appName];
          const textColorClass = appConfig?.textAccent ?? "text-white";

          const flashPhase =
            slotFlash?.index === index ? slotFlash.phase : null;
          const flashBorder =
            flashPhase === "loaded"
              ? "border-emerald-400 bg-emerald-950/20"
              : "border-bento-border bg-bento-bg";

          return (
            <div
              key={`occupied-slot-${index}-${slot.appName}`}
              id={`ram-slot-occupied-${index}-${slot.appName}`}
              className={`relative flex items-center justify-between h-13 border rounded-lg px-3.5 transition-all duration-500 ${flashBorder}`}
            >
              <div className="flex items-center gap-2">
                {/* Slot index indicator */}
                <div className="font-mono text-[9px] font-bold text-gray-400 bg-bento-surface border border-bento-border px-1.5 py-0.5 rounded">
                  SLOT {index + 1}
                </div>

                {/* Main Name displaying bold uppercase text with custom color mapped accent */}
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: appConfig?.color }}
                  />
                  <div
                    className={`text-xs font-black tracking-wider uppercase ${textColorClass}`}
                  >
                    {slot.appName}
                  </div>
                </div>
              </div>

              {/* Counter metadata explanation tag */}
              <div className="text-right">
                <span className="inline-block text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-bento-surface text-gray-300 border border-bento-border">
                  {slot.counterLabel || "Active"}
                </span>
              </div>

              {flashPhase && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg text-[10px] font-bold uppercase tracking-widest bg-emerald-500/15 text-emerald-200">
                  LOADED
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
