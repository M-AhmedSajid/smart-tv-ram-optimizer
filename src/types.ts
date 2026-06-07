/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IconType } from "react-icons";
import { FaAmazon } from "react-icons/fa";
import { SiHbomax, SiNetflix, SiYoutube } from "react-icons/si";
import { TbBrandDisney } from "react-icons/tb";

export type AppName =
  | "Netflix"
  | "YouTube"
  | "Amazon Prime"
  | "Disney+"
  | "Max";

export interface AppConfig {
  name: AppName;
  color: string;
  bgColor: string;
  borderColor: string;
  textAccent: string;
  icon: IconType;
  shortLabel: string;
}

export interface RAMSlot {
  appName: AppName;
  /** FIFO: The sequence number / relative loading timestamp. LRU: The relative last-accessed step. */
  metadata: number;
  /** Human-readable counter content */
  counterLabel: string;
}

export interface AlgorithmState {
  ram: (RAMSlot | null)[];
  totalHits: number;
  totalMisses: number;
  lastResult: "Hit" | "Miss" | null;
  logs: string[];
}

export interface SimulationState {
  capacity: number;
  totalRequests: number;
  isStarted: boolean; // Locks the RAM capacity slider once simulation begins
  futureQueue: AppName[];
  requestHistory: AppName[];
  fifoState: AlgorithmState;
  lruState: AlgorithmState;
  optimalState: AlgorithmState;
}

export const APPS: Record<AppName, AppConfig> = {
  Netflix: {
    name: "Netflix",
    color: "#E50914",
    bgColor: "bg-red-950/40",
    borderColor: "border-red-600",
    textAccent: "text-red-500",
    icon: SiNetflix,
    shortLabel: "Netflix",
  },
  YouTube: {
    name: "YouTube",
    color: "#FF0000",
    bgColor: "bg-rose-950/40",
    borderColor: "border-rose-600",
    textAccent: "text-rose-500",
    icon: SiYoutube,
    shortLabel: "YouTube",
  },
  "Amazon Prime": {
    name: "Amazon Prime",
    color: "#00A8E8",
    bgColor: "bg-sky-950/40",
    borderColor: "border-sky-500",
    textAccent: "text-sky-400",
    icon: FaAmazon,
    shortLabel: "Prime",
  },
  "Disney+": {
    name: "Disney+",
    color: "#113CCF",
    bgColor: "bg-indigo-950/40",
    borderColor: "border-indigo-500",
    textAccent: "text-indigo-400",
    icon: TbBrandDisney,
    shortLabel: "Disney",
  },
  Max: {
    name: "Max",
    color: "#fff",
    bgColor: "bg-white-950/40",
    borderColor: "border-white-500",
    textAccent: "text-white-400",
    icon: SiHbomax,
    shortLabel: "Max",
  },
};

export const APP_LIST: AppName[] = [
  "Netflix",
  "YouTube",
  "Amazon Prime",
  "Disney+",
  "Max",
];
