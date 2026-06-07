import { FaAmazon } from "react-icons/fa";
import { SiHbomax, SiNetflix, SiYoutube } from "react-icons/si";
import { TbBrandDisney } from "react-icons/tb";

export const APPS = {
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
    bgColor: "bg-white/40",
    borderColor: "border-white",
    textAccent: "text-white",
    icon: SiHbomax,
    shortLabel: "Max",
  },
};

export const APP_LIST = [
  "Netflix",
  "YouTube",
  "Amazon Prime",
  "Disney+",
  "Max",
];

export const APP_THEMES = {
  Netflix:
    "border-netflix/40 hover:border-netflix text-netflix bg-netflix/5 hover:bg-netflix/15",
  YouTube:
    "border-youtube/40 hover:border-youtube text-youtube bg-youtube/5 hover:bg-youtube/15",
  "Amazon Prime":
    "border-prime/40 hover:border-prime text-prime bg-prime/5 hover:bg-prime/15",
  "Disney+":
    "border-disney/40 hover:border-disney text-disney bg-disney/5 hover:bg-disney/15",
  Max:
    "border-max/40 hover:border-max text-max bg-max/5 hover:bg-max/15",
};