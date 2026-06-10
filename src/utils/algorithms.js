function normalizeRam(ram, capacity) {
  const copy = [...ram];
  if (copy.length > capacity) copy.length = capacity;
  while (copy.length < capacity) copy.push(null);
  return copy;
}

export function runFIFO(currState, capacity, request, stepIndex) {
  const ram = normalizeRam(currState.ram, capacity);

  let totalHits = currState.totalHits;
  let totalMisses = currState.totalMisses;
  let lastResult = "Hit";
  let flashIndex = null;
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
      // RAM is full, evict the FIFO
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
      flashIndex = oldestIdx;
      newLogs.unshift(
        `[Step #${stepIndex}] [MISS] RAM full. Evicted ${evictedName} (loaded oldest at step #${oldestStep}) from Slot ${oldestIdx + 1} to load ${request}.`
      );
    }
  }

  const updatedRam = ram.map((slot) => {
    if (slot === null) return null;
    return {
      ...slot,
      counterLabel: `Loaded: #${slot.metadata}`,
    };
  });

  return {
    ram: updatedRam,
    totalHits,
    totalMisses,
    lastResult,
    logs: newLogs,
    flashIndex,
  };
}

export function runLRU(currState, capacity, request, stepIndex) {
  const ram = normalizeRam(currState.ram, capacity);

  let totalHits = currState.totalHits;
  let totalMisses = currState.totalMisses;
  let lastResult = "Hit";
  let flashIndex = null;
  const newLogs = [...currState.logs];

  const hitIndex = ram.findIndex((slot) => slot !== null && slot.appName === request);

  if (hitIndex !== -1) {
    // Hit! Update lastUsed timestamp metadata
    totalHits += 1;
    lastResult = "Hit";
    ram[hitIndex] = {
      ...ram[hitIndex],
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
      // Evict Least Recently Used
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
      flashIndex = lruIdx;
      newLogs.unshift(
        `[Step #${stepIndex}] [MISS] RAM full. Evicted ${evictedName} (idle since step #${lruStep}) from Slot ${lruIdx + 1} to load ${request}.`
      );
    }
  }

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
    flashIndex,
  };
}

export function runOptimal(currState, capacity, request, stepIndex, futureLookahead) {
  const ram = normalizeRam(currState.ram, capacity);

  let totalHits = currState.totalHits;
  let totalMisses = currState.totalMisses;
  let lastResult = "Hit";
  let flashIndex = null;
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
        metadata: 0,
        counterLabel: "",
      };
      newLogs.unshift(
        `[Step #${stepIndex}] [MISS] loaded ${request} into empty Slot ${emptyIndex + 1}.`
      );
    } else {
      // RAM is full. Evaluate future lookahead distance for each active slot
      let maxDistance = -1;
      let evictIdx = 0;

      for (let i = 0; i < ram.length; i++) {
        const slot = ram[i];
        if (slot === null) continue;

        // Find next request index in futureLookahead
        const nextOccurrence = futureLookahead.indexOf(slot.appName);

        let distance = 0;
        if (nextOccurrence === -1) {
          // If it is never used again, distance is infinite
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
      flashIndex = evictIdx;
      ram[evictIdx] = {
        appName: request,
        metadata: 0,
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

  // Compute actual next occurrences in the remaining future lookahead queue
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
    flashIndex,
  };
}
