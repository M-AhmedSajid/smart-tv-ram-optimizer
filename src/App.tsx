/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { AppName, APP_LIST, APPS, SimulationState, AlgorithmState } from "./types";
import { runFIFO, runLRU, runOptimal } from "./utils/algorithms";
import { ControlPanel } from "./components/ControlPanel";
import { LookaheadQueue } from "./components/LookaheadQueue";
import { RAMSlotsVisualizer } from "./components/RAMSlotsVisualizer";
import { MetricsPanel } from "./components/MetricsPanel";
import { LiveConsole } from "./components/LiveConsole";
import { Tv, Info, CheckCircle2, XCircle, Sparkles } from "lucide-react";

// Helper to generate a random app
const getRandomApp = (): AppName => {
  return APP_LIST[Math.floor(Math.random() * APP_LIST.length)];
};

// Helper for initial lookahead list of 10 forecasted items
const generateInitialQueue = (): AppName[] => {
  const list: AppName[] = [];
  for (let i = 0; i < 20; i++) {
    list.push(getRandomApp());
  }
  return list;
};

const initialAlgorithmState = (capacity: number): AlgorithmState => ({
  ram: Array(capacity).fill(null),
  totalHits: 0,
  totalMisses: 0,
  lastResult: null,
  logs: [],
});

export default function App() {
  const [capacity, setCapacity] = useState<number>(3);
  const [totalRequests, setTotalRequests] = useState<number>(0);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [futureQueue, setFutureQueue] = useState<AppName[]>([]);
  const [requestHistory, setRequestHistory] = useState<AppName[]>([]);

  // Independent algorithm trackers for parallel state flow
  const [fifoState, setFifoState] = useState<AlgorithmState>(initialAlgorithmState(3));
  const [lruState, setLruState] = useState<AlgorithmState>(initialAlgorithmState(3));
  const [optimalState, setOptimalState] = useState<AlgorithmState>(initialAlgorithmState(3));

  // Initialize prediction lookahead on mount
  useEffect(() => {
    setFutureQueue(generateInitialQueue());
  }, []);

  // Update algorithms state length if capacity slider is manipulated (before simulation starts)
  useEffect(() => {
    if (!isStarted) {
      setFifoState(initialAlgorithmState(capacity));
      setLruState(initialAlgorithmState(capacity));
      setOptimalState(initialAlgorithmState(capacity));
    }
  }, [capacity, isStarted]);

  // Handle a single application stream request event
  const handleTriggerApp = (appName: AppName) => {
    const nextStep = totalRequests + 1;
    setIsStarted(true);

    // 1. Process FIFO Algorithm
    setFifoState((prev) => runFIFO(prev, capacity, appName, nextStep));

    // 2. Process LRU Algorithm
    setLruState((prev) => runLRU(prev, capacity, appName, nextStep));

    // 3. Process Optimal Algorithm
    // Optimal looks ahead into subsequent future items. If the appName clicked is the next anticipated in lookahead,
    // the Optimal algorithm utilizes futureQueue starting from index 1.
    const remainingLookahead = futureQueue.slice(1);
    setOptimalState((prev) => runOptimal(prev, capacity, appName, nextStep, remainingLookahead));

    // 4. Record history and advance predictions queue (shift & append new forecast)
    setRequestHistory((prev) => [...prev, appName]);
    setTotalRequests(nextStep);

    // Shift lookahead list by removing index 0 and adding a new random prediction at the end
    setFutureQueue((prev) => {
      const nextQ = [...prev.slice(1)];
      nextQ.push(getRandomApp());
      return nextQ;
    });
  };

  // Reset entire simulator
  const handleReset = () => {
    setTotalRequests(0);
    setIsStarted(false);
    setRequestHistory([]);
    setFutureQueue(generateInitialQueue());

    setFifoState(initialAlgorithmState(capacity));
    setLruState(initialAlgorithmState(capacity));
    setOptimalState(initialAlgorithmState(capacity));
  };

  // The application preview target next
  const currentNextPredicted = futureQueue.length > 0 ? futureQueue[0] : null;

  return (
    <div className="min-h-screen bg-[#121214] text-gray-100 flex flex-col justify-between font-sans selection:bg-neutral-800">
      
      {/* HEADER SECTION */}
      <header className="border-b border-[#2d2d34] bg-[#202024]/50 backdrop-blur-md sticky top-0 z-50 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-sky-500/10 p-2 rounded-lg border border-sky-500/20">
              <Tv className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Smart TV App Streaming Memory Optimizer
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN WRAPPER CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 flex flex-col">

        {/* INPUT AND STATE CONTROLLERS PANEL */}
        <ControlPanel
          capacity={capacity}
          isStarted={isStarted}
          onCapacityChange={setCapacity}
          onTriggerApp={handleTriggerApp}
          onReset={handleReset}
          nextPredictedApp={currentNextPredicted}
        />

        {/* RECENT STREAM PREDICTIONS DISPLAY */}
        <LookaheadQueue queue={futureQueue} />

        {/* SIDE-BY-SIDE ALGORITHM REPLACEMENT VIEWS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-bento-border border border-bento-border rounded-xl overflow-hidden flex-1 items-stretch shadow-md">
          
          {/* COLUMN 1: FIFO */}
          <div className="flex flex-col gap-4 bg-[#121214] p-5">
            <div className="border-b border-[#2d2d34] pb-3">
              <span className="text-[10px] font-mono font-bold text-rose-500 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/40 uppercase tracking-widest">
                Queue Mode
              </span>
              <h2 className="text-base font-extrabold text-white uppercase tracking-wider mt-1">
                FIFO (First-In, First-Out)
              </h2>
              <p className="text-[10.5px] text-gray-400">
                Evicts the oldest page loaded in RAM slots
              </p>
            </div>

            {/* IMMEDIATE HIT/MISS TICKER BLOCK */}
            {fifoState.lastResult === "Hit" && (
              <div className="w-full bg-emerald-500 border-l-4 border-emerald-600 text-[#121214] py-2.5 px-4 rounded-lg flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#121214]" />
                  <span className="font-extrabold text-xs uppercase tracking-wider">⚡ RAM HIT</span>
                </div>
                <span className="text-[10px] font-mono bg-emerald-600/20 px-1.5 py-0.5 rounded">
                  Found page
                </span>
              </div>
            )}
            {fifoState.lastResult === "Miss" && (
              <div className="w-full bg-rose-500 border-l-4 border-rose-600 text-white py-2.5 px-4 rounded-lg flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-white" />
                  <span className="font-extrabold text-xs uppercase tracking-wider">⚠️ RAM MISS</span>
                </div>
                <span className="text-[10px] font-mono bg-rose-600/40 px-1.5 py-0.5 rounded">
                  Page Eviction
                </span>
              </div>
            )}

            {/* MEMORY GRAPH STATE */}
            <RAMSlotsVisualizer ram={fifoState.ram} capacity={capacity} />

            {/* PERFORMANCE METRICS */}
            <MetricsPanel totalHits={fifoState.totalHits} totalMisses={fifoState.totalMisses} />

            {/* REAL TIME CONSOLE */}
            <div className="mt-auto">
              <LiveConsole logs={fifoState.logs} />
            </div>
          </div>

          {/* COLUMN 2: LRU */}
          <div className="flex flex-col gap-4 bg-[#121214] p-5">
            <div className="border-b border-[#2d2d34] pb-3">
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/40 uppercase tracking-widest">
                Access Mode
              </span>
              <h2 className="text-base font-extrabold text-white uppercase tracking-wider mt-1">
                LRU (Least Recently Used)
              </h2>
              <p className="text-[10.5px] text-gray-400">
                Evicts the page idle for the longest duration
              </p>
            </div>

            {/* IMMEDIATE HIT/MISS TICKER BLOCK */}
            {lruState.lastResult === "Hit" && (
              <div className="w-full bg-emerald-500 border-l-4 border-emerald-600 text-[#121214] py-2.5 px-4 rounded-lg flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#121214]" />
                  <span className="font-extrabold text-xs uppercase tracking-wider">⚡ RAM HIT</span>
                </div>
                <span className="text-[10px] font-mono bg-emerald-600/20 px-1.5 py-0.5 rounded">
                  Found page
                </span>
              </div>
            )}
            {lruState.lastResult === "Miss" && (
              <div className="w-full bg-rose-500 border-l-4 border-rose-600 text-white py-2.5 px-4 rounded-lg flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-white" />
                  <span className="font-extrabold text-xs uppercase tracking-wider">⚠️ RAM MISS</span>
                </div>
                <span className="text-[10px] font-mono bg-rose-600/40 px-1.5 py-0.5 rounded">
                  Page Eviction
                </span>
              </div>
            )}

            {/* MEMORY GRAPH STATE */}
            <RAMSlotsVisualizer ram={lruState.ram} capacity={capacity} />

            {/* PERFORMANCE METRICS */}
            <MetricsPanel totalHits={lruState.totalHits} totalMisses={lruState.totalMisses} />

            {/* REAL TIME CONSOLE */}
            <div className="mt-auto">
              <LiveConsole logs={lruState.logs} />
            </div>
          </div>

          {/* COLUMN 3: OPTIMAL */}
          <div className="flex flex-col gap-4 bg-[#121214] p-5">
            <div className="border-b border-[#2d2d34] pb-3">
              <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/40 uppercase tracking-widest flex items-center gap-1 w-fit">
                <Sparkles className="w-3 h-3 text-indigo-400" /> Theoretical Min
              </span>
              <h2 className="text-base font-extrabold text-white uppercase tracking-wider mt-1">
                Optimal (Lookahead)
              </h2>
              <p className="text-[10.5px] text-gray-400">
                Evicts the page needed furthest in local lookahead list
              </p>
            </div>

            {/* IMMEDIATE HIT/MISS TICKER BLOCK */}
            {optimalState.lastResult === "Hit" && (
              <div className="w-full bg-emerald-500 border-l-4 border-emerald-600 text-[#121214] py-2.5 px-4 rounded-lg flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#121214]" />
                  <span className="font-extrabold text-xs uppercase tracking-wider">⚡ RAM HIT</span>
                </div>
                <span className="text-[10px] font-mono bg-emerald-600/20 px-1.5 py-0.5 rounded">
                  Found page
                </span>
              </div>
            )}
            {optimalState.lastResult === "Miss" && (
              <div className="w-full bg-rose-500 border-l-4 border-rose-600 text-white py-2.5 px-4 rounded-lg flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-white" />
                  <span className="font-extrabold text-xs uppercase tracking-wider">⚠️ RAM MISS</span>
                </div>
                <span className="text-[10px] font-mono bg-rose-600/40 px-1.5 py-0.5 rounded">
                  Page Eviction
                </span>
              </div>
            )}

            {/* MEMORY GRAPH STATE */}
            <RAMSlotsVisualizer ram={optimalState.ram} capacity={capacity} />

            {/* PERFORMANCE METRICS */}
            <MetricsPanel totalHits={optimalState.totalHits} totalMisses={optimalState.totalMisses} />

            {/* REAL TIME CONSOLE */}
            <div className="mt-auto">
              <LiveConsole logs={optimalState.logs} />
            </div>
          </div>

        </div>

        {/* CUMULATIVE SIMULATION HISTORY TRACKER FOOTER */}
        {requestHistory.length > 0 && (
          <div className="bg-[#202024] border border-[#2d2d34] rounded-xl p-4 mt-6">
            <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest mb-2.5">
              Cumulative Global App Request History ({requestHistory.length} total)
            </h3>
            <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto">
              {requestHistory.map((item, index) => {
                const app = APPS[item];
                return (
                  <span
                    key={`hist-${index}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#121214] border border-[#2d2d34] text-gray-300"
                  >
                    <span className="text-[9px] text-gray-600">#{index + 1}</span>
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: app?.color }}
                    />
                    {item}
                  </span>
                );
              })}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
