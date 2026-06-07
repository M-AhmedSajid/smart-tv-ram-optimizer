/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AppName, APP_LIST, APPS } from "../types";
import { Tv, RotateCcw, Play, CornerDownRight, Cpu } from "lucide-react";

interface ControlPanelProps {
  capacity: number;
  isStarted: boolean;
  onCapacityChange: (cap: number) => void;
  onTriggerApp: (appName: AppName) => void;
  onReset: () => void;
  nextPredictedApp: AppName | null;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  capacity,
  isStarted,
  onCapacityChange,
  onTriggerApp,
  onReset,
  nextPredictedApp,
}) => {
  return (
    <div className="bg-bento-surface border border-bento-border rounded-xl p-5 mb-6 shadow-md">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* TV RAM Capacity Optimizer Configuration */}
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="2"
              max="5"
              value={capacity}
              disabled={isStarted}
              onChange={(e) => onCapacityChange(parseInt(e.target.value))}
              className="flex-1 h-2 bg-[#121214] border border-[#2d2d34] rounded-lg appearance-none cursor-pointer accent-sky-400 disabled:opacity-40 disabled:cursor-not-allowed"
            />
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold text-sky-400 bg-[#121214] px-3 py-1.5 rounded-md border border-[#2d2d34] min-w-[50px] text-center">
                {capacity}
              </span>
              <span className="text-xs text-gray-500 font-semibold uppercase">
                Slots
              </span>
            </div>
          </div>
        </div>

        {/* Command Buttons Area */}
        <div className="flex-1 flex flex-col justify-end gap-3 min-w-[280px]">
          <div className="flex items-center justify-between border-b border-[#2d2d34] pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Interactive Remotes
            </span>
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-850 text-xs font-mono font-bold text-gray-300 rounded-md transition-all border border-[#2d2d34]"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              Reset All
            </button>
          </div>

          {/* Quick Step - Forecast Engine Trigger */}
          {nextPredictedApp && (
            <button
              onClick={() => onTriggerApp(nextPredictedApp)}
              className="w-full flex items-center justify-between py-2.5 px-4 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 font-mono text-xs font-bold text-[#121214] rounded-lg transition-all shadow-md group border border-amber-600/20"
            >
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 fill-current text-[#121214]" />
                <span>STEP CURRENT PREDICTION</span>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-950/20 px-2 py-0.5 rounded font-bold">
                <CornerDownRight className="w-3 h-3 text-[#121214]" />
                <span>{nextPredictedApp}</span>
              </div>
            </button>
          )}

          {/* Manual App click triggers */}
          <div>
            <p className="text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-450 animate-pulse" />
              Or manually launch any device app:
            </p>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2">
              {APP_LIST.map((appName) => {
                const config = APPS[appName];
                let btnThemeClass =
                  "border-bento-border text-white hover:bg-neutral-800";

                if (appName === "Netflix") {
                  btnThemeClass =
                    "border-netflix/40 hover:border-netflix text-netflix bg-netflix/5 hover:bg-netflix/15";
                } else if (appName === "YouTube") {
                  btnThemeClass =
                    "border-youtube/40 hover:border-youtube text-youtube bg-youtube/5 hover:bg-youtube/15";
                } else if (appName === "Amazon Prime") {
                  btnThemeClass =
                    "border-prime/40 hover:border-prime text-prime bg-prime/5 hover:bg-prime/15";
                } else if (appName === "Disney+") {
                  btnThemeClass =
                    "border-disney/40 hover:border-disney text-disney bg-disney/5 hover:bg-disney/15";
                } else if (appName === "Max") {
                  btnThemeClass =
                    "border-max/40 hover:border-max text-max bg-max/5 hover:bg-max/15";
                }

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
