import { APP_LIST, APP_THEMES, APPS } from "../types";
import { RotateCcw, Play, CornerDownRight } from "lucide-react";

export const ControlPanel = ({
  capacity,
  isStarted,
  onCapacityChange,
  onTriggerApp,
  onReset,
  nextPredictedApp,
}) => {
  return (
    <div className="sticky top-0 z-40 py-3 bg-bento-bg shadow-md border-b border-bento-border">
      <div className="bg-bento-surface border border-bento-border rounded-xl py-2.5 px-5 space-y-2.5">
        {/* Command Buttons Area */}
        <div className="flex items-center justify-between border-b border-bento-border pb-2 gap-5">
          {/* TV RAM Capacity Optimizer Configuration */}
          <div className="flex flex-1 items-center gap-4">
            <input
              type="range"
              min="2"
              max="5"
              value={capacity}
              disabled={isStarted}
              onChange={(e) => onCapacityChange(Number(e.target.value))}
              className="flex-1 h-2 bg-bento-bg border border-bento-border rounded-lg appearance-none cursor-pointer accent-sky-400 disabled:opacity-40 disabled:cursor-not-allowed"
            />
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold text-sky-400 bg-bento-bg px-3 py-1.5 rounded-md border border-bento-border min-w-12.5 text-center">
                {capacity}
              </span>
              <span className="text-xs text-gray-500 font-semibold uppercase">
                Slots
              </span>
            </div>
          </div>
          <div className="flex-1">
            {/* Quick Step - Forecast Engine Trigger */}
            {nextPredictedApp && (
              <button
                onClick={() => onTriggerApp(nextPredictedApp)}
                className="w-full flex items-center justify-between py-2.5 px-4 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 font-mono text-xs font-bold text-bento-bg rounded-lg transition-all shadow-md group border border-amber-600/20"
              >
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 fill-current text-bento-bg" />
                  <span>NEXT REQUEST</span>
                </div>
                <div className="flex items-center gap-1.5 bg-amber-950/20 px-2 py-0.5 rounded font-bold">
                  <CornerDownRight className="w-3 h-3 text-bento-bg" />
                  <span>{nextPredictedApp}</span>
                </div>
              </button>
            )}
          </div>
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-850 text-xs font-mono font-bold text-gray-300 rounded-md transition-all border border-bento-border"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            Reset All
          </button>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          {/* Manual App click triggers */}
          <div className="flex-1">
            <p className="text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-450 animate-pulse" />
              Or manually launch any device app:
            </p>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2">
              {APP_LIST.map((appName) => {
                const config = APPS[appName];
                let btnThemeClass =
                  APP_THEMES[appName] ??
                  "border-bento-border text-white hover:bg-neutral-800";

                const Icon = config.icon;

                return (
                  <button
                    key={appName}
                    onClick={() => onTriggerApp(appName)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all cursor-pointer font-bold ${btnThemeClass}`}
                  >
                    <Icon size={22} />
                    <span className="text-[10px] font-mono uppercase tracking-wider opacity-90">
                      {appName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
