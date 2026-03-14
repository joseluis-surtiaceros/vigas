import { useState, useEffect, type CSSProperties, type JSX } from "react";

// ── Types ────────────────────────────────────────────────────────────────────
type Beam = {
  id: string;
  name: string;
  lbsPerFt: number;   // lb/ft from catalog
  height: number;     // inches (exact)
  heightR: number;    // inches (rounded nominal)
  flange: number | null; // inches (exact), null for a few large beams
  flangeT: number;    // inches
  web: number;        // inches
};

type FractionOption = {
  label: string;
  inch: number;
};

type SearchInput = {
  height: number;
  flange: number;
  web: number | null;
  flangeT: number | null;
};

type ClosestResult = {
  beam: Beam;
  dist: number;
};

type Ranges = {
  height: { min: number; max: number };
  flange: { min: number; max: number };
  web: { min: number; max: number };
  flangeT: { min: number; max: number };
};

type BeamSVGProps = {
  heightRatio?: number;
  flangeRatio?: number;
  webRatio?: number;
  flangeTRatio?: number;
  size?: number;
};

type FractionPickerProps = {
  label: string;
  selectedInch: number | null;
  onSelect: (value: number | null) => void;
  isMobile: boolean;
};

// ── Full Catalog (all dimensions in inches) ──────────────────────────────────
const BEAMS: Beam[] = [
  { id:"Viga 4'' X 13 lb/ft", name:"Viga 4\" × 13 lb/ft", lbsPerFt:13, height:4.16, heightR:4, flange:4.06, flangeT:0.35, web:0.28 },
  { id:"Viga 5'' X 16 lb/ft", name:"Viga 5\" × 16 lb/ft", lbsPerFt:16, height:5.01, heightR:5, flange:5.0, flangeT:0.36, web:0.24 },
  { id:"Viga 5'' X 19 lb/ft", name:"Viga 5\" × 19 lb/ft", lbsPerFt:19, height:5.15, heightR:5, flange:5.03, flangeT:0.43, web:0.27 },
  { id:"Viga 6'' X 8 lb/ft", name:"Viga 6\" × 8 lb/ft", lbsPerFt:8, height:5.83, heightR:6, flange:3.94, flangeT:0.19, web:0.17 },
  { id:"Viga 6'' X 9 lb/ft", name:"Viga 6\" × 9 lb/ft", lbsPerFt:9, height:5.9, heightR:6, flange:3.94, flangeT:0.22, web:0.17 },
  { id:"Viga 6'' X 12 lb/ft", name:"Viga 6\" × 12 lb/ft", lbsPerFt:12, height:6.03, heightR:6, flange:4.0, flangeT:0.28, web:0.23 },
  { id:"Viga 6'' X 16 lb/ft", name:"Viga 6\" × 16 lb/ft", lbsPerFt:16, height:6.28, heightR:6, flange:4.03, flangeT:0.41, web:0.26 },
  { id:"Viga 6'' X 15 lb/ft", name:"Viga 6\" × 15 lb/ft", lbsPerFt:15, height:5.99, heightR:6, flange:5.99, flangeT:0.26, web:0.23 },
  { id:"Viga 6'' X 20 lb/ft", name:"Viga 6\" × 20 lb/ft", lbsPerFt:20, height:6.2, heightR:6, flange:6.02, flangeT:0.37, web:0.26 },
  { id:"Viga 6'' X 25 lb/ft", name:"Viga 6\" × 25 lb/ft", lbsPerFt:25, height:6.38, heightR:6, flange:6.08, flangeT:0.46, web:0.32 },
  { id:"Viga 8'' X 10 lb/ft", name:"Viga 8\" × 10 lb/ft", lbsPerFt:10, height:7.89, heightR:8, flange:3.94, flangeT:0.21, web:0.17 },
  { id:"Viga 8'' X 13 lb/ft", name:"Viga 8\" × 13 lb/ft", lbsPerFt:13, height:7.99, heightR:8, flange:4.0, flangeT:0.26, web:0.23 },
  { id:"Viga 8'' X 15 lb/ft", name:"Viga 8\" × 15 lb/ft", lbsPerFt:15, height:8.11, heightR:8, flange:4.02, flangeT:0.32, web:0.25 },
  { id:"Viga 8'' X 18 lb/ft", name:"Viga 8\" × 18 lb/ft", lbsPerFt:18, height:8.14, heightR:8, flange:5.25, flangeT:0.33, web:0.23 },
  { id:"Viga 8'' X 21 lb/ft", name:"Viga 8\" × 21 lb/ft", lbsPerFt:21, height:8.28, heightR:8, flange:5.27, flangeT:0.4, web:0.25 },
  { id:"Viga 8'' X 24 lb/ft", name:"Viga 8\" × 24 lb/ft", lbsPerFt:24, height:7.93, heightR:8, flange:6.5, flangeT:0.4, web:0.25 },
  { id:"Viga 8'' X 28 lb/ft", name:"Viga 8\" × 28 lb/ft", lbsPerFt:28, height:8.06, heightR:8, flange:6.54, flangeT:0.47, web:0.29 },
  { id:"Viga 8'' X 31 lb/ft", name:"Viga 8\" × 31 lb/ft", lbsPerFt:31, height:8.0, heightR:8, flange:8.0, flangeT:0.44, web:0.29 },
  { id:"Viga 8'' X 35 lb/ft", name:"Viga 8\" × 35 lb/ft", lbsPerFt:35, height:8.12, heightR:8, flange:8.02, flangeT:0.5, web:0.31 },
  { id:"Viga 8'' X 40 lb/ft", name:"Viga 8\" × 40 lb/ft", lbsPerFt:40, height:8.25, heightR:8, flange:8.07, flangeT:0.56, web:0.36 },
  { id:"Viga 9'' X 48 lb/ft", name:"Viga 9\" × 48 lb/ft", lbsPerFt:48, height:8.5, heightR:9, flange:8.11, flangeT:0.69, web:0.4 },
  { id:"Viga 9'' X 58 lb/ft", name:"Viga 9\" × 58 lb/ft", lbsPerFt:58, height:8.74, heightR:9, flange:8.23, flangeT:0.81, web:0.51 },
  { id:"Viga 9'' X 67 lb/ft", name:"Viga 9\" × 67 lb/ft", lbsPerFt:67, height:9.02, heightR:9, flange:8.27, flangeT:0.93, web:0.57 },
  { id:"Viga 10'' X 12 lb/ft", name:"Viga 10\" × 12 lb/ft", lbsPerFt:12, height:9.87, heightR:10, flange:3.96, flangeT:0.21, web:0.19 },
  { id:"Viga 10'' X 15 lb/ft", name:"Viga 10\" × 15 lb/ft", lbsPerFt:15, height:9.99, heightR:10, flange:4.0, flangeT:0.27, web:0.23 },
  { id:"Viga 10'' X 17 lb/ft", name:"Viga 10\" × 17 lb/ft", lbsPerFt:17, height:10.11, heightR:10, flange:4.01, flangeT:0.33, web:0.24 },
  { id:"Viga 10'' X 19 lb/ft", name:"Viga 10\" × 19 lb/ft", lbsPerFt:19, height:10.24, heightR:10, flange:4.02, flangeT:0.4, web:0.25 },
  { id:"Viga 10'' X 22 lb/ft", name:"Viga 10\" × 22 lb/ft", lbsPerFt:22, height:10.17, heightR:10, flange:5.75, flangeT:0.36, web:0.24 },
  { id:"Viga 10'' X 26 lb/ft", name:"Viga 10\" × 26 lb/ft", lbsPerFt:26, height:10.33, heightR:10, flange:5.77, flangeT:0.441, web:0.26 },
  { id:"Viga 10'' X 30 lb/ft", name:"Viga 10\" × 30 lb/ft", lbsPerFt:30, height:10.47, heightR:10, flange:5.81, flangeT:0.511, web:0.3 },
  { id:"Viga 10'' X 33 lb/ft", name:"Viga 10\" × 33 lb/ft", lbsPerFt:33, height:9.73, heightR:10, flange:7.96, flangeT:0.44, web:0.29 },
  { id:"Viga 10'' X 39 lb/ft", name:"Viga 10\" × 39 lb/ft", lbsPerFt:39, height:9.92, heightR:10, flange:7.99, flangeT:0.53, web:0.32 },
  { id:"Viga 10'' X 45 lb/ft", name:"Viga 10\" × 45 lb/ft", lbsPerFt:45, height:10.1, heightR:10, flange:8.02, flangeT:0.62, web:0.35 },
  { id:"Viga 10'' X 49 lb/ft", name:"Viga 10\" × 49 lb/ft", lbsPerFt:49, height:9.98, heightR:10, flange:10.0, flangeT:0.56, web:0.34 },
  { id:"Viga 10'' X 54 lb/ft", name:"Viga 10\" × 54 lb/ft", lbsPerFt:54, height:10.09, heightR:10, flange:10.03, flangeT:0.62, web:0.37 },
  { id:"Viga 10'' X 60 lb/ft", name:"Viga 10\" × 60 lb/ft", lbsPerFt:60, height:10.22, heightR:10, flange:10.08, flangeT:0.68, web:0.42 },
  { id:"Viga 10'' X 68 lb/ft", name:"Viga 10\" × 68 lb/ft", lbsPerFt:68, height:10.4, heightR:10, flange:10.13, flangeT:0.77, web:0.47 },
  { id:"Viga 11'' X 77 lb/ft", name:"Viga 11\" × 77 lb/ft", lbsPerFt:77, height:10.6, heightR:11, flange:10.19, flangeT:0.87, web:0.53 },
  { id:"Viga 11'' X 88 lb/ft", name:"Viga 11\" × 88 lb/ft", lbsPerFt:88, height:10.84, heightR:11, flange:10.26, flangeT:0.99, web:0.61 },
  { id:"Viga 11'' X 100 lb/ft", name:"Viga 11\" × 100 lb/ft", lbsPerFt:100, height:11.1, heightR:11, flange:10.35, flangeT:1.12, web:0.68 },
  { id:"Viga 11'' X 112 lb/ft", name:"Viga 11\" × 112 lb/ft", lbsPerFt:112, height:11.38, heightR:11, flange:10.43, flangeT:1.25, web:0.76 },
  { id:"Viga 12'' X 14 lb/ft", name:"Viga 12\" × 14 lb/ft", lbsPerFt:14, height:11.91, heightR:12, flange:3.97, flangeT:0.23, web:0.2 },
  { id:"Viga 12'' X 16 lb/ft", name:"Viga 12\" × 16 lb/ft", lbsPerFt:16, height:11.99, heightR:12, flange:3.99, flangeT:0.27, web:0.22 },
  { id:"Viga 12'' X 19 lb/ft", name:"Viga 12\" × 19 lb/ft", lbsPerFt:19, height:12.16, heightR:12, flange:4.01, flangeT:0.35, web:0.24 },
  { id:"Viga 12'' X 22 lb/ft", name:"Viga 12\" × 22 lb/ft", lbsPerFt:22, height:12.31, heightR:12, flange:4.03, flangeT:0.43, web:0.26 },
  { id:"Viga 12'' X 26 lb/ft", name:"Viga 12\" × 26 lb/ft", lbsPerFt:26, height:12.22, heightR:12, flange:6.49, flangeT:0.38, web:0.23 },
  { id:"Viga 12'' X 30 lb/ft", name:"Viga 12\" × 30 lb/ft", lbsPerFt:30, height:12.34, heightR:12, flange:6.52, flangeT:0.44, web:0.26 },
  { id:"Viga 13'' X 35 lb/ft", name:"Viga 13\" × 35 lb/ft", lbsPerFt:35, height:12.5, heightR:13, flange:6.56, flangeT:0.52, web:0.3 },
  { id:"Viga 12'' X 40 lb/ft", name:"Viga 12\" × 40 lb/ft", lbsPerFt:40, height:11.94, heightR:12, flange:8.01, flangeT:0.52, web:0.3 },
  { id:"Viga 12'' X 45 lb/ft", name:"Viga 12\" × 45 lb/ft", lbsPerFt:45, height:12.06, heightR:12, flange:8.05, flangeT:0.58, web:0.34 },
  { id:"Viga 12'' X 50 lb/ft", name:"Viga 12\" × 50 lb/ft", lbsPerFt:50, height:12.19, heightR:12, flange:8.08, flangeT:0.64, web:0.37 },
  { id:"Viga 12'' X 58 lb/ft", name:"Viga 12\" × 58 lb/ft", lbsPerFt:58, height:12.19, heightR:12, flange:10.01, flangeT:0.64, web:0.36 },
  { id:"Viga 12'' X 65 lb/ft", name:"Viga 12\" × 65 lb/ft", lbsPerFt:65, height:12.12, heightR:12, flange:12.0, flangeT:0.61, web:0.39 },
  { id:"Viga 12'' X 72 lb/ft", name:"Viga 12\" × 72 lb/ft", lbsPerFt:72, height:12.25, heightR:12, flange:12.04, flangeT:0.67, web:0.43 },
  { id:"Viga 12'' X 79 lb/ft", name:"Viga 12\" × 79 lb/ft", lbsPerFt:79, height:12.38, heightR:12, flange:12.08, flangeT:0.74, web:0.47 },
  { id:"Viga 13'' X 87 lb/ft", name:"Viga 13\" × 87 lb/ft", lbsPerFt:87, height:12.53, heightR:13, flange:12.13, flangeT:0.81, web:0.52 },
  { id:"Viga 13'' X 96 lb/ft", name:"Viga 13\" × 96 lb/ft", lbsPerFt:96, height:12.71, heightR:13, flange:12.16, flangeT:0.9, web:0.55 },
  { id:"Viga 13'' X 106 lb/ft", name:"Viga 13\" × 106 lb/ft", lbsPerFt:106, height:12.89, heightR:13, flange:12.22, flangeT:0.99, web:0.61 },
  { id:"Viga 13'' X 120 lb/ft", name:"Viga 13\" × 120 lb/ft", lbsPerFt:120, height:13.12, heightR:13, flange:12.32, flangeT:1.1, web:0.71 },
  { id:"Viga 13'' X 136 lb/ft", name:"Viga 13\" × 136 lb/ft", lbsPerFt:136, height:13.41, heightR:13, flange:12.4, flangeT:1.25, web:0.79 },
  { id:"Viga 14'' X 152 lb/ft", name:"Viga 14\" × 152 lb/ft", lbsPerFt:152, height:13.71, heightR:14, flange:12.48, flangeT:1.4, web:0.87 },
  { id:"Viga 14'' X 170 lb/ft", name:"Viga 14\" × 170 lb/ft", lbsPerFt:170, height:14.03, heightR:14, flange:12.57, flangeT:1.56, web:0.96 },
  { id:"Viga 14'' X 22 lb/ft", name:"Viga 14\" × 22 lb/ft", lbsPerFt:22, height:13.74, heightR:14, flange:5.0, flangeT:0.34, web:0.23 },
  { id:"Viga 14'' X 26 lb/ft", name:"Viga 14\" × 26 lb/ft", lbsPerFt:26, height:13.91, heightR:14, flange:5.03, flangeT:0.42, web:0.26 },
  { id:"Viga 14'' X 30 lb/ft", name:"Viga 14\" × 30 lb/ft", lbsPerFt:30, height:13.84, heightR:14, flange:6.73, flangeT:0.39, web:0.27 },
  { id:"Viga 14'' X 34 lb/ft", name:"Viga 14\" × 34 lb/ft", lbsPerFt:34, height:13.98, heightR:14, flange:6.75, flangeT:0.46, web:0.29 },
  { id:"Viga 14'' X 38 lb/ft", name:"Viga 14\" × 38 lb/ft", lbsPerFt:38, height:14.1, heightR:14, flange:6.77, flangeT:0.52, web:0.31 },
  { id:"Viga 14'' X 43 lb/ft", name:"Viga 14\" × 43 lb/ft", lbsPerFt:43, height:13.66, heightR:14, flange:8.0, flangeT:0.53, web:0.31 },
  { id:"Viga 14'' X 48 lb/ft", name:"Viga 14\" × 48 lb/ft", lbsPerFt:48, height:13.79, heightR:14, flange:8.03, flangeT:0.6, web:0.34 },
  { id:"Viga 14'' X 53 lb/ft", name:"Viga 14\" × 53 lb/ft", lbsPerFt:53, height:13.92, heightR:14, flange:8.06, flangeT:0.66, web:0.37 },
  { id:"Viga 14'' X 61 lb/ft", name:"Viga 14\" × 61 lb/ft", lbsPerFt:61, height:13.89, heightR:14, flange:10.0, flangeT:0.65, web:0.38 },
  { id:"Viga 14'' X 68 lb/ft", name:"Viga 14\" × 68 lb/ft", lbsPerFt:68, height:14.04, heightR:14, flange:10.04, flangeT:0.72, web:0.42 },
  { id:"Viga 14'' X 74 lb/ft", name:"Viga 14\" × 74 lb/ft", lbsPerFt:74, height:14.17, heightR:14, flange:10.07, flangeT:0.79, web:0.45 },
  { id:"Viga 14'' X 82 lb/ft", name:"Viga 14\" × 82 lb/ft", lbsPerFt:82, height:14.31, heightR:14, flange:10.13, flangeT:0.86, web:0.51 },
  { id:"Viga 14'' X 90 lb/ft", name:"Viga 14\" × 90 lb/ft", lbsPerFt:90, height:14.02, heightR:14, flange:14.52, flangeT:0.71, web:0.44 },
  { id:"Viga 14'' X 99 lb/ft", name:"Viga 14\" × 99 lb/ft", lbsPerFt:99, height:14.16, heightR:14, flange:14.57, flangeT:0.78, web:0.49 },
  { id:"Viga 14'' X 109 lb/ft", name:"Viga 14\" × 109 lb/ft", lbsPerFt:109, height:14.32, heightR:14, flange:14.61, flangeT:0.86, web:0.53 },
  { id:"Viga 14'' X 120 lb/ft", name:"Viga 14\" × 120 lb/ft", lbsPerFt:120, height:14.48, heightR:14, flange:14.67, flangeT:0.94, web:0.59 },
  { id:"Viga 15'' X 132 lb/ft", name:"Viga 15\" × 132 lb/ft", lbsPerFt:132, height:14.66, heightR:15, flange:14.73, flangeT:1.03, web:0.65 },
  { id:"Viga 15'' X 145 lb/ft", name:"Viga 15\" × 145 lb/ft", lbsPerFt:145, height:14.78, heightR:15, flange:15.5, flangeT:1.09, web:0.68 },
  { id:"Viga 15'' X 159 lb/ft", name:"Viga 15\" × 159 lb/ft", lbsPerFt:159, height:14.98, heightR:15, flange:15.57, flangeT:1.19, web:0.75 },
  { id:"Viga 15'' X 176 lb/ft", name:"Viga 15\" × 176 lb/ft", lbsPerFt:176, height:15.22, heightR:15, flange:15.65, flangeT:1.31, web:0.83 },
  { id:"Viga 15'' X 193 lb/ft", name:"Viga 15\" × 193 lb/ft", lbsPerFt:193, height:15.48, heightR:15, flange:15.71, flangeT:1.44, web:0.89 },
  { id:"Viga 16'' X 211 lb/ft", name:"Viga 16\" × 211 lb/ft", lbsPerFt:211, height:15.72, heightR:16, flange:15.8, flangeT:1.56, web:0.98 },
  { id:"Viga 16'' X 233 lb/ft", name:"Viga 16\" × 233 lb/ft", lbsPerFt:233, height:16.04, heightR:16, flange:15.89, flangeT:1.72, web:1.07 },
  { id:"Viga 16'' X 257 lb/ft", name:"Viga 16\" × 257 lb/ft", lbsPerFt:257, height:16.38, heightR:16, flange:15.99, flangeT:1.89, web:1.17 },
  { id:"Viga 17'' X 283 lb/ft", name:"Viga 17\" × 283 lb/ft", lbsPerFt:283, height:16.74, heightR:17, flange:16.11, flangeT:2.07, web:1.29 },
  { id:"Viga 17'' X 311 lb/ft", name:"Viga 17\" × 311 lb/ft", lbsPerFt:311, height:17.12, heightR:17, flange:16.23, flangeT:2.26, web:1.41 },
  { id:"Viga 16'' X 26 lb/ft", name:"Viga 16\" × 26 lb/ft", lbsPerFt:26, height:15.69, heightR:16, flange:5.5, flangeT:0.35, web:0.25 },
  { id:"Viga 16'' X 31 lb/ft", name:"Viga 16\" × 31 lb/ft", lbsPerFt:31, height:15.88, heightR:16, flange:5.53, flangeT:0.44, web:0.28 },
  { id:"Viga 16'' X 36 lb/ft", name:"Viga 16\" × 36 lb/ft", lbsPerFt:36, height:15.86, heightR:16, flange:6.99, flangeT:0.43, web:0.3 },
  { id:"Viga 16'' X 40 lb/ft", name:"Viga 16\" × 40 lb/ft", lbsPerFt:40, height:16.01, heightR:16, flange:7.0, flangeT:0.51, web:0.31 },
  { id:"Viga 16'' X 45 lb/ft", name:"Viga 16\" × 45 lb/ft", lbsPerFt:45, height:16.13, heightR:16, flange:7.04, flangeT:0.57, web:0.35 },
  { id:"Viga 16'' X 50 lb/ft", name:"Viga 16\" × 50 lb/ft", lbsPerFt:50, height:16.26, heightR:16, flange:7.07, flangeT:0.63, web:0.38 },
  { id:"Viga 16'' X 57 lb/ft", name:"Viga 16\" × 57 lb/ft", lbsPerFt:57, height:16.43, heightR:16, flange:7.12, flangeT:0.72, web:0.43 },
  { id:"Viga 16'' X 67 lb/ft", name:"Viga 16\" × 67 lb/ft", lbsPerFt:67, height:16.33, heightR:16, flange:10.24, flangeT:0.67, web:0.4 },
  { id:"Viga 17'' X 77 lb/ft", name:"Viga 17\" × 77 lb/ft", lbsPerFt:77, height:16.52, heightR:17, flange:10.3, flangeT:0.76, web:0.46 },
  { id:"Viga 17'' X 89 lb/ft", name:"Viga 17\" × 89 lb/ft", lbsPerFt:89, height:16.75, heightR:17, flange:10.37, flangeT:0.88, web:0.53 },
  { id:"Viga 17'' X 100 lb/ft", name:"Viga 17\" × 100 lb/ft", lbsPerFt:100, height:16.97, heightR:17, flange:10.43, flangeT:0.99, web:0.59 },
  { id:"Viga 18'' X 35 lb/ft", name:"Viga 18\" × 35 lb/ft", lbsPerFt:35, height:17.7, heightR:18, flange:6.0, flangeT:0.43, web:0.3 },
  { id:"Viga 18'' X 40 lb/ft", name:"Viga 18\" × 40 lb/ft", lbsPerFt:40, height:17.9, heightR:18, flange:6.02, flangeT:0.53, web:0.32 },
  { id:"Viga 18'' X 46 lb/ft", name:"Viga 18\" × 46 lb/ft", lbsPerFt:46, height:18.06, heightR:18, flange:6.06, flangeT:0.61, web:0.36 },
  { id:"Viga 18'' X 50 lb/ft", name:"Viga 18\" × 50 lb/ft", lbsPerFt:50, height:17.99, heightR:18, flange:7.5, flangeT:0.57, web:0.36 },
  { id:"Viga 18'' X 55 lb/ft", name:"Viga 18\" × 55 lb/ft", lbsPerFt:55, height:18.11, heightR:18, flange:7.53, flangeT:0.63, web:0.39 },
  { id:"Viga 18'' X 60 lb/ft", name:"Viga 18\" × 60 lb/ft", lbsPerFt:60, height:18.24, heightR:18, flange:7.56, flangeT:0.7, web:0.42 },
  { id:"Viga 18'' X 65 lb/ft", name:"Viga 18\" × 65 lb/ft", lbsPerFt:65, height:18.35, heightR:18, flange:7.59, flangeT:0.75, web:0.45 },
  { id:"Viga 18'' X 71 lb/ft", name:"Viga 18\" × 71 lb/ft", lbsPerFt:71, height:18.47, heightR:18, flange:7.64, flangeT:0.81, web:0.5 },
  { id:"Viga 18'' X 76 lb/ft", name:"Viga 18\" × 76 lb/ft", lbsPerFt:76, height:18.21, heightR:18, flange:11.04, flangeT:0.68, web:0.43 },
  { id:"Viga 18'' X 86 lb/ft", name:"Viga 18\" × 86 lb/ft", lbsPerFt:86, height:18.39, heightR:18, flange:11.09, flangeT:0.77, web:0.48 },
  { id:"Viga 19'' X 97 lb/ft", name:"Viga 19\" × 97 lb/ft", lbsPerFt:97, height:18.59, heightR:19, flange:11.15, flangeT:0.87, web:0.54 },
  { id:"Viga 19'' X 106 lb/ft", name:"Viga 19\" × 106 lb/ft", lbsPerFt:106, height:18.73, heightR:19, flange:11.2, flangeT:0.94, web:0.59 },
  { id:"Viga 19'' X 119 lb/ft", name:"Viga 19\" × 119 lb/ft", lbsPerFt:119, height:18.97, heightR:19, flange:11.27, flangeT:1.06, web:0.66 },
  { id:"Viga 19'' X 130 lb/ft", name:"Viga 19\" × 130 lb/ft", lbsPerFt:130, height:19.25, heightR:19, flange:11.16, flangeT:1.2, web:0.67 },
  { id:"Viga 19'' X 143 lb/ft", name:"Viga 19\" × 143 lb/ft", lbsPerFt:143, height:19.49, heightR:19, flange:11.22, flangeT:1.32, web:0.73 },
  { id:"Viga 20'' X 158 lb/ft", name:"Viga 20\" × 158 lb/ft", lbsPerFt:158, height:19.72, heightR:20, flange:11.3, flangeT:1.44, web:0.81 },
  { id:"Viga 20'' X 175 lb/ft", name:"Viga 20\" × 175 lb/ft", lbsPerFt:175, height:20.04, heightR:20, flange:11.38, flangeT:1.59, web:0.9 },
  { id:"Viga 21'' X 44 lb/ft", name:"Viga 21\" × 44 lb/ft", lbsPerFt:44, height:20.66, heightR:21, flange:6.5, flangeT:0.45, web:0.35 },
  { id:"Viga 21'' X 50 lb/ft", name:"Viga 21\" × 50 lb/ft", lbsPerFt:50, height:20.83, heightR:21, flange:6.53, flangeT:0.54, web:0.38 },
  { id:"Viga 21'' X 57 lb/ft", name:"Viga 21\" × 57 lb/ft", lbsPerFt:57, height:21.06, heightR:21, flange:6.56, flangeT:0.65, web:0.41 },
  { id:"Viga 21'' X 48 lb/ft", name:"Viga 21\" × 48 lb/ft", lbsPerFt:48, height:20.63, heightR:21, flange:8.15, flangeT:0.43, web:0.35 },
  { id:"Viga 21'' X 62 lb/ft", name:"Viga 21\" × 62 lb/ft", lbsPerFt:62, height:20.99, heightR:21, flange:8.24, flangeT:0.62, web:0.4 },
  { id:"Viga 21'' X 68 lb/ft", name:"Viga 21\" × 68 lb/ft", lbsPerFt:68, height:21.13, heightR:21, flange:8.27, flangeT:0.69, web:0.43 },
  { id:"Viga 21'' X 73 lb/ft", name:"Viga 21\" × 73 lb/ft", lbsPerFt:73, height:21.24, heightR:21, flange:8.3, flangeT:0.74, web:0.46 },
  { id:"Viga 21'' X 83 lb/ft", name:"Viga 21\" × 83 lb/ft", lbsPerFt:83, height:21.43, heightR:21, flange:8.36, flangeT:0.84, web:0.52 },
  { id:"Viga 22'' X 93 lb/ft", name:"Viga 22\" × 93 lb/ft", lbsPerFt:93, height:21.62, heightR:22, flange:8.42, flangeT:0.93, web:0.58 },
  { id:"Viga 21'' X 101 lb/ft", name:"Viga 21\" × 101 lb/ft", lbsPerFt:101, height:21.36, heightR:21, flange:12.29, flangeT:0.8, web:0.5 },
  { id:"Viga 22'' X 111 lb/ft", name:"Viga 22\" × 111 lb/ft", lbsPerFt:111, height:21.51, heightR:22, flange:12.34, flangeT:0.88, web:0.55 },
  { id:"Viga 22'' X 122 lb/ft", name:"Viga 22\" × 122 lb/ft", lbsPerFt:122, height:21.68, heightR:22, flange:12.39, flangeT:0.96, web:0.6 },
  { id:"Viga 22'' X 132 lb/ft", name:"Viga 22\" × 132 lb/ft", lbsPerFt:132, height:21.83, heightR:22, flange:12.44, flangeT:1.04, web:0.65 },
  { id:"Viga 22'' X 147 lb/ft", name:"Viga 22\" × 147 lb/ft", lbsPerFt:147, height:22.06, heightR:22, flange:12.51, flangeT:1.15, web:0.72 },
  { id:"Viga 23'' X 166 lb/ft", name:"Viga 23\" × 166 lb/ft", lbsPerFt:166, height:22.5, heightR:23, flange:12.4, flangeT:1.36, web:0.75 },
  { id:"Viga 24'' X 55 lb/ft", name:"Viga 24\" × 55 lb/ft", lbsPerFt:55, height:23.57, heightR:24, flange:7.01, flangeT:0.51, web:0.4 },
  { id:"Viga 24'' X 62 lb/ft", name:"Viga 24\" × 62 lb/ft", lbsPerFt:62, height:23.74, heightR:24, flange:7.04, flangeT:0.59, web:0.43 },
  { id:"Viga 24'' X 68 lb/ft", name:"Viga 24\" × 68 lb/ft", lbsPerFt:68, height:23.73, heightR:24, flange:8.97, flangeT:0.59, web:0.42 },
  { id:"Viga 24'' X 76 lb/ft", name:"Viga 24\" × 76 lb/ft", lbsPerFt:76, height:23.92, heightR:24, flange:8.99, flangeT:0.68, web:0.44 },
  { id:"Viga 24'' X 84 lb/ft", name:"Viga 24\" × 84 lb/ft", lbsPerFt:84, height:24.1, heightR:24, flange:9.02, flangeT:0.77, web:0.47 },
  { id:"Viga 24'' X 94 lb/ft", name:"Viga 24\" × 94 lb/ft", lbsPerFt:94, height:24.31, heightR:24, flange:9.07, flangeT:0.88, web:0.52 },
  { id:"Viga 25'' X 103 lb/ft", name:"Viga 25\" × 103 lb/ft", lbsPerFt:103, height:24.53, heightR:25, flange:9.0, flangeT:0.98, web:0.55 },
  { id:"Viga 24'' X 104 lb/ft", name:"Viga 24\" × 104 lb/ft", lbsPerFt:104, height:24.06, heightR:24, flange:12.75, flangeT:0.75, web:0.5 },
  { id:"Viga 24'' X 117 lb/ft", name:"Viga 24\" × 117 lb/ft", lbsPerFt:117, height:24.26, heightR:24, flange:12.8, flangeT:0.85, web:0.55 },
  { id:"Viga 24'' X 131 lb/ft", name:"Viga 24\" × 131 lb/ft", lbsPerFt:131, height:24.48, heightR:24, flange:12.86, flangeT:0.96, web:0.61 },
  { id:"Viga 25'' X 146 lb/ft", name:"Viga 25\" × 146 lb/ft", lbsPerFt:146, height:24.74, heightR:25, flange:12.9, flangeT:1.09, web:0.65 },
  { id:"Viga 25'' X 162 lb/ft", name:"Viga 25\" × 162 lb/ft", lbsPerFt:162, height:25.0, heightR:25, flange:12.95, flangeT:1.22, web:0.7 },
  { id:"Viga 25'' X 176 lb/ft", name:"Viga 25\" × 176 lb/ft", lbsPerFt:176, height:25.24, heightR:25, flange:12.89, flangeT:1.34, web:0.75 },
  { id:"Viga 25'' X 192 lb/ft", name:"Viga 25\" × 192 lb/ft", lbsPerFt:192, height:25.47, heightR:25, flange:12.95, flangeT:1.46, web:0.81 },
  { id:"Viga 26'' X 207 lb/ft", name:"Viga 26\" × 207 lb/ft", lbsPerFt:207, height:25.7, heightR:26, flange:13.0, flangeT:1.57, web:0.87 },
  { id:"Viga 27'' X 84 lb/ft", name:"Viga 27\" × 84 lb/ft", lbsPerFt:84, height:26.71, heightR:27, flange:9.96, flangeT:0.64, web:0.46 },
  { id:"Viga 27'' X 94 lb/ft", name:"Viga 27\" × 94 lb/ft", lbsPerFt:94, height:26.92, heightR:27, flange:9.99, flangeT:0.75, web:0.49 },
  { id:"Viga 27'' X 102 lb/ft", name:"Viga 27\" × 102 lb/ft", lbsPerFt:102, height:27.09, heightR:27, flange:10.02, flangeT:0.83, web:0.52 },
  { id:"Viga 27'' X 114 lb/ft", name:"Viga 27\" × 114 lb/ft", lbsPerFt:114, height:27.29, heightR:27, flange:10.07, flangeT:0.93, web:0.57 },
  { id:"Viga 28'' X 129 lb/ft", name:"Viga 28\" × 129 lb/ft", lbsPerFt:129, height:27.63, heightR:28, flange:10.01, flangeT:1.1, web:0.61 },
  { id:"Viga 27'' X 146 lb/ft", name:"Viga 27\" × 146 lb/ft", lbsPerFt:146, height:27.38, heightR:27, flange:13.97, flangeT:0.98, web:0.61 },
  { id:"Viga 28'' X 161 lb/ft", name:"Viga 28\" × 161 lb/ft", lbsPerFt:161, height:27.59, heightR:28, flange:14.02, flangeT:1.08, web:0.66 },
  { id:"Viga 28'' X 178 lb/ft", name:"Viga 28\" × 178 lb/ft", lbsPerFt:178, height:27.79, heightR:28, flange:14.09, flangeT:1.19, web:0.72 },
  { id:"Viga 28'' X 194 lb/ft", name:"Viga 28\" × 194 lb/ft", lbsPerFt:194, height:28.11, heightR:28, flange:14.01, flangeT:1.34, web:0.75 },
  { id:"Viga 30'' X 90 lb/ft", name:"Viga 30\" × 90 lb/ft", lbsPerFt:90, height:29.53, heightR:30, flange:10.4, flangeT:0.61, web:0.47 },
  { id:"Viga 30'' X 99 lb/ft", name:"Viga 30\" × 99 lb/ft", lbsPerFt:99, height:29.65, heightR:30, flange:10.45, flangeT:0.67, web:0.52 },
  { id:"Viga 30'' X 108 lb/ft", name:"Viga 30\" × 108 lb/ft", lbsPerFt:108, height:29.83, heightR:30, flange:10.48, flangeT:0.76, web:0.55 },
  { id:"Viga 30'' X 116 lb/ft", name:"Viga 30\" × 116 lb/ft", lbsPerFt:116, height:30.01, heightR:30, flange:10.5, flangeT:0.85, web:0.57 },
  { id:"Viga 30'' X 124 lb/ft", name:"Viga 30\" × 124 lb/ft", lbsPerFt:124, height:30.17, heightR:30, flange:10.52, flangeT:0.93, web:0.59 },
  { id:"Viga 30'' X 132 lb/ft", name:"Viga 30\" × 132 lb/ft", lbsPerFt:132, height:30.31, heightR:30, flange:10.54, flangeT:1.0, web:0.61 },
  { id:"Viga 31'' X 148 lb/ft", name:"Viga 31\" × 148 lb/ft", lbsPerFt:148, height:30.67, heightR:31, flange:10.48, flangeT:1.18, web:0.65 },
  { id:"Viga 30'' X 173 lb/ft", name:"Viga 30\" × 173 lb/ft", lbsPerFt:173, height:30.43, heightR:30, flange:15.0, flangeT:1.07, web:0.66 },
  { id:"Viga 31'' X 191 lb/ft", name:"Viga 31\" × 191 lb/ft", lbsPerFt:191, height:30.66, heightR:31, flange:15.04, flangeT:1.19, web:0.71 },
  { id:"Viga 31'' X 211 lb/ft", name:"Viga 31\" × 211 lb/ft", lbsPerFt:211, height:30.94, heightR:31, flange:15.12, flangeT:1.31, web:0.78 },
  { id:"Viga 33'' X 118 lb/ft", name:"Viga 33\" × 118 lb/ft", lbsPerFt:118, height:32.86, heightR:33, flange:11.48, flangeT:0.74, web:0.55 },
  { id:"Viga 33'' X 130 lb/ft", name:"Viga 33\" × 130 lb/ft", lbsPerFt:130, height:33.09, heightR:33, flange:11.51, flangeT:0.86, web:0.58 },
  { id:"Viga 33'' X 141 lb/ft", name:"Viga 33\" × 141 lb/ft", lbsPerFt:141, height:33.3, heightR:33, flange:11.54, flangeT:0.96, web:0.61 },
  { id:"Viga 33'' X 152 lb/ft", name:"Viga 33\" × 152 lb/ft", lbsPerFt:152, height:33.49, heightR:33, flange:11.56, flangeT:1.05, web:0.63 },
  { id:"Viga 34'' X 169 lb/ft", name:"Viga 34\" × 169 lb/ft", lbsPerFt:169, height:33.8, heightR:34, flange:11.5, flangeT:1.22, web:0.67 },
  { id:"Viga 34'' X 201 lb/ft", name:"Viga 34\" × 201 lb/ft", lbsPerFt:201, height:33.7, heightR:34, flange:15.71, flangeT:1.15, web:0.72 },
  { id:"Viga 34'' X 221 lb/ft", name:"Viga 34\" × 221 lb/ft", lbsPerFt:221, height:33.9, heightR:34, flange:15.79, flangeT:1.28, web:0.77 },
  { id:"Viga 36'' X 135 lb/ft", name:"Viga 36\" × 135 lb/ft", lbsPerFt:135, height:35.55, heightR:36, flange:11.95, flangeT:0.79, web:0.6 },
  { id:"Viga 36'' X 150 lb/ft", name:"Viga 36\" × 150 lb/ft", lbsPerFt:150, height:35.85, heightR:36, flange:11.98, flangeT:0.94, web:0.63 },
  { id:"Viga 36'' X 160 lb/ft", name:"Viga 36\" × 160 lb/ft", lbsPerFt:160, height:36.01, heightR:36, flange:12.0, flangeT:1.02, web:0.65 },
  { id:"Viga 36'' X 170 lb/ft", name:"Viga 36\" × 170 lb/ft", lbsPerFt:170, height:36.17, heightR:36, flange:12.03, flangeT:1.1, web:0.68 },
  { id:"Viga 36'' X 182 lb/ft", name:"Viga 36\" × 182 lb/ft", lbsPerFt:182, height:36.3, heightR:36, flange:12.09, flangeT:1.18, web:0.72 },
  { id:"Viga 37'' X 210 lb/ft", name:"Viga 37\" × 210 lb/ft", lbsPerFt:210, height:36.69, heightR:37, flange:12.18, flangeT:1.36, web:0.83 },
  { id:"Viga 38'' X 149 lb/ft", name:"Viga 38\" × 149 lb/ft", lbsPerFt:149, height:38.2, heightR:38, flange:11.81, flangeT:0.83, web:0.63 },
  { id:"Viga 39'' X 167 lb/ft", name:"Viga 39\" × 167 lb/ft", lbsPerFt:167, height:38.6, heightR:39, flange:15.75, flangeT:1.02, web:0.65 },
  { id:"Viga 39'' X 183 lb/ft", name:"Viga 39\" × 183 lb/ft", lbsPerFt:183, height:39.0, heightR:39, flange:15.75, flangeT:1.22, web:0.65 },
  { id:"Viga 39'' X 211 lb/ft", name:"Viga 39\" × 211 lb/ft", lbsPerFt:211, height:39.4, heightR:39, flange:15.83, flangeT:1.41, web:0.75 },
  { id:"Viga 43'' X 230 lb/ft", name:"Viga 43\" × 230 lb/ft", lbsPerFt:230, height:42.9, heightR:43, flange:null, flangeT:1.22, web:0.71 },
  { id:"Viga 43'' X 262 lb/ft", name:"Viga 43\" × 262 lb/ft", lbsPerFt:262, height:43.3, heightR:43, flange:null, flangeT:1.42, web:0.79 },
  { id:"Viga 44'' X 290 lb/ft", name:"Viga 44\" × 290 lb/ft", lbsPerFt:290, height:43.6, heightR:44, flange:null, flangeT:1.57, web:0.87 },
];

// ── Pricing constants ─────────────────────────────────────────────────────────
const PRICE_PER_KG_MXN = 40;
const LBS_TO_KG = 0.453592;
const FT_TO_M = 0.3048;
const LENGTH_OPTIONS = [20, 40] as const;
type LengthFt = 20 | 40;

// ── Fractional inch options for web/flange thickness ─────────────────────────
const FRAC_OPTIONS: FractionOption[] = [
  { label: '3/16"', inch: 3/16 },
  { label: '1/4"',  inch: 1/4 },
  { label: '5/16"', inch: 5/16 },
  { label: '3/8"',  inch: 3/8 },
  { label: '7/16"', inch: 7/16 },
  { label: '1/2"',  inch: 1/2 },
  { label: '9/16"', inch: 9/16 },
  { label: '5/8"',  inch: 5/8 },
  { label: '3/4"',  inch: 3/4 },
];

// ── Unit helpers ──────────────────────────────────────────────────────────────
const IN_TO_MM = 25.4;
const CM_TO_MM = 10;

function toInch(val: number, unit: "in" | "cm"): number {
  if (unit === "in") return val;
  return (val * CM_TO_MM) / IN_TO_MM;
}

function fromInch(val: number, unit: "in" | "cm"): number {
  if (unit === "in") return parseFloat(val.toFixed(3));
  return parseFloat(((val * IN_TO_MM) / CM_TO_MM).toFixed(2));
}

// ── Weight & price helpers ────────────────────────────────────────────────────
function calcWeightKg(beam: Beam, lengthFt: number): number {
  // lb/ft × ft = lb; × 0.453592 = kg
  return beam.lbsPerFt * lengthFt * LBS_TO_KG;
}

function calcPriceMXN(weightKg: number): number {
  return weightKg * PRICE_PER_KG_MXN;
}

function fmtPeso(n: number): string {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);
}

// ── Matching logic ────────────────────────────────────────────────────────────
function computeRanges(beams: Beam[]): Ranges {
  const hVals = beams.map(b => b.height);
  const fVals = beams.filter(b => b.flange != null).map(b => b.flange as number);
  const wVals = beams.map(b => b.web);
  const ftVals = beams.map(b => b.flangeT);
  return {
    height: { min: Math.min(...hVals), max: Math.max(...hVals) },
    flange: { min: Math.min(...fVals), max: Math.max(...fVals) },
    web: { min: Math.min(...wVals), max: Math.max(...wVals) },
    flangeT: { min: Math.min(...ftVals), max: Math.max(...ftVals) },
  };
}

function normalize(v: number, min: number, max: number): number {
  return max === min ? 0 : (v - min) / (max - min);
}

function beamDistance(input: SearchInput, beam: Beam, ranges: Ranges): number {
  const dH = normalize(input.height, ranges.height.min, ranges.height.max) -
             normalize(beam.height, ranges.height.min, ranges.height.max);
  const flangeVal = beam.flange ?? (ranges.flange.min + ranges.flange.max) / 2;
  const dF = normalize(input.flange, ranges.flange.min, ranges.flange.max) -
             normalize(flangeVal, ranges.flange.min, ranges.flange.max);
  const dW = input.web != null
    ? normalize(input.web, ranges.web.min, ranges.web.max) - normalize(beam.web, ranges.web.min, ranges.web.max)
    : 0;
  const dFT = input.flangeT != null
    ? normalize(input.flangeT, ranges.flangeT.min, ranges.flangeT.max) - normalize(beam.flangeT, ranges.flangeT.min, ranges.flangeT.max)
    : 0;
  return Math.sqrt(dH*dH*1.5 + dF*dF*1.2 + dW*dW*0.8 + dFT*dFT*0.8);
}

function findClosest(input: SearchInput, beams: Beam[], top = 4): ClosestResult[] {
  const ranges = computeRanges(beams);
  return beams
    .map(b => ({ beam: b, dist: beamDistance(input, b, ranges) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, top);
}

// ── Responsive hook ───────────────────────────────────────────────────────────
function useIsMobile(): boolean {
  const [mobile, setMobile] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 640);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

// ── Beam SVG ──────────────────────────────────────────────────────────────────
function BeamSVG({ heightRatio=0.5, flangeRatio=0.5, webRatio=0.4, flangeTRatio=0.4, size=160 }: BeamSVGProps): JSX.Element {
  const W = size;
  const H = size * 1.15;
  const fw = size * 0.28 + flangeRatio * size * 0.44;
  const bh = size * 0.26 + heightRatio * size * 0.5;
  const wt = Math.max(4, size * 0.028 + webRatio * size * 0.032);
  const ft = Math.max(5, size * 0.032 + flangeTRatio * size * 0.03);
  const cx = W / 2;
  const top = (H - bh) / 2;
  const bot = top + bh;
  const T = "all 0.4s cubic-bezier(.4,0,.2,1)";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ overflow:"visible", display:"block", transition:T }}>
      <defs>
        <linearGradient id="sg4" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#edf0f4"/>
          <stop offset="40%" stopColor="#cdd4dc"/>
          <stop offset="60%" stopColor="#b8c2cc"/>
          <stop offset="100%" stopColor="#8a9aaa"/>
        </linearGradient>
        <linearGradient id="wg4" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#9aaab8"/>
          <stop offset="50%" stopColor="#c8d4de"/>
          <stop offset="100%" stopColor="#9aaab8"/>
        </linearGradient>
        <filter id="sh4"><feDropShadow dx="1" dy="3" stdDeviation="3" floodOpacity="0.13"/></filter>
      </defs>
      <rect x={cx-fw/2} y={top} width={fw} height={ft} fill="url(#sg4)" rx="1.5" filter="url(#sh4)" style={{transition:T}}/>
      <rect x={cx-wt/2} y={top+ft} width={wt} height={bh-ft*2} fill="url(#wg4)" style={{transition:T}}/>
      <rect x={cx-fw/2} y={bot-ft} width={fw} height={ft} fill="url(#sg4)" rx="1.5" filter="url(#sh4)" style={{transition:T}}/>
      <line x1={cx-fw/2-13} y1={top} x2={cx-fw/2-13} y2={bot} stroke="#cbd5e1" strokeWidth="0.7" strokeDasharray="3,2"/>
      <line x1={cx-fw/2-17} y1={top} x2={cx-fw/2-9} y2={top} stroke="#cbd5e1" strokeWidth="0.7"/>
      <line x1={cx-fw/2-17} y1={bot} x2={cx-fw/2-9} y2={bot} stroke="#cbd5e1" strokeWidth="0.7"/>
      <line x1={cx-fw/2} y1={top-12} x2={cx+fw/2} y2={top-12} stroke="#cbd5e1" strokeWidth="0.7" strokeDasharray="3,2"/>
      <line x1={cx-fw/2} y1={top-16} x2={cx-fw/2} y2={top-8} stroke="#cbd5e1" strokeWidth="0.7"/>
      <line x1={cx+fw/2} y1={top-16} x2={cx+fw/2} y2={top-8} stroke="#cbd5e1" strokeWidth="0.7"/>
    </svg>
  );
}

// ── Fraction pill selector ────────────────────────────────────────────────────
function FractionPicker({ label, selectedInch, onSelect, isMobile }: FractionPickerProps): JSX.Element {
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", marginBottom:10, gap:6 }}>
        <label style={{ fontSize:11, fontWeight:500, color:"#94a3b8", letterSpacing:"0.09em", textTransform:"uppercase" }}>{label}</label>
        <span style={{ fontSize:9, fontWeight:500, letterSpacing:"0.07em", textTransform:"uppercase", background:"#f1f5f9", color:"#94a3b8", padding:"2px 6px", borderRadius:4 }}>opcional</span>
      </div>
      <div style={{ display:"flex", gap:7, overflowX:"auto", paddingBottom:4, scrollbarWidth:"none", msOverflowStyle:"none" }}>
        <button type="button" onClick={() => onSelect(null)} style={{ flexShrink:0, padding:isMobile?"9px 14px":"8px 13px", borderRadius:10, border:`1.5px solid ${selectedInch===null?"#0f172a":"#e2e8f0"}`, background:selectedInch===null?"#0f172a":"white", color:selectedInch===null?"white":"#94a3b8", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"'DM Mono', monospace", transition:"all 0.15s", minHeight:isMobile?42:38, minWidth:isMobile?44:40 }}>—</button>
        {FRAC_OPTIONS.map(({ label:fl, inch }) => {
          const active = selectedInch !== null && Math.abs(selectedInch - inch) < 0.001;
          return (
            <button key={fl} type="button" onClick={() => onSelect(inch)} style={{ flexShrink:0, padding:isMobile?"9px 14px":"8px 13px", borderRadius:10, border:`1.5px solid ${active?"#0f172a":"#e2e8f0"}`, background:active?"#0f172a":"white", color:active?"white":"#334155", fontSize:isMobile?14:13, fontWeight:active?500:400, cursor:"pointer", fontFamily:"'DM Mono', monospace", transition:"all 0.15s", letterSpacing:"-0.01em", minHeight:isMobile?42:38, whiteSpace:"nowrap" }}>{fl}</button>
          );
        })}
      </div>
      <div style={{ fontSize:11, color:"#d1d8e0", marginTop:6, paddingLeft:2, fontFamily:"'DM Mono', monospace" }}>
        {selectedInch !== null ? `${selectedInch.toFixed(3)}"` : "Sin seleccionar"}
      </div>
    </div>
  );
}

// ── Price tag component ───────────────────────────────────────────────────────
function PriceTag({ beam, lengthFt, isMobile }: { beam: Beam; lengthFt: LengthFt; isMobile: boolean }): JSX.Element {
  const weightKg = calcWeightKg(beam, lengthFt);
  const priceMXN = calcPriceMXN(weightKg);
  const lengthM = lengthFt * FT_TO_M;

  return (
    <div style={{ background:"linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", border:"1.5px solid #bbf7d0", borderRadius:12, padding:isMobile?"14px 16px":"16px 20px", marginBottom:16 }}>
      <div style={{ fontSize:10, fontWeight:500, color:"#16a34a", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10 }}>
        Precio estimado — {lengthFt}ft ({lengthM.toFixed(1)} m)
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
        <div>
          <div style={{ fontSize:10, color:"#86efac", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:3 }}>Peso total</div>
          <div style={{ fontSize:isMobile?15:16, fontWeight:600, color:"#15803d", fontFamily:"'DM Mono', monospace" }}>
            {weightKg.toFixed(0)} kg
          </div>
        </div>
        <div>
          <div style={{ fontSize:10, color:"#86efac", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:3 }}>Precio/kg</div>
          <div style={{ fontSize:isMobile?15:16, fontWeight:600, color:"#15803d", fontFamily:"'DM Mono', monospace" }}>
            $40 MXN
          </div>
        </div>
        <div>
          <div style={{ fontSize:10, color:"#86efac", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:3 }}>Total c/IVA</div>
          <div style={{ fontSize:isMobile?17:19, fontWeight:700, color:"#15803d", fontFamily:"'DM Mono', monospace" }}>
            {fmtPeso(priceMXN)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App(): JSX.Element {
  const isMobile = useIsMobile();

  const [unit, setUnit] = useState<"in" | "cm">("in");
  const [height, setHeight] = useState<string>("");
  const [flange, setFlange] = useState<string>("");
  const [webInch, setWebInch] = useState<number | null>(null);
  const [flangeTInch, setFlangeTInch] = useState<number | null>(null);
  const [lengthFt, setLengthFt] = useState<LengthFt>(20);

  const [results, setResults] = useState<ClosestResult[]>([]);
  const [searched, setSearched] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [selected, setSelected] = useState<Beam | null>(null);

  const heightInch = height ? toInch(parseFloat(height), unit) : null;
  const flangeInch = flange ? toInch(parseFloat(flange), unit) : null;

  const heightRatio = heightInch ? Math.max(0, Math.min(1, (heightInch - 4) / 40)) : 0.3;
  const flangeRatio = flangeInch ? Math.max(0, Math.min(1, (flangeInch - 3.5) / 13)) : 0.4;
  const webRatio = webInch ? Math.max(0, Math.min(1, (webInch - 0.17) / 1.3)) : 0.4;
  const flangeTRatio = flangeTInch ? Math.max(0, Math.min(1, (flangeTInch - 0.17) / 2.1)) : 0.4;

  const canSearch = !!(height && flange && !loading);

  function handleSearch(): void {
    if (!canSearch || heightInch == null || flangeInch == null) return;
    setLoading(true);
    setSelected(null);
    setTimeout(() => {
      setResults(findClosest({ height: heightInch, flange: flangeInch, web: webInch, flangeT: flangeTInch }, BEAMS, 4));
      setSearched(true);
      setLoading(false);
    }, 420);
  }

  function handleUnitToggle(newUnit: "in" | "cm"): void {
    if (newUnit === unit) return;
    const conv = (val: string): string => {
      const v = parseFloat(val);
      if (isNaN(v)) return "";
      return String(fromInch(toInch(v, unit), newUnit));
    };
    if (height) setHeight(conv(height));
    if (flange) setFlange(conv(flange));
    setUnit(newUnit);
  }

  const dv = (inchVal: number): string => {
    const v = fromInch(inchVal, unit);
    return String(v);
  };
  const beamSize = isMobile ? 128 : 165;

  function fracLabel(inch: number): string {
    let best = FRAC_OPTIONS[0];
    let bestD = Infinity;
    for (const o of FRAC_OPTIONS) {
      const d = Math.abs(o.inch - inch);
      if (d < bestD) { bestD = d; best = o; }
    }
    return bestD < 0.04 ? best.label : `${inch.toFixed(3)}"`;
  }

  const inputStyle = (hasVal: string): CSSProperties => ({
    width:"100%", padding:isMobile?"14px 46px 14px 14px":"12px 46px 12px 14px",
    border:`1.5px solid ${hasVal?"#0f172a":"#e2e8f0"}`, borderRadius:12,
    fontSize:20, fontWeight:300, color:"#0f172a", fontFamily:"'DM Mono', monospace",
    outline:"none", background:"white", WebkitAppearance:"none",
    MozAppearance:"textfield" as CSSProperties["MozAppearance"],
    transition:"border-color 0.2s", display:"block",
  });

  return (
    <div style={{ minHeight:"100vh", background:"#f7f8fa", fontFamily:"'DM Sans', -apple-system, sans-serif", display:"flex", flexDirection:"column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{-webkit-text-size-adjust:100%;}
        input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;}
        input[type=number]{-moz-appearance:textfield;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
        @keyframes spin{to{transform:rotate(360deg);}}
        .rc{animation:fadeUp 0.3s ease both;}
        .sbtn:active{transform:scale(0.98);}
        button,input{-webkit-tap-highlight-color:transparent;}
        *{-webkit-font-smoothing:antialiased;}
        div::-webkit-scrollbar{display:none;}
      `}</style>

      {/* Header */}
      <header style={{ background:"white", borderBottom:"1px solid #eaecf0", padding:isMobile?"14px 18px":"16px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, background:"#0f172a", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
              <rect x="0" y="0" width="16" height="3.5" fill="white" rx="0.6"/>
              <rect x="6.25" y="3.5" width="3.5" height="9" fill="white"/>
              <rect x="0" y="12.5" width="16" height="3.5" fill="white" rx="0.6"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize:15, fontWeight:600, color:"#0f172a", letterSpacing:"-0.02em", lineHeight:1.2 }}>Surtiaceros</div>
            <div style={{ fontSize:10, color:"#94a3b8", letterSpacing:"0.07em", textTransform:"uppercase", fontWeight:500 }}>Identificador de Perfiles</div>
          </div>
        </div>
        {!isMobile && <div style={{ fontSize:12, color:"#94a3b8" }}>{BEAMS.length} perfiles · Mercado Mexicano</div>}
      </header>

      <main style={{ flex:1, padding:isMobile?"28px 16px 60px":"48px 24px 80px", maxWidth:640, width:"100%", margin:"0 auto", display:"flex", flexDirection:"column", gap:isMobile?22:36 }}>

        {/* Title */}
        <div style={{ textAlign:"center" }}>
          <h1 style={{ fontSize:isMobile?27:36, fontWeight:300, color:"#0f172a", letterSpacing:"-0.03em", lineHeight:1.2, marginBottom:10 }}>
            {isMobile ? <>"Encuentra tu perfil<br/>de acero"</> : "Encuentra tu perfil de acero"}
          </h1>
          <p style={{ fontSize:isMobile?14:15, color:"#64748b", lineHeight:1.6, maxWidth:360, margin:"0 auto" }}>
            Ingresa las dimensiones y encontramos el perfil estándar más cercano con peso y precio incluidos.
          </p>
        </div>

        {/* Search card */}
        <div style={{ background:"white", borderRadius:isMobile?18:22, border:"1px solid #e8ecf0", padding:isMobile?"22px 18px 28px":"36px 32px 42px", boxShadow:"0 2px 20px rgba(0,0,0,0.04)", display:"flex", flexDirection:"column", gap:isMobile?22:28 }}>

          {/* Unit toggle */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:11, color:"#cbd5e1", letterSpacing:"0.06em", textTransform:"uppercase" }}>Unidad — altura &amp; patín</span>
            <div style={{ display:"flex", background:"#f1f5f9", borderRadius:10, padding:3, gap:2 }}>
              {(["in","cm"] as const).map(uu => (
                <button key={uu} type="button" onClick={() => handleUnitToggle(uu)} style={{ padding:isMobile?"9px 18px":"6px 16px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:500, letterSpacing:"0.04em", transition:"all 0.15s", background:unit===uu?"white":"transparent", color:unit===uu?"#0f172a":"#94a3b8", boxShadow:unit===uu?"0 1px 4px rgba(0,0,0,0.1)":"none", minWidth:isMobile?50:44, minHeight:isMobile?40:34 }}>{uu}</button>
              ))}
            </div>
          </div>

          {/* SVG preview */}
          <div style={{ display:"flex", justifyContent:"center" }}>
            <BeamSVG heightRatio={heightRatio} flangeRatio={flangeRatio} webRatio={webRatio} flangeTRatio={flangeTRatio} size={beamSize}/>
          </div>

          {/* Height & flange inputs */}
          <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:isMobile?14:16 }}>
            {[
              { label:"Altura / Peralte (h)", val:height, set:setHeight, ph:unit==="in"?'ej. 8"':"ej. 20", hint:unit==="in"?'4" – 44"':"10 – 112 cm" },
              { label:"Ancho de Patín (b)", val:flange, set:setFlange, ph:unit==="in"?'ej. 4"':"ej. 10", hint:unit==="in"?'3.9" – 16.2"':"10 – 41 cm" },
            ].map(({ label, val, set, ph, hint }) => (
              <div key={label}>
                <label style={{ display:"block", fontSize:11, fontWeight:500, color:"#94a3b8", letterSpacing:"0.09em", textTransform:"uppercase", marginBottom:8 }}>
                  {label} <span style={{ color:"#f87171", fontSize:10 }}>*</span>
                </label>
                <div style={{ position:"relative" }}>
                  <input type="number" inputMode="decimal" value={val} onChange={e => set(e.target.value)} onKeyDown={e => e.key==="Enter" && handleSearch()} placeholder={ph} style={inputStyle(val)}
                    onFocus={e => { e.currentTarget.style.borderColor="#0f172a"; }}
                    onBlur={e => { e.currentTarget.style.borderColor=val?"#0f172a":"#e2e8f0"; }}
                  />
                  <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", fontSize:12, color:"#94a3b8", fontFamily:"'DM Mono', monospace", pointerEvents:"none" }}>{unit}</span>
                </div>
                <div style={{ fontSize:11, color:"#d1d8e0", marginTop:5, paddingLeft:2 }}>{hint}</div>
              </div>
            ))}
          </div>

          {/* Thickness pickers */}
          <div style={{ borderTop:"1px dashed #e8ecf0", paddingTop:isMobile?4:6 }}>
            <div style={{ fontSize:11, color:"#cbd5e1", letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:isMobile?16:20 }}>Espesores en pulgadas — opcionales</div>
            <div style={{ display:"flex", flexDirection:"column", gap:isMobile?20:22 }}>
              <FractionPicker label="Espesor de Alma (tw)" selectedInch={webInch} onSelect={setWebInch} isMobile={isMobile}/>
              <FractionPicker label="Espesor de Patín (tf)" selectedInch={flangeTInch} onSelect={setFlangeTInch} isMobile={isMobile}/>
            </div>
          </div>

          {/* Length selector */}
          <div style={{ borderTop:"1px dashed #e8ecf0", paddingTop:isMobile?4:6 }}>
            <div style={{ fontSize:11, color:"#cbd5e1", letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:14 }}>Longitud de viga</div>
            <div style={{ display:"flex", gap:10 }}>
              {LENGTH_OPTIONS.map(ft => {
                const active = lengthFt === ft;
                const m = (ft * FT_TO_M).toFixed(1);
                return (
                  <button key={ft} type="button" onClick={() => setLengthFt(ft)} style={{ flex:1, padding:isMobile?"14px":"12px", borderRadius:12, border:`1.5px solid ${active?"#0f172a":"#e2e8f0"}`, background:active?"#0f172a":"white", color:active?"white":"#475569", fontSize:isMobile?15:14, fontWeight:500, cursor:"pointer", transition:"all 0.15s", display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                    <span style={{ fontSize:isMobile?18:17, fontFamily:"'DM Mono', monospace" }}>{ft} ft</span>
                    <span style={{ fontSize:11, opacity:0.6 }}>{m} m</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ fontSize:11, color:"#cbd5e1", marginTop:-8 }}>
            <span style={{ color:"#f87171" }}>*</span> Altura y Patín son requeridos. Los espesores mejoran la precisión.
          </div>

          {/* Search button */}
          <button type="button" className="sbtn" onClick={handleSearch} disabled={!canSearch} style={{ width:"100%", padding:isMobile?"18px":"15px", background:canSearch?"#0f172a":"#e8ecf0", color:canSearch?"white":"#94a3b8", border:"none", borderRadius:14, fontSize:isMobile?16:15, fontWeight:500, letterSpacing:"0.02em", cursor:canSearch?"pointer":"not-allowed", transition:"all 0.2s", boxShadow:canSearch?"0 4px 18px rgba(15,23,42,0.2)":"none", display:"flex", alignItems:"center", justifyContent:"center", gap:8, minHeight:isMobile?56:50 }}>
            {loading ? (
              <><svg width="16" height="16" viewBox="0 0 16 16" style={{ animation:"spin 0.75s linear infinite", flexShrink:0 }}><circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.25)" strokeWidth="2" fill="none"/><path d="M8 2 A6 6 0 0 1 14 8" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>Buscando...</>
            ) : (
              <><svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink:0 }}><circle cx="6.8" cy="6.8" r="4.3" stroke="currentColor" strokeWidth="1.6"/><path d="M10 10L13 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>Buscar Perfil</>
            )}
          </button>
        </div>

        {/* Results */}
        {searched && !loading && results.length > 0 && (
          <div>
            <div style={{ fontSize:11, fontWeight:500, color:"#94a3b8", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:12, paddingLeft:2 }}>Perfiles más cercanos</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {results.map(({ beam, dist }, i) => {
                const isTop = i === 0;
                const isExp = selected?.id === beam.id;
                const score = Math.max(0, 100 - dist * 200);
                const mLabel = score>90?"Exacto":score>70?"Muy cercano":score>50?"Cercano":"Aproximado";
                const mColor = isTop?"rgba(255,255,255,0.45)":score>90?"#22c55e":score>70?"#3b82f6":score>50?"#f59e0b":"#94a3b8";

                return (
                  <div key={beam.id}>
                    <div className="rc" onClick={() => setSelected(isExp?null:beam)} style={{ animationDelay:`${i*0.06}s`, background:isTop?"#0f172a":"white", border:`1.5px solid ${isTop?"#0f172a":isExp?"#334155":"#e8ecf0"}`, borderRadius:isExp?"14px 14px 0 0":14, padding:isMobile?"15px 16px":"17px 20px", cursor:"pointer", display:"flex", alignItems:"center", gap:12, transition:"border-color 0.2s", userSelect:"none" }}>
                      <div style={{ width:30, height:30, borderRadius:8, flexShrink:0, background:isTop?"rgba(255,255,255,0.1)":"#f1f5f9", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:600, color:isTop?"rgba(255,255,255,0.6)":"#94a3b8" }}>{i+1}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:isMobile?15:17, fontWeight:500, color:isTop?"white":"#0f172a", fontFamily:"'DM Mono', monospace", letterSpacing:"-0.01em" }}>{beam.name}</div>
                        <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:2 }}>
                          <div style={{ width:5, height:5, borderRadius:"50%", background:mColor, flexShrink:0 }}/>
                          <span style={{ fontSize:10, fontWeight:500, letterSpacing:"0.06em", textTransform:"uppercase", color:mColor }}>{mLabel}</span>
                        </div>
                      </div>
                      <div style={{ textAlign:"right", flexShrink:0 }}>
                        <div style={{ fontSize:isMobile?12:13, fontFamily:"'DM Mono', monospace", color:isTop?"rgba(255,255,255,0.6)":"#475569", whiteSpace:"nowrap" }}>
                          {dv(beam.height)} × {beam.flange!=null?dv(beam.flange):"—"} {unit}
                        </div>
                        <div style={{ fontSize:11, color:isTop?"rgba(255,255,255,0.3)":"#94a3b8", marginTop:2 }}>{beam.lbsPerFt} lb/ft</div>
                      </div>
                      <div style={{ color:isTop?"rgba(255,255,255,0.3)":"#cbd5e1", flexShrink:0, transform:isExp?"rotate(90deg)":"none", transition:"transform 0.2s" }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3.5l3.5 3.5L5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>

                    {isExp && (
                      <div style={{ animation:"fadeUp 0.2s ease", background:"white", border:"1.5px solid #334155", borderTop:"1px solid #f1f5f9", borderRadius:"0 0 14px 14px", padding:isMobile?"18px 16px 20px":"22px 20px 24px" }}>
                        <div style={{ fontSize:10, color:"#94a3b8", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:14 }}>Especificaciones — {beam.name}</div>

                        {/* Price tag */}
                        <PriceTag beam={beam} lengthFt={lengthFt} isMobile={isMobile}/>

                        {/* Specs grid */}
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:isMobile?12:16, marginBottom:18 }}>
                          {[
                            ["Altura (h)", `${dv(beam.height)} ${unit}`],
                            ["Patín (b)", beam.flange!=null?`${dv(beam.flange)} ${unit}`:"N/D"],
                            ["Alma (tw)", fracLabel(beam.web)],
                            ["Esp. Patín (tf)", fracLabel(beam.flangeT)],
                            ["Peso lineal", `${beam.lbsPerFt} lb/ft`],
                            ["Peso lineal (kg)", `${(beam.lbsPerFt*LBS_TO_KG).toFixed(2)} kg/m`],
                          ].map(([lbl,val]) => (
                            <div key={lbl}>
                              <div style={{ fontSize:10, color:"#94a3b8", letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:3 }}>{lbl}</div>
                              <div style={{ fontSize:isMobile?13:14, color:"#0f172a", fontFamily:"'DM Mono', monospace" }}>{val}</div>
                            </div>
                          ))}
                        </div>

                        {/* CTA buttons */}
                        <div style={{ display:"flex", flexDirection:isMobile?"column":"row", gap:10 }}>
                          <button type="button" style={{ flex:1, padding:isMobile?"15px":"13px", background:"#0f172a", color:"white", border:"none", borderRadius:10, fontSize:14, fontWeight:500, cursor:"pointer", minHeight:isMobile?50:44 }}>
                            Solicitar cotización
                          </button>
                          <button type="button" style={{ flex:1, padding:isMobile?"15px":"13px", background:"#f0fdf4", color:"#16a34a", border:"1.5px solid #bbf7d0", borderRadius:10, fontSize:14, fontWeight:500, cursor:"pointer", minHeight:isMobile?50:44, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.558 4.121 1.532 5.856L.057 23.882l6.198-1.627A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.667-.52-5.184-1.426l-.371-.22-3.681.965.982-3.588-.242-.38A9.937 9.937 0 0 1 2 12C2 6.478 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                            </svg>
                            WhatsApp
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!searched && (
          <div style={{ textAlign:"center", paddingBottom:8 }}>
            <div style={{ fontSize:12, color:"#d1d8e0" }}>{BEAMS.length} perfiles disponibles · 20 ft y 40 ft</div>
          </div>
        )}
      </main>

      <footer style={{ borderTop:"1px solid #eaecf0", background:"white", padding:isMobile?"14px 18px":"16px 32px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:12, color:"#cbd5e1" }}>© 2025 Surtiaceros</span>
        <span style={{ fontSize:11, color:"#e2e8f0", fontFamily:"'DM Mono', monospace" }}>v2.0</span>
      </footer>
    </div>
  );
}
