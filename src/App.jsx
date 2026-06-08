import { useState, useEffect } from "react";
import { APP_LIST, APPS } from "./types";
import { runFIFO, runLRU, runOptimal } from "./utils/algorithms";
import { ControlPanel } from "./components/ControlPanel";
import { LookaheadQueue } from "./components/LookaheadQueue";
import { RAMSlotsVisualizer } from "./components/RAMSlotsVisualizer";
import { MetricsPanel } from "./components/MetricsPanel";
import { LiveConsole } from "./components/LiveConsole";
import { Tv, CheckCircle2, XCircle } from "lucide-react";

function useFlash(flash, setFlash) {
  useEffect(() => {
    if (!flash) return;

    const timer = setTimeout(() => {
      setFlash(null);
    }, 1000);

    return () => clearTimeout(timer);
  }, [flash, setFlash]);
}

// Helper to generate a random app
const getRandomApp = () => {
  return APP_LIST[Math.floor(Math.random() * APP_LIST.length)];
};

// Helper for initial lookahead list of 10 forecasted items
const generateInitialQueue = () => {
  const list = [];
  for (let i = 0; i < 15; i++) {
    list.push(getRandomApp());
  }
  return list;
};

const initialAlgorithmState = (capacity) => ({
  ram: Array(capacity).fill(null),
  totalHits: 0,
  totalMisses: 0,
  lastResult: null,
  logs: [],
});

export default function App() {
  const [capacity, setCapacity] = useState(3);
  const [totalRequests, setTotalRequests] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [futureQueue, setFutureQueue] = useState([]);
  const [requestHistory, setRequestHistory] = useState([]);

  // Independent algorithm trackers for parallel state flow
  const [fifoState, setFifoState] = useState(initialAlgorithmState(3));
  const [lruState, setLruState] = useState(initialAlgorithmState(3));
  const [optimalState, setOptimalState] = useState(initialAlgorithmState(3));

  const [fifoFlash, setFifoFlash] = useState(null);
  const [lruFlash, setLruFlash] = useState(null);
  const [optimalFlash, setOptimalFlash] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  useFlash(fifoFlash, setFifoFlash);
  useFlash(lruFlash, setLruFlash);
  useFlash(optimalFlash, setOptimalFlash);

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
  const handleTriggerApp = (appName) => {
    const nextStep = totalRequests + 1;
    setIsStarted(true);

    const nextFifoState = runFIFO(fifoState, capacity, appName, nextStep);
    const nextLruState = runLRU(lruState, capacity, appName, nextStep);

    // Optimal looks ahead into subsequent future items. If the appName clicked is the next anticipated in lookahead,
    // the Optimal algorithm utilizes futureQueue starting from index 1.
    const remainingLookahead = futureQueue.slice(1);
    const nextOptimalState = runOptimal(
      optimalState,
      capacity,
      appName,
      nextStep,
      remainingLookahead,
    );

    setFifoState(nextFifoState);
    setLruState(nextLruState);
    setOptimalState(nextOptimalState);

    if (
      nextFifoState.flashIndex !== null &&
      nextFifoState.flashIndex !== undefined
    ) {
      setFifoFlash({ index: nextFifoState.flashIndex, phase: "loaded" });
    }
    if (
      nextLruState.flashIndex !== null &&
      nextLruState.flashIndex !== undefined
    ) {
      setLruFlash({ index: nextLruState.flashIndex, phase: "loaded" });
    }
    if (
      nextOptimalState.flashIndex !== null &&
      nextOptimalState.flashIndex !== undefined
    ) {
      setOptimalFlash({ index: nextOptimalState.flashIndex, phase: "loaded" });
    }

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

  const algorithmStats = [
    {
      name: "FIFO",
      hits: fifoState.totalHits,
      misses: fifoState.totalMisses,
      pageFaults: fifoState.totalMisses,
    },
    {
      name: "LRU",
      hits: lruState.totalHits,
      misses: lruState.totalMisses,
      pageFaults: lruState.totalMisses,
    },
    {
      name: "Optimal",
      hits: optimalState.totalHits,
      misses: optimalState.totalMisses,
      pageFaults: optimalState.totalMisses,
    },
  ].map((algo) => {
    const requests = algo.hits + algo.misses;
    return {
      ...algo,
      ratio: requests > 0 ? (algo.hits / requests) * 100 : 0,
    };
  });

  const bestAlgorithm = (() => {
    if (totalRequests === 0) return null;
    const sorted = [...algorithmStats].sort((a, b) => {
      if (b.ratio !== a.ratio) return b.ratio - a.ratio;
      if (a.pageFaults !== b.pageFaults) return a.pageFaults - b.pageFaults;
      return b.hits - a.hits;
    });

    const top = sorted[0];
    const ties = algorithmStats.filter(
      (algo) =>
        algo.ratio === top.ratio &&
        algo.pageFaults === top.pageFaults &&
        algo.hits === top.hits,
    );

    return {
      top,
      tied: ties.length > 1 ? ties : null,
    };
  })();

  return (
    <div className="min-h-screen bg-bento-bg text-gray-100 flex flex-col justify-between font-sans selection:bg-neutral-800">
      {/* HEADER SECTION */}
      <header className="border-b border-bento-border bg-bento-surface/50 backdrop-blur-md px-4 py-3 sm:px-6">
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 pb-6 flex flex-col">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-bento-border border border-bento-border rounded-xl overflow-hidden flex-1 items-stretch shadow-md">
          {/* COLUMN 1: FIFO */}
          <div className="flex flex-col gap-4 bg-bento-bg p-5">
            <div className="border-b border-bento-border pb-3">
              <h2 className="text-base font-extrabold text-white uppercase tracking-wider">
                FIFO (First-In, First-Out)
              </h2>
              <p className="text-[10.5px] text-gray-400">
                Evicts the oldest page loaded in RAM slots
              </p>
            </div>

            {/* IMMEDIATE HIT/MISS TICKER BLOCK */}
            {fifoState.lastResult === "Hit" && (
              <div className="w-full bg-emerald-500 text-bento-bg py-2.5 px-4 rounded-lg flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-bento-bg" />
                  <span className="font-extrabold text-xs uppercase tracking-wider">
                    RAM HIT
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-emerald-600/20 px-1.5 py-0.5 rounded">
                  Found page
                </span>
              </div>
            )}
            {fifoState.lastResult === "Miss" && (
              <div className="w-full bg-rose-500 text-white py-2.5 px-4 rounded-lg flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-white" />
                  <span className="font-extrabold text-xs uppercase tracking-wider">
                    RAM MISS
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-rose-600/40 px-1.5 py-0.5 rounded">
                  Page Eviction
                </span>
              </div>
            )}

            {/* MEMORY GRAPH STATE */}
            <RAMSlotsVisualizer
              ram={fifoState.ram}
              capacity={capacity}
              slotFlash={fifoFlash}
            />

            {/* PERFORMANCE METRICS */}
            <MetricsPanel
              totalHits={fifoState.totalHits}
              totalMisses={fifoState.totalMisses}
              pageFaults={fifoState.totalMisses}
            />

            {/* REAL TIME CONSOLE */}
            <div className="mt-auto">
              <LiveConsole
                logs={fifoState.logs}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
              />
            </div>
          </div>

          {/* COLUMN 2: LRU */}
          <div className="flex flex-col gap-4 bg-bento-bg p-5">
            <div className="border-b border-bento-border pb-3">
              <h2 className="text-base font-extrabold text-white uppercase tracking-wider">
                LRU (Least Recently Used)
              </h2>
              <p className="text-[10.5px] text-gray-400">
                Evicts the page idle for the longest duration
              </p>
            </div>

            {/* IMMEDIATE HIT/MISS TICKER BLOCK */}
            {lruState.lastResult === "Hit" && (
              <div className="w-full bg-emerald-500 text-bento-bg py-2.5 px-4 rounded-lg flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-bento-bg" />
                  <span className="font-extrabold text-xs uppercase tracking-wider">
                    RAM HIT
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-emerald-600/20 px-1.5 py-0.5 rounded">
                  Found page
                </span>
              </div>
            )}
            {lruState.lastResult === "Miss" && (
              <div className="w-full bg-rose-500 text-white py-2.5 px-4 rounded-lg flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-white" />
                  <span className="font-extrabold text-xs uppercase tracking-wider">
                    RAM MISS
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-rose-600/40 px-1.5 py-0.5 rounded">
                  Page Eviction
                </span>
              </div>
            )}

            {/* MEMORY GRAPH STATE */}
            <RAMSlotsVisualizer
              ram={lruState.ram}
              capacity={capacity}
              slotFlash={lruFlash}
            />

            {/* PERFORMANCE METRICS */}
            <MetricsPanel
              totalHits={lruState.totalHits}
              totalMisses={lruState.totalMisses}
              pageFaults={lruState.totalMisses}
            />

            {/* REAL TIME CONSOLE */}
            <div className="mt-auto">
              <LiveConsole
                logs={lruState.logs}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
              />
            </div>
          </div>

          {/* COLUMN 3: OPTIMAL */}
          <div className="flex flex-col gap-4 bg-bento-bg p-5">
            <div className="border-b border-bento-border pb-3">
              <h2 className="text-base font-extrabold text-white uppercase tracking-wider">
                Optimal (Lookahead)
              </h2>
              <p className="text-[10.5px] text-gray-400">
                Evicts the page needed furthest in local lookahead list
              </p>
            </div>

            {/* IMMEDIATE HIT/MISS TICKER BLOCK */}
            {optimalState.lastResult === "Hit" && (
              <div className="w-full bg-emerald-500 text-bento-bg py-2.5 px-4 rounded-lg flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-bento-bg" />
                  <span className="font-extrabold text-xs uppercase tracking-wider">
                    RAM HIT
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-emerald-600/20 px-1.5 py-0.5 rounded">
                  Found page
                </span>
              </div>
            )}
            {optimalState.lastResult === "Miss" && (
              <div className="w-full bg-rose-500 text-white py-2.5 px-4 rounded-lg flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-white" />
                  <span className="font-extrabold text-xs uppercase tracking-wider">
                    RAM MISS
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-rose-600/40 px-1.5 py-0.5 rounded">
                  Page Eviction
                </span>
              </div>
            )}

            {/* MEMORY GRAPH STATE */}
            <RAMSlotsVisualizer
              ram={optimalState.ram}
              capacity={capacity}
              slotFlash={optimalFlash}
            />

            {/* PERFORMANCE METRICS */}
            <MetricsPanel
              totalHits={optimalState.totalHits}
              totalMisses={optimalState.totalMisses}
              pageFaults={optimalState.totalMisses}
            />

            {/* REAL TIME CONSOLE */}
            <div className="mt-auto">
              <LiveConsole
                logs={optimalState.logs}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
              />
            </div>
          </div>
        </div>

        <div className="bg-bento-surface border border-bento-border rounded-xl p-5 mt-6 shadow-md transition-all duration-500">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h3 className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">
                Best Performing Algorithm
              </h3>
              <p className="text-[11px] text-gray-500 mt-1">
                Live comparator for the current stream state.
              </p>
            </div>
            <span className="text-[9px] font-mono uppercase tracking-wider text-gray-500">
              Auto-updates every step
            </span>
          </div>

          {bestAlgorithm && bestAlgorithm.top ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-white text-sm font-semibold">
                <span className="text-lg">🏆</span>
                <span className="text-base uppercase tracking-wide text-sky-200">
                  {bestAlgorithm.tied
                    ? `Tie: ${bestAlgorithm.tied.map((algo) => algo.name).join(" & ")}`
                    : bestAlgorithm.top.name}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-bento-border bg-bento-bg/80 p-3">
                  <div className="text-[8px] uppercase tracking-wider text-gray-500 font-mono">
                    Hit Ratio
                  </div>
                  <div className="text-xl font-black text-white mt-1">
                    {bestAlgorithm.top.ratio.toFixed(1)}%
                  </div>
                </div>
                <div className="rounded-lg border border-bento-border bg-bento-bg/80 p-3">
                  <div className="text-[8px] uppercase tracking-wider text-gray-500 font-mono">
                    Hits
                  </div>
                  <div className="text-xl font-black text-white mt-1">
                    {bestAlgorithm.top.hits}
                  </div>
                </div>
                <div className="rounded-lg border border-bento-border bg-bento-bg/80 p-3">
                  <div className="text-[8px] uppercase tracking-wider text-gray-500 font-mono">
                    Page Faults
                  </div>
                  <div className="text-xl font-black text-white mt-1">
                    {bestAlgorithm.top.pageFaults}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-400">
              Run the first step to compare algorithm performance.
            </div>
          )}
        </div>

        {/* REQUEST HISTORY DRAWER */}
        {requestHistory.length > 0 && (
          <div className="bg-bento-surface border border-bento-border rounded-xl p-4 mt-6 shadow-sm transition-all duration-300">
            <button
              type="button"
              onClick={() => setHistoryOpen((open) => !open)}
              className="w-full flex items-center justify-between gap-3 text-left"
            >
              <div>
                <div className="text-sm font-semibold text-white">
                  Request History ({requestHistory.length})
                </div>
                <div className="text-[11px] text-gray-400">
                  Click to {historyOpen ? "collapse" : "expand"}.
                </div>
              </div>
              <span className="text-xs uppercase tracking-wider text-sky-300">
                {historyOpen ? "Hide" : "Show"}
              </span>
            </button>

            {historyOpen && (
              <div className="mt-4 flex flex-wrap gap-1.5 max-h-21.25 overflow-y-auto custom-scrollbar">
                {requestHistory.map((item, index) => {
                  const app = APPS[item];
                  return (
                    <span
                      key={`hist-${index}`}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-bento-bg border border-bento-border text-gray-300"
                    >
                      <span className="text-[9px] text-gray-600">
                        #{index + 1}
                      </span>
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: app?.color }}
                      />
                      {item}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
