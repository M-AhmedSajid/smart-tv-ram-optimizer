/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppName, RAMSlot, AlgorithmState } from "../types";

/**
 * Executes a step of the FIFO Algorithm
 */
export function runFIFO(
  currState: AlgorithmState,
  capacity: number,
  request: AppName,
  stepIndex: number
): AlgorithmState {
  const ram = [...currState.ram];
  // Pads/truncates ram array to match capacity
  while (ram.length < capacity) ram.push(null);
  if (ram.length > capacity) ram.length = capacity;

  let totalHits = currState.totalHits;
  let totalMisses = currState.totalMisses;
  let lastResult: "Hit" | "Miss" = "Hit";
  const newLogs = [...currState.logs];

  // Check for hit
  const hitIndex = ram.findIndex((slot) => slot !== null && slot.appName === request);

  if (hitIndex !== -1) {
    // Hit! No changes in RAM structure for FIFO
    totalHits += 1;
    lastResult = "Hit";
    newLogs.unshift(`[Step #${stepIndex}] [HIT] ${request} was found in RAM. No RAM swap needed.`);
  } else {
    // Miss!
    totalMisses += 1;
    lastResult = "Miss";

    // Find if there is an empty slot
    const emptyIndex = ram.findIndex((slot) => slot === null);
    if (emptyIndex !== -1) {
      ram[emptyIndex] = {
        appName: request,
        metadata: stepIndex,
        counterLabel: `Loaded: #${stepIndex}`,
      };
      newLogs.unshift(
        `[Step #${stepIndex}] [MISS] ${request} is not in RAM. Allocated to empty Slot ${emptyIndex + 1}.`
      );
    } else {
      // RAM is full, evict the FIFO (lowest metadata stepIndex)
      let oldestIdx = 0;
      let oldestStep = Infinity;

      for (let i = 0; i < ram.length; i++) {
        const slot = ram[i];
        if (slot !== null && slot.metadata < oldestStep) {
          oldestStep = slot.metadata;
          oldestIdx = i;
        }
      }

      const evicted = ram[oldestIdx];
      ram[oldestIdx] = {
        appName: request,
        metadata: stepIndex,
        counterLabel: `Loaded: #${stepIndex}`,
      };

      const evictedName = evicted ? evicted.appName : "Unknown";
      newLogs.unshift(
        `[Step #${stepIndex}] [MISS] RAM full. Evicted ${evictedName} (loaded oldest at step #${oldestStep}) from Slot ${oldestIdx + 1} to load ${request}.`
      );
    }
  }

  // Double check all non-empty labels to verify sequence output
  const updatedRam = ram.map((slot) => {
    if (slot === null) return null;
    return {
      ...slot,
      counterLabel: `Loaded at step #${slot.metadata}`,
    };
  });

  return {
    ram: updatedRam,
    totalHits,
    totalMisses,
    lastResult,
    logs: newLogs,
  };
}

/**
 * Executes a step of the LRU Algorithm
 */
export function runLRU(
  currState: AlgorithmState,
  capacity: number,
  request: AppName,
  stepIndex: number
): AlgorithmState {
  const ram = [...currState.ram];
  while (ram.length < capacity) ram.push(null);
  if (ram.length > capacity) ram.length = capacity;

  let totalHits = currState.totalHits;
  let totalMisses = currState.totalMisses;
  let lastResult: "Hit" | "Miss" = "Hit";
  const newLogs = [...currState.logs];

  const hitIndex = ram.findIndex((slot) => slot !== null && slot.appName === request);

  if (hitIndex !== -1) {
    // Hit! Update lastUsed timestamp metadata
    totalHits += 1;
    lastResult = "Hit";
    ram[hitIndex] = {
      ...ram[hitIndex]!,
      metadata: stepIndex, // Update lastUsed time to current step
    };
    newLogs.unshift(
      `[Step #${stepIndex}] [HIT] ${request} hit! Dynamic cache refreshed. Mark active at step #${stepIndex}.`
    );
  } else {
    // Miss!
    totalMisses += 1;
    lastResult = "Miss";

    const emptyIndex = ram.findIndex((slot) => slot === null);
    if (emptyIndex !== -1) {
      ram[emptyIndex] = {
        appName: request,
        metadata: stepIndex,
        counterLabel: `Used: #${stepIndex}`,
      };
      newLogs.unshift(
        `[Step #${stepIndex}] [MISS] allocation for ${request}. Initialized in empty Slot ${emptyIndex + 1}.`
      );
    } else {
      // Evict Least Recently Used (lowest metadata)
      let lruIdx = 0;
      let lruStep = Infinity;

      for (let i = 0; i < ram.length; i++) {
        const slot = ram[i];
        if (slot !== null && slot.metadata < lruStep) {
          lruStep = slot.metadata;
          lruIdx = i;
        }
      }

      const evicted = ram[lruIdx];
      ram[lruIdx] = {
        appName: request,
        metadata: stepIndex,
        counterLabel: `Used: #${stepIndex}`,
      };

      const evictedName = evicted ? evicted.appName : "Unknown";
      newLogs.unshift(
        `[Step #${stepIndex}] [MISS] RAM full. Evicted ${evictedName} (idle since step #${lruStep}) from Slot ${lruIdx + 1} to load ${request}.`
      );
    }
  }

  // Update counterLabels to reflect idle duration or last used step relative to the action
  const updatedRam = ram.map((slot) => {
    if (slot === null) return null;
    const idleDuration = stepIndex - slot.metadata;
    return {
      ...slot,
      counterLabel: idleDuration === 0 ? "Just used" : `Idle for ${idleDuration} steps`,
    };
  });

  return {
    ram: updatedRam,
    totalHits,
    totalMisses,
    lastResult,
    logs: newLogs,
  };
}

/**
 * Executes a step of the Optimal Algorithm
 * @param futureLookahead List of upcoming requests including or after this current step index
 */
export function runOptimal(
  currState: AlgorithmState,
  capacity: number,
  request: AppName,
  stepIndex: number,
  futureLookahead: AppName[]
): AlgorithmState {
  const ram = [...currState.ram];
  while (ram.length < capacity) ram.push(null);
  if (ram.length > capacity) ram.length = capacity;

  let totalHits = currState.totalHits;
  let totalMisses = currState.totalMisses;
  let lastResult: "Hit" | "Miss" = "Hit";
  const newLogs = [...currState.logs];

  const hitIndex = ram.findIndex((slot) => slot !== null && slot.appName === request);

  if (hitIndex !== -1) {
    // Hit!
    totalHits += 1;
    lastResult = "Hit";
    newLogs.unshift(
      `[Step #${stepIndex}] [HIT] ${request} found in current RAM list. Optimal layout preserved.`
    );
  } else {
    // Miss!
    totalMisses += 1;
    lastResult = "Miss";

    const emptyIndex = ram.findIndex((slot) => slot === null);
    if (emptyIndex !== -1) {
      ram[emptyIndex] = {
        appName: request,
        metadata: 0, // will be computed below
        counterLabel: "",
      };
      newLogs.unshift(
        `[Step #${stepIndex}] [MISS] loaded ${request} into empty Slot ${emptyIndex + 1}.`
      );
    } else {
      // RAM is full. Evaluate future lookahead distance for each active slot
      // Distance is first occurrence index in futureLookahead
      let maxDistance = -1;
      let evictIdx = 0;

      for (let i = 0; i < ram.length; i++) {
        const slot = ram[i];
        if (slot === null) continue;

        // Find next request index in futureLookahead (future queue contains remaining items)
        const nextOccurrence = futureLookahead.indexOf(slot.appName);
        
        let distance = 0;
        if (nextOccurrence === -1) {
          // If it is never used again, distance is infinite (we set extreme priority with FIFO order retention)
          distance = 10000 + i;
        } else {
          distance = nextOccurrence;
        }

        if (distance > maxDistance) {
          maxDistance = distance;
          evictIdx = i;
        }
      }

      const evicted = ram[evictIdx];
      const evictedName = evicted ? evicted.appName : "Unknown";

      // Swap in new app
      ram[evictIdx] = {
        appName: request,
        metadata: 0, // will be computed below
        counterLabel: "",
      };

      const explanation =
        maxDistance >= 10000
          ? `never requested again in lookahead`
          : `requested furthest in future (+${maxDistance + 1} steps)`;

      newLogs.unshift(
        `[Step #${stepIndex}] [MISS] RAM full. Evicted ${evictedName} (${explanation}) from Slot ${evictIdx + 1} to load ${request}.`
      );
    }
  }

  // Compute actual next occurrences in the remaining future lookahead queue (all looking forward)
  const updatedRam = ram.map((slot) => {
    if (slot === null) return null;
    const nextOccur = futureLookahead.indexOf(slot.appName);
    let label = "";
    if (nextOccur === -1) {
      label = "Needed: never again";
    } else {
      label = `Needed in: ${nextOccur + 1} steps`;
    }
    return {
      ...slot,
      metadata: nextOccur === -1 ? 99999 : nextOccur,
      counterLabel: label,
    };
  });

  return {
    ram: updatedRam,
    totalHits,
    totalMisses,
    lastResult,
    logs: newLogs,
  };
}
