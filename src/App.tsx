// ╔══════════════════════════════════════════════════════════════╗
// ║  CONFIGURACIÓN — edita estos valores directamente aquí      ║
// ╠══════════════════════════════════════════════════════════════╣
// ║  PRECIO_POR_KG : precio de venta por kilogramo con IVA      ║
// ║  Para actualizar: cambia el número y haz commit en GitHub   ║
// ╚══════════════════════════════════════════════════════════════╝
const PRICE_PER_KG = 40; // ← CAMBIA ESTE NÚMERO (MXN/kg con IVA)

import { useState, useEffect, type CSSProperties, type JSX } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
type Beam = {
  id: string; name: string; lbsPerFt: number;
  height: number; heightR: number; flange: number | null; flangeT: number; web: number;
};
type SearchInput = { height: number|null; flange: number|null; web: number | null; flangeT: number | null; lbsPerFt: number|null };
type ClosestResult = { beam: Beam; dist: number };
type Ranges = { height:{min:number;max:number}; flange:{min:number;max:number}; web:{min:number;max:number}; flangeT:{min:number;max:number} };
type LengthFt = 20 | 40;

// ── Full Catalog ──────────────────────────────────────────────────────────────
const BEAMS: Beam[] = [
{ id:"v4x13", name:'4" × 13 lb/ft', lbsPerFt:13, height:4.16, heightR:4, flange:4.06, flangeT:0.35, web:0.28 },
{ id:"v5x16", name:'5" × 16 lb/ft', lbsPerFt:16, height:5.01, heightR:5, flange:5.0, flangeT:0.36, web:0.24 },
{ id:"v5x19", name:'5" × 19 lb/ft', lbsPerFt:19, height:5.15, heightR:5, flange:5.03, flangeT:0.43, web:0.27 },
{ id:"v6x8", name:'6" × 8 lb/ft', lbsPerFt:8, height:5.83, heightR:6, flange:3.94, flangeT:0.19, web:0.17 },
{ id:"v6x9", name:'6" × 9 lb/ft', lbsPerFt:9, height:5.9, heightR:6, flange:3.94, flangeT:0.22, web:0.17 },
{ id:"v6x12", name:'6" × 12 lb/ft', lbsPerFt:12, height:6.03, heightR:6, flange:4.0, flangeT:0.28, web:0.23 },
{ id:"v6x16", name:'6" × 16 lb/ft', lbsPerFt:16, height:6.28, heightR:6, flange:4.03, flangeT:0.41, web:0.26 },
{ id:"v6x15", name:'6" × 15 lb/ft', lbsPerFt:15, height:5.99, heightR:6, flange:5.99, flangeT:0.26, web:0.23 },
{ id:"v6x20", name:'6" × 20 lb/ft', lbsPerFt:20, height:6.2, heightR:6, flange:6.02, flangeT:0.37, web:0.26 },
{ id:"v6x25", name:'6" × 25 lb/ft', lbsPerFt:25, height:6.38, heightR:6, flange:6.08, flangeT:0.46, web:0.32 },
{ id:"v8x10", name:'8" × 10 lb/ft', lbsPerFt:10, height:7.89, heightR:8, flange:3.94, flangeT:0.21, web:0.17 },
{ id:"v8x13", name:'8" × 13 lb/ft', lbsPerFt:13, height:7.99, heightR:8, flange:4.0, flangeT:0.26, web:0.23 },
{ id:"v8x15", name:'8" × 15 lb/ft', lbsPerFt:15, height:8.11, heightR:8, flange:4.02, flangeT:0.32, web:0.25 },
{ id:"v8x18", name:'8" × 18 lb/ft', lbsPerFt:18, height:8.14, heightR:8, flange:5.25, flangeT:0.33, web:0.23 },
{ id:"v8x21", name:'8" × 21 lb/ft', lbsPerFt:21, height:8.28, heightR:8, flange:5.27, flangeT:0.4, web:0.25 },
{ id:"v8x24", name:'8" × 24 lb/ft', lbsPerFt:24, height:7.93, heightR:8, flange:6.5, flangeT:0.4, web:0.25 },
{ id:"v8x28", name:'8" × 28 lb/ft', lbsPerFt:28, height:8.06, heightR:8, flange:6.54, flangeT:0.47, web:0.29 },
{ id:"v8x31", name:'8" × 31 lb/ft', lbsPerFt:31, height:8.0, heightR:8, flange:8.0, flangeT:0.44, web:0.29 },
{ id:"v8x35", name:'8" × 35 lb/ft', lbsPerFt:35, height:8.12, heightR:8, flange:8.02, flangeT:0.5, web:0.31 },
{ id:"v8x40", name:'8" × 40 lb/ft', lbsPerFt:40, height:8.25, heightR:8, flange:8.07, flangeT:0.56, web:0.36 },
{ id:"v9x48", name:'9" × 48 lb/ft', lbsPerFt:48, height:8.5, heightR:9, flange:8.11, flangeT:0.69, web:0.4 },
{ id:"v9x58", name:'9" × 58 lb/ft', lbsPerFt:58, height:8.74, heightR:9, flange:8.23, flangeT:0.81, web:0.51 },
{ id:"v9x67", name:'9" × 67 lb/ft', lbsPerFt:67, height:9.02, heightR:9, flange:8.27, flangeT:0.93, web:0.57 },
{ id:"v10x12", name:'10" × 12 lb/ft', lbsPerFt:12, height:9.87, heightR:10, flange:3.96, flangeT:0.21, web:0.19 },
{ id:"v10x15", name:'10" × 15 lb/ft', lbsPerFt:15, height:9.99, heightR:10, flange:4.0, flangeT:0.27, web:0.23 },
{ id:"v10x17", name:'10" × 17 lb/ft', lbsPerFt:17, height:10.11, heightR:10, flange:4.01, flangeT:0.33, web:0.24 },
{ id:"v10x19", name:'10" × 19 lb/ft', lbsPerFt:19, height:10.24, heightR:10, flange:4.02, flangeT:0.4, web:0.25 },
{ id:"v10x22", name:'10" × 22 lb/ft', lbsPerFt:22, height:10.17, heightR:10, flange:5.75, flangeT:0.36, web:0.24 },
{ id:"v10x26", name:'10" × 26 lb/ft', lbsPerFt:26, height:10.33, heightR:10, flange:5.77, flangeT:0.441, web:0.26 },
{ id:"v10x30", name:'10" × 30 lb/ft', lbsPerFt:30, height:10.47, heightR:10, flange:5.81, flangeT:0.511, web:0.3 },
{ id:"v10x33", name:'10" × 33 lb/ft', lbsPerFt:33, height:9.73, heightR:10, flange:7.96, flangeT:0.44, web:0.29 },
{ id:"v10x39", name:'10" × 39 lb/ft', lbsPerFt:39, height:9.92, heightR:10, flange:7.99, flangeT:0.53, web:0.32 },
{ id:"v10x45", name:'10" × 45 lb/ft', lbsPerFt:45, height:10.1, heightR:10, flange:8.02, flangeT:0.62, web:0.35 },
{ id:"v10x49", name:'10" × 49 lb/ft', lbsPerFt:49, height:9.98, heightR:10, flange:10.0, flangeT:0.56, web:0.34 },
{ id:"v10x54", name:'10" × 54 lb/ft', lbsPerFt:54, height:10.09, heightR:10, flange:10.03, flangeT:0.62, web:0.37 },
{ id:"v10x60", name:'10" × 60 lb/ft', lbsPerFt:60, height:10.22, heightR:10, flange:10.08, flangeT:0.68, web:0.42 },
{ id:"v10x68", name:'10" × 68 lb/ft', lbsPerFt:68, height:10.4, heightR:10, flange:10.13, flangeT:0.77, web:0.47 },
{ id:"v11x77", name:'11" × 77 lb/ft', lbsPerFt:77, height:10.6, heightR:11, flange:10.19, flangeT:0.87, web:0.53 },
{ id:"v11x88", name:'11" × 88 lb/ft', lbsPerFt:88, height:10.84, heightR:11, flange:10.26, flangeT:0.99, web:0.61 },
{ id:"v11x100", name:'11" × 100 lb/ft', lbsPerFt:100, height:11.1, heightR:11, flange:10.35, flangeT:1.12, web:0.68 },
{ id:"v11x112", name:'11" × 112 lb/ft', lbsPerFt:112, height:11.38, heightR:11, flange:10.43, flangeT:1.25, web:0.76 },
{ id:"v12x14", name:'12" × 14 lb/ft', lbsPerFt:14, height:11.91, heightR:12, flange:3.97, flangeT:0.23, web:0.2 },
{ id:"v12x16", name:'12" × 16 lb/ft', lbsPerFt:16, height:11.99, heightR:12, flange:3.99, flangeT:0.27, web:0.22 },
{ id:"v12x19", name:'12" × 19 lb/ft', lbsPerFt:19, height:12.16, heightR:12, flange:4.01, flangeT:0.35, web:0.24 },
{ id:"v12x22", name:'12" × 22 lb/ft', lbsPerFt:22, height:12.31, heightR:12, flange:4.03, flangeT:0.43, web:0.26 },
{ id:"v12x26", name:'12" × 26 lb/ft', lbsPerFt:26, height:12.22, heightR:12, flange:6.49, flangeT:0.38, web:0.23 },
{ id:"v12x30", name:'12" × 30 lb/ft', lbsPerFt:30, height:12.34, heightR:12, flange:6.52, flangeT:0.44, web:0.26 },
{ id:"v13x35", name:'13" × 35 lb/ft', lbsPerFt:35, height:12.5, heightR:13, flange:6.56, flangeT:0.52, web:0.3 },
{ id:"v12x40", name:'12" × 40 lb/ft', lbsPerFt:40, height:11.94, heightR:12, flange:8.01, flangeT:0.52, web:0.3 },
{ id:"v12x45", name:'12" × 45 lb/ft', lbsPerFt:45, height:12.06, heightR:12, flange:8.05, flangeT:0.58, web:0.34 },
{ id:"v12x50", name:'12" × 50 lb/ft', lbsPerFt:50, height:12.19, heightR:12, flange:8.08, flangeT:0.64, web:0.37 },
{ id:"v12x58", name:'12" × 58 lb/ft', lbsPerFt:58, height:12.19, heightR:12, flange:10.01, flangeT:0.64, web:0.36 },
{ id:"v12x65", name:'12" × 65 lb/ft', lbsPerFt:65, height:12.12, heightR:12, flange:12.0, flangeT:0.61, web:0.39 },
{ id:"v12x72", name:'12" × 72 lb/ft', lbsPerFt:72, height:12.25, heightR:12, flange:12.04, flangeT:0.67, web:0.43 },
{ id:"v12x79", name:'12" × 79 lb/ft', lbsPerFt:79, height:12.38, heightR:12, flange:12.08, flangeT:0.74, web:0.47 },
{ id:"v13x87", name:'13" × 87 lb/ft', lbsPerFt:87, height:12.53, heightR:13, flange:12.13, flangeT:0.81, web:0.52 },
{ id:"v13x96", name:'13" × 96 lb/ft', lbsPerFt:96, height:12.71, heightR:13, flange:12.16, flangeT:0.9, web:0.55 },
{ id:"v13x106", name:'13" × 106 lb/ft', lbsPerFt:106, height:12.89, heightR:13, flange:12.22, flangeT:0.99, web:0.61 },
{ id:"v13x120", name:'13" × 120 lb/ft', lbsPerFt:120, height:13.12, heightR:13, flange:12.32, flangeT:1.1, web:0.71 },
{ id:"v13x136", name:'13" × 136 lb/ft', lbsPerFt:136, height:13.41, heightR:13, flange:12.4, flangeT:1.25, web:0.79 },
{ id:"v14x152", name:'14" × 152 lb/ft', lbsPerFt:152, height:13.71, heightR:14, flange:12.48, flangeT:1.4, web:0.87 },
{ id:"v14x170", name:'14" × 170 lb/ft', lbsPerFt:170, height:14.03, heightR:14, flange:12.57, flangeT:1.56, web:0.96 },
{ id:"v14x22", name:'14" × 22 lb/ft', lbsPerFt:22, height:13.74, heightR:14, flange:5.0, flangeT:0.34, web:0.23 },
{ id:"v14x26", name:'14" × 26 lb/ft', lbsPerFt:26, height:13.91, heightR:14, flange:5.03, flangeT:0.42, web:0.26 },
{ id:"v14x30", name:'14" × 30 lb/ft', lbsPerFt:30, height:13.84, heightR:14, flange:6.73, flangeT:0.39, web:0.27 },
{ id:"v14x34", name:'14" × 34 lb/ft', lbsPerFt:34, height:13.98, heightR:14, flange:6.75, flangeT:0.46, web:0.29 },
{ id:"v14x38", name:'14" × 38 lb/ft', lbsPerFt:38, height:14.1, heightR:14, flange:6.77, flangeT:0.52, web:0.31 },
{ id:"v14x43", name:'14" × 43 lb/ft', lbsPerFt:43, height:13.66, heightR:14, flange:8.0, flangeT:0.53, web:0.31 },
{ id:"v14x48", name:'14" × 48 lb/ft', lbsPerFt:48, height:13.79, heightR:14, flange:8.03, flangeT:0.6, web:0.34 },
{ id:"v14x53", name:'14" × 53 lb/ft', lbsPerFt:53, height:13.92, heightR:14, flange:8.06, flangeT:0.66, web:0.37 },
{ id:"v14x61", name:'14" × 61 lb/ft', lbsPerFt:61, height:13.89, heightR:14, flange:10.0, flangeT:0.65, web:0.38 },
{ id:"v14x68", name:'14" × 68 lb/ft', lbsPerFt:68, height:14.04, heightR:14, flange:10.04, flangeT:0.72, web:0.42 },
{ id:"v14x74", name:'14" × 74 lb/ft', lbsPerFt:74, height:14.17, heightR:14, flange:10.07, flangeT:0.79, web:0.45 },
{ id:"v14x82", name:'14" × 82 lb/ft', lbsPerFt:82, height:14.31, heightR:14, flange:10.13, flangeT:0.86, web:0.51 },
{ id:"v14x90", name:'14" × 90 lb/ft', lbsPerFt:90, height:14.02, heightR:14, flange:14.52, flangeT:0.71, web:0.44 },
{ id:"v14x99", name:'14" × 99 lb/ft', lbsPerFt:99, height:14.16, heightR:14, flange:14.57, flangeT:0.78, web:0.49 },
{ id:"v14x109", name:'14" × 109 lb/ft', lbsPerFt:109, height:14.32, heightR:14, flange:14.61, flangeT:0.86, web:0.53 },
{ id:"v14x120", name:'14" × 120 lb/ft', lbsPerFt:120, height:14.48, heightR:14, flange:14.67, flangeT:0.94, web:0.59 },
{ id:"v15x132", name:'15" × 132 lb/ft', lbsPerFt:132, height:14.66, heightR:15, flange:14.73, flangeT:1.03, web:0.65 },
{ id:"v15x145", name:'15" × 145 lb/ft', lbsPerFt:145, height:14.78, heightR:15, flange:15.5, flangeT:1.09, web:0.68 },
{ id:"v15x159", name:'15" × 159 lb/ft', lbsPerFt:159, height:14.98, heightR:15, flange:15.57, flangeT:1.19, web:0.75 },
{ id:"v15x176", name:'15" × 176 lb/ft', lbsPerFt:176, height:15.22, heightR:15, flange:15.65, flangeT:1.31, web:0.83 },
{ id:"v15x193", name:'15" × 193 lb/ft', lbsPerFt:193, height:15.48, heightR:15, flange:15.71, flangeT:1.44, web:0.89 },
{ id:"v16x211", name:'16" × 211 lb/ft', lbsPerFt:211, height:15.72, heightR:16, flange:15.8, flangeT:1.56, web:0.98 },
{ id:"v16x233", name:'16" × 233 lb/ft', lbsPerFt:233, height:16.04, heightR:16, flange:15.89, flangeT:1.72, web:1.07 },
{ id:"v16x257", name:'16" × 257 lb/ft', lbsPerFt:257, height:16.38, heightR:16, flange:15.99, flangeT:1.89, web:1.17 },
{ id:"v17x283", name:'17" × 283 lb/ft', lbsPerFt:283, height:16.74, heightR:17, flange:16.11, flangeT:2.07, web:1.29 },
{ id:"v17x311", name:'17" × 311 lb/ft', lbsPerFt:311, height:17.12, heightR:17, flange:16.23, flangeT:2.26, web:1.41 },
{ id:"v16x26", name:'16" × 26 lb/ft', lbsPerFt:26, height:15.69, heightR:16, flange:5.5, flangeT:0.35, web:0.25 },
{ id:"v16x31", name:'16" × 31 lb/ft', lbsPerFt:31, height:15.88, heightR:16, flange:5.53, flangeT:0.44, web:0.28 },
{ id:"v16x36", name:'16" × 36 lb/ft', lbsPerFt:36, height:15.86, heightR:16, flange:6.99, flangeT:0.43, web:0.3 },
{ id:"v16x40", name:'16" × 40 lb/ft', lbsPerFt:40, height:16.01, heightR:16, flange:7.0, flangeT:0.51, web:0.31 },
{ id:"v16x45", name:'16" × 45 lb/ft', lbsPerFt:45, height:16.13, heightR:16, flange:7.04, flangeT:0.57, web:0.35 },
{ id:"v16x50", name:'16" × 50 lb/ft', lbsPerFt:50, height:16.26, heightR:16, flange:7.07, flangeT:0.63, web:0.38 },
{ id:"v16x57", name:'16" × 57 lb/ft', lbsPerFt:57, height:16.43, heightR:16, flange:7.12, flangeT:0.72, web:0.43 },
{ id:"v16x67", name:'16" × 67 lb/ft', lbsPerFt:67, height:16.33, heightR:16, flange:10.24, flangeT:0.67, web:0.4 },
{ id:"v17x77", name:'17" × 77 lb/ft', lbsPerFt:77, height:16.52, heightR:17, flange:10.3, flangeT:0.76, web:0.46 },
{ id:"v17x89", name:'17" × 89 lb/ft', lbsPerFt:89, height:16.75, heightR:17, flange:10.37, flangeT:0.88, web:0.53 },
{ id:"v17x100", name:'17" × 100 lb/ft', lbsPerFt:100, height:16.97, heightR:17, flange:10.43, flangeT:0.99, web:0.59 },
{ id:"v18x35", name:'18" × 35 lb/ft', lbsPerFt:35, height:17.7, heightR:18, flange:6.0, flangeT:0.43, web:0.3 },
{ id:"v18x40", name:'18" × 40 lb/ft', lbsPerFt:40, height:17.9, heightR:18, flange:6.02, flangeT:0.53, web:0.32 },
{ id:"v18x46", name:'18" × 46 lb/ft', lbsPerFt:46, height:18.06, heightR:18, flange:6.06, flangeT:0.61, web:0.36 },
{ id:"v18x50", name:'18" × 50 lb/ft', lbsPerFt:50, height:17.99, heightR:18, flange:7.5, flangeT:0.57, web:0.36 },
{ id:"v18x55", name:'18" × 55 lb/ft', lbsPerFt:55, height:18.11, heightR:18, flange:7.53, flangeT:0.63, web:0.39 },
{ id:"v18x60", name:'18" × 60 lb/ft', lbsPerFt:60, height:18.24, heightR:18, flange:7.56, flangeT:0.7, web:0.42 },
{ id:"v18x65", name:'18" × 65 lb/ft', lbsPerFt:65, height:18.35, heightR:18, flange:7.59, flangeT:0.75, web:0.45 },
{ id:"v18x71", name:'18" × 71 lb/ft', lbsPerFt:71, height:18.47, heightR:18, flange:7.64, flangeT:0.81, web:0.5 },
{ id:"v18x76", name:'18" × 76 lb/ft', lbsPerFt:76, height:18.21, heightR:18, flange:11.04, flangeT:0.68, web:0.43 },
{ id:"v18x86", name:'18" × 86 lb/ft', lbsPerFt:86, height:18.39, heightR:18, flange:11.09, flangeT:0.77, web:0.48 },
{ id:"v19x97", name:'19" × 97 lb/ft', lbsPerFt:97, height:18.59, heightR:19, flange:11.15, flangeT:0.87, web:0.54 },
{ id:"v19x106", name:'19" × 106 lb/ft', lbsPerFt:106, height:18.73, heightR:19, flange:11.2, flangeT:0.94, web:0.59 },
{ id:"v19x119", name:'19" × 119 lb/ft', lbsPerFt:119, height:18.97, heightR:19, flange:11.27, flangeT:1.06, web:0.66 },
{ id:"v19x130", name:'19" × 130 lb/ft', lbsPerFt:130, height:19.25, heightR:19, flange:11.16, flangeT:1.2, web:0.67 },
{ id:"v19x143", name:'19" × 143 lb/ft', lbsPerFt:143, height:19.49, heightR:19, flange:11.22, flangeT:1.32, web:0.73 },
{ id:"v20x158", name:'20" × 158 lb/ft', lbsPerFt:158, height:19.72, heightR:20, flange:11.3, flangeT:1.44, web:0.81 },
{ id:"v20x175", name:'20" × 175 lb/ft', lbsPerFt:175, height:20.04, heightR:20, flange:11.38, flangeT:1.59, web:0.9 },
{ id:"v21x44", name:'21" × 44 lb/ft', lbsPerFt:44, height:20.66, heightR:21, flange:6.5, flangeT:0.45, web:0.35 },
{ id:"v21x50", name:'21" × 50 lb/ft', lbsPerFt:50, height:20.83, heightR:21, flange:6.53, flangeT:0.54, web:0.38 },
{ id:"v21x57", name:'21" × 57 lb/ft', lbsPerFt:57, height:21.06, heightR:21, flange:6.56, flangeT:0.65, web:0.41 },
{ id:"v21x48", name:'21" × 48 lb/ft', lbsPerFt:48, height:20.63, heightR:21, flange:8.15, flangeT:0.43, web:0.35 },
{ id:"v21x62", name:'21" × 62 lb/ft', lbsPerFt:62, height:20.99, heightR:21, flange:8.24, flangeT:0.62, web:0.4 },
{ id:"v21x68", name:'21" × 68 lb/ft', lbsPerFt:68, height:21.13, heightR:21, flange:8.27, flangeT:0.69, web:0.43 },
{ id:"v21x73", name:'21" × 73 lb/ft', lbsPerFt:73, height:21.24, heightR:21, flange:8.3, flangeT:0.74, web:0.46 },
{ id:"v21x83", name:'21" × 83 lb/ft', lbsPerFt:83, height:21.43, heightR:21, flange:8.36, flangeT:0.84, web:0.52 },
{ id:"v22x93", name:'22" × 93 lb/ft', lbsPerFt:93, height:21.62, heightR:22, flange:8.42, flangeT:0.93, web:0.58 },
{ id:"v21x101", name:'21" × 101 lb/ft', lbsPerFt:101, height:21.36, heightR:21, flange:12.29, flangeT:0.8, web:0.5 },
{ id:"v22x111", name:'22" × 111 lb/ft', lbsPerFt:111, height:21.51, heightR:22, flange:12.34, flangeT:0.88, web:0.55 },
{ id:"v22x122", name:'22" × 122 lb/ft', lbsPerFt:122, height:21.68, heightR:22, flange:12.39, flangeT:0.96, web:0.6 },
{ id:"v22x132", name:'22" × 132 lb/ft', lbsPerFt:132, height:21.83, heightR:22, flange:12.44, flangeT:1.04, web:0.65 },
{ id:"v22x147", name:'22" × 147 lb/ft', lbsPerFt:147, height:22.06, heightR:22, flange:12.51, flangeT:1.15, web:0.72 },
{ id:"v23x166", name:'23" × 166 lb/ft', lbsPerFt:166, height:22.5, heightR:23, flange:12.4, flangeT:1.36, web:0.75 },
{ id:"v24x55", name:'24" × 55 lb/ft', lbsPerFt:55, height:23.57, heightR:24, flange:7.01, flangeT:0.51, web:0.4 },
{ id:"v24x62", name:'24" × 62 lb/ft', lbsPerFt:62, height:23.74, heightR:24, flange:7.04, flangeT:0.59, web:0.43 },
{ id:"v24x68", name:'24" × 68 lb/ft', lbsPerFt:68, height:23.73, heightR:24, flange:8.97, flangeT:0.59, web:0.42 },
{ id:"v24x76", name:'24" × 76 lb/ft', lbsPerFt:76, height:23.92, heightR:24, flange:8.99, flangeT:0.68, web:0.44 },
{ id:"v24x84", name:'24" × 84 lb/ft', lbsPerFt:84, height:24.1, heightR:24, flange:9.02, flangeT:0.77, web:0.47 },
{ id:"v24x94", name:'24" × 94 lb/ft', lbsPerFt:94, height:24.31, heightR:24, flange:9.07, flangeT:0.88, web:0.52 },
{ id:"v25x103", name:'25" × 103 lb/ft', lbsPerFt:103, height:24.53, heightR:25, flange:9.0, flangeT:0.98, web:0.55 },
{ id:"v24x104", name:'24" × 104 lb/ft', lbsPerFt:104, height:24.06, heightR:24, flange:12.75, flangeT:0.75, web:0.5 },
{ id:"v24x117", name:'24" × 117 lb/ft', lbsPerFt:117, height:24.26, heightR:24, flange:12.8, flangeT:0.85, web:0.55 },
{ id:"v24x131", name:'24" × 131 lb/ft', lbsPerFt:131, height:24.48, heightR:24, flange:12.86, flangeT:0.96, web:0.61 },
{ id:"v25x146", name:'25" × 146 lb/ft', lbsPerFt:146, height:24.74, heightR:25, flange:12.9, flangeT:1.09, web:0.65 },
{ id:"v25x162", name:'25" × 162 lb/ft', lbsPerFt:162, height:25.0, heightR:25, flange:12.95, flangeT:1.22, web:0.7 },
{ id:"v25x176", name:'25" × 176 lb/ft', lbsPerFt:176, height:25.24, heightR:25, flange:12.89, flangeT:1.34, web:0.75 },
{ id:"v25x192", name:'25" × 192 lb/ft', lbsPerFt:192, height:25.47, heightR:25, flange:12.95, flangeT:1.46, web:0.81 },
{ id:"v26x207", name:'26" × 207 lb/ft', lbsPerFt:207, height:25.7, heightR:26, flange:13.0, flangeT:1.57, web:0.87 },
{ id:"v27x84", name:'27" × 84 lb/ft', lbsPerFt:84, height:26.71, heightR:27, flange:9.96, flangeT:0.64, web:0.46 },
{ id:"v27x94", name:'27" × 94 lb/ft', lbsPerFt:94, height:26.92, heightR:27, flange:9.99, flangeT:0.75, web:0.49 },
{ id:"v27x102", name:'27" × 102 lb/ft', lbsPerFt:102, height:27.09, heightR:27, flange:10.02, flangeT:0.83, web:0.52 },
{ id:"v27x114", name:'27" × 114 lb/ft', lbsPerFt:114, height:27.29, heightR:27, flange:10.07, flangeT:0.93, web:0.57 },
{ id:"v28x129", name:'28" × 129 lb/ft', lbsPerFt:129, height:27.63, heightR:28, flange:10.01, flangeT:1.1, web:0.61 },
{ id:"v27x146", name:'27" × 146 lb/ft', lbsPerFt:146, height:27.38, heightR:27, flange:13.97, flangeT:0.98, web:0.61 },
{ id:"v28x161", name:'28" × 161 lb/ft', lbsPerFt:161, height:27.59, heightR:28, flange:14.02, flangeT:1.08, web:0.66 },
{ id:"v28x178", name:'28" × 178 lb/ft', lbsPerFt:178, height:27.79, heightR:28, flange:14.09, flangeT:1.19, web:0.72 },
{ id:"v28x194", name:'28" × 194 lb/ft', lbsPerFt:194, height:28.11, heightR:28, flange:14.01, flangeT:1.34, web:0.75 },
{ id:"v30x90", name:'30" × 90 lb/ft', lbsPerFt:90, height:29.53, heightR:30, flange:10.4, flangeT:0.61, web:0.47 },
{ id:"v30x99", name:'30" × 99 lb/ft', lbsPerFt:99, height:29.65, heightR:30, flange:10.45, flangeT:0.67, web:0.52 },
{ id:"v30x108", name:'30" × 108 lb/ft', lbsPerFt:108, height:29.83, heightR:30, flange:10.48, flangeT:0.76, web:0.55 },
{ id:"v30x116", name:'30" × 116 lb/ft', lbsPerFt:116, height:30.01, heightR:30, flange:10.5, flangeT:0.85, web:0.57 },
{ id:"v30x124", name:'30" × 124 lb/ft', lbsPerFt:124, height:30.17, heightR:30, flange:10.52, flangeT:0.93, web:0.59 },
{ id:"v30x132", name:'30" × 132 lb/ft', lbsPerFt:132, height:30.31, heightR:30, flange:10.54, flangeT:1.0, web:0.61 },
{ id:"v31x148", name:'31" × 148 lb/ft', lbsPerFt:148, height:30.67, heightR:31, flange:10.48, flangeT:1.18, web:0.65 },
{ id:"v30x173", name:'30" × 173 lb/ft', lbsPerFt:173, height:30.43, heightR:30, flange:15.0, flangeT:1.07, web:0.66 },
{ id:"v31x191", name:'31" × 191 lb/ft', lbsPerFt:191, height:30.66, heightR:31, flange:15.04, flangeT:1.19, web:0.71 },
{ id:"v31x211", name:'31" × 211 lb/ft', lbsPerFt:211, height:30.94, heightR:31, flange:15.12, flangeT:1.31, web:0.78 },
{ id:"v33x118", name:'33" × 118 lb/ft', lbsPerFt:118, height:32.86, heightR:33, flange:11.48, flangeT:0.74, web:0.55 },
{ id:"v33x130", name:'33" × 130 lb/ft', lbsPerFt:130, height:33.09, heightR:33, flange:11.51, flangeT:0.86, web:0.58 },
{ id:"v33x141", name:'33" × 141 lb/ft', lbsPerFt:141, height:33.3, heightR:33, flange:11.54, flangeT:0.96, web:0.61 },
{ id:"v33x152", name:'33" × 152 lb/ft', lbsPerFt:152, height:33.49, heightR:33, flange:11.56, flangeT:1.05, web:0.63 },
{ id:"v34x169", name:'34" × 169 lb/ft', lbsPerFt:169, height:33.8, heightR:34, flange:11.5, flangeT:1.22, web:0.67 },
{ id:"v34x201", name:'34" × 201 lb/ft', lbsPerFt:201, height:33.7, heightR:34, flange:15.71, flangeT:1.15, web:0.72 },
{ id:"v34x221", name:'34" × 221 lb/ft', lbsPerFt:221, height:33.9, heightR:34, flange:15.79, flangeT:1.28, web:0.77 },
{ id:"v36x135", name:'36" × 135 lb/ft', lbsPerFt:135, height:35.55, heightR:36, flange:11.95, flangeT:0.79, web:0.6 },
{ id:"v36x150", name:'36" × 150 lb/ft', lbsPerFt:150, height:35.85, heightR:36, flange:11.98, flangeT:0.94, web:0.63 },
{ id:"v36x160", name:'36" × 160 lb/ft', lbsPerFt:160, height:36.01, heightR:36, flange:12.0, flangeT:1.02, web:0.65 },
{ id:"v36x170", name:'36" × 170 lb/ft', lbsPerFt:170, height:36.17, heightR:36, flange:12.03, flangeT:1.1, web:0.68 },
{ id:"v36x182", name:'36" × 182 lb/ft', lbsPerFt:182, height:36.3, heightR:36, flange:12.09, flangeT:1.18, web:0.72 },
{ id:"v37x210", name:'37" × 210 lb/ft', lbsPerFt:210, height:36.69, heightR:37, flange:12.18, flangeT:1.36, web:0.83 },
{ id:"v38x149", name:'38" × 149 lb/ft', lbsPerFt:149, height:38.2, heightR:38, flange:11.81, flangeT:0.83, web:0.63 },
{ id:"v39x167", name:'39" × 167 lb/ft', lbsPerFt:167, height:38.6, heightR:39, flange:15.75, flangeT:1.02, web:0.65 },
{ id:"v39x183", name:'39" × 183 lb/ft', lbsPerFt:183, height:39.0, heightR:39, flange:15.75, flangeT:1.22, web:0.65 },
{ id:"v39x211", name:'39" × 211 lb/ft', lbsPerFt:211, height:39.4, heightR:39, flange:15.83, flangeT:1.41, web:0.75 },
{ id:"v43x230", name:'43" × 230 lb/ft', lbsPerFt:230, height:42.9, heightR:43, flange:null, flangeT:1.22, web:0.71 },
{ id:"v43x262", name:'43" × 262 lb/ft', lbsPerFt:262, height:43.3, heightR:43, flange:null, flangeT:1.42, web:0.79 },
{ id:"v44x290", name:'44" × 290 lb/ft', lbsPerFt:290, height:43.6, heightR:44, flange:null, flangeT:1.57, web:0.87 },
];

// ╔══════════════════════════════════════════════════════════════╗
// ║  CONFIGURACIÓN — edita estos valores directamente aquí      ║
// ╠══════════════════════════════════════════════════════════════╣
// ║  PRECIO_POR_KG : precio de venta por kilogramo con IVA      ║
// ║  Para actualizar: cambia el número y haz commit en GitHub   ║
// ╚══════════════════════════════════════════════════════════════╝
const LBS_TO_KG = 0.453592;
const FT_TO_M = 0.3048;
const LENGTH_OPTIONS: LengthFt[] = [20, 40];

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtPeso(n: number): string {
  return new Intl.NumberFormat("es-MX", { style:"currency", currency:"MXN", maximumFractionDigits:0 }).format(n);
}
const FULL_FRACS: {label:string; inch:number}[] = [
  {label:'1/16"', inch:1/16}, {label:'1/8"', inch:1/8}, {label:'3/16"', inch:3/16},
  {label:'1/4"', inch:1/4}, {label:'5/16"', inch:5/16}, {label:'3/8"', inch:3/8},
  {label:'7/16"', inch:7/16}, {label:'1/2"', inch:1/2}, {label:'9/16"', inch:9/16},
  {label:'5/8"', inch:5/8}, {label:'3/4"', inch:3/4}, {label:'7/8"', inch:7/8},
];
function nearestFrac(inch: number): string {
  const whole = Math.floor(inch);
  const remainder = inch - whole;
  let bestLabel = "";
  let bestD = Infinity;
  for (const f of FULL_FRACS) {
    const d = Math.abs(f.inch - remainder);
    if (d < bestD) { bestD = d; bestLabel = f.label; }
  }
  const dToNext = Math.abs(1 - remainder);
  if (dToNext < bestD) return `${whole + 1}"`;
  if (remainder < 0.01) return whole > 0 ? `${whole}"` : bestLabel;
  if (whole === 0) return bestLabel;
  const frac = bestLabel.replace('"', '');
  return `${whole}-${frac}"`;
}

// ── Matching ──────────────────────────────────────────────────────────────────
function computeRanges(beams: Beam[]): Ranges {
  const hv = beams.map(b => b.height), fv = beams.filter(b=>b.flange).map(b=>b.flange as number);
  const wv = beams.map(b=>b.web), ftv = beams.map(b=>b.flangeT);
  return { height:{min:Math.min(...hv),max:Math.max(...hv)}, flange:{min:Math.min(...fv),max:Math.max(...fv)}, web:{min:Math.min(...wv),max:Math.max(...wv)}, flangeT:{min:Math.min(...ftv),max:Math.max(...ftv)} };
}
function norm(v:number,min:number,max:number){ return max===min?0:(v-min)/(max-min); }
function findClosest(input: SearchInput, top=4): ClosestResult[] {
  const r = computeRanges(BEAMS);
  const lbsMin = Math.min(...BEAMS.map(b=>b.lbsPerFt));
  const lbsMax = Math.max(...BEAMS.map(b=>b.lbsPerFt));
  return BEAMS.map(b => {
    const fv = b.flange ?? (r.flange.min+r.flange.max)/2;
    const dH = input.height!=null ? norm(input.height,r.height.min,r.height.max)-norm(b.height,r.height.min,r.height.max) : 0;
    const dF = input.flange!=null ? norm(input.flange,r.flange.min,r.flange.max)-norm(fv,r.flange.min,r.flange.max) : 0;
    const dW = input.web!=null ? norm(input.web,r.web.min,r.web.max)-norm(b.web,r.web.min,r.web.max) : 0;
    const dT = input.flangeT!=null ? norm(input.flangeT,r.flangeT.min,r.flangeT.max)-norm(b.flangeT,r.flangeT.min,r.flangeT.max) : 0;
    const dL = input.lbsPerFt!=null ? norm(input.lbsPerFt,lbsMin,lbsMax)-norm(b.lbsPerFt,lbsMin,lbsMax) : 0;
    return { beam:b, dist:Math.sqrt(dH*dH*1.5+dF*dF*1.2+dW*dW*0.8+dT*dT*0.8+dL*dL*1.3) };
  }).sort((a,b)=>a.dist-b.dist).slice(0,top);
}

// ── Hook ──────────────────────────────────────────────────────────────────────
function useIsMobile(): boolean {
  const [m, setM] = useState(typeof window!=="undefined"?window.innerWidth<640:false);
  useEffect(() => { const c=()=>setM(window.innerWidth<640); window.addEventListener("resize",c); return ()=>window.removeEventListener("resize",c); },[]);
  return m;
}

// ── Prevent pinch-zoom ────────────────────────────────────────────────────────
function usePreventZoom(): void {
  useEffect(() => {
    let meta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
    if (!meta) { meta = document.createElement('meta'); meta.name = 'viewport'; document.head.appendChild(meta); }
    meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
    const preventZoom = (e: TouchEvent) => { if (e.touches.length > 1) e.preventDefault(); };
    const preventWheel = (e: WheelEvent) => { if (e.ctrlKey) e.preventDefault(); };
    document.addEventListener('touchstart', preventZoom, { passive: false });
    document.addEventListener('wheel', preventWheel, { passive: false });
    return () => { document.removeEventListener('touchstart', preventZoom); document.removeEventListener('wheel', preventWheel); };
  }, []);
}

// ── Beam SVG ──────────────────────────────────────────────────────────────────
function BeamSVG({ hR=0.5, fR=0.5, wR=0.4, ftR=0.4, size=200, heightInch=null, flangeInch=null, webInch=null, flangeTInch=null }: {
  hR?:number; fR?:number; wR?:number; ftR?:number; size?:number;
  heightInch?: number | null; flangeInch?: number | null;
  webInch?: number | null; flangeTInch?: number | null;
}): JSX.Element {
  const INCH_MIN = 3.5, INCH_MAX = 44;
  const pixMin = size * 0.18, pixMax = size * 0.80;
  const inchToPx = (v: number) => pixMin + ((v - INCH_MIN) / (INCH_MAX - INCH_MIN)) * (pixMax - pixMin);
  const fw = heightInch != null && flangeInch != null ? inchToPx(flangeInch) : pixMin + fR * (pixMax - pixMin);
  const bh = heightInch != null ? inchToPx(heightInch) : pixMin + hR * (pixMax - pixMin);
  const wt = Math.max(4, size * 0.018 + wR * size * 0.05);
  const ft = Math.max(5, size * 0.024 + ftR * size * 0.044);
  const pad = size * 0.32;
  const W = size + pad * 2;
  const H = size + pad * 2;
  const cx = W / 2;
  const cy = H / 2;
  const top = cy - bh / 2;
  const bot = cy + bh / 2;
  const T = "all 0.65s cubic-bezier(0.34,1.45,0.64,1)";
  const peralteLabel  = heightInch  != null ? `h = ${nearestFrac(heightInch)}`   : "Peralte (h)";
  const patinLabel    = flangeInch  != null ? `b = ${nearestFrac(flangeInch)}`   : "Patín (b)";
  const twLabel       = webInch     != null ? `tw = ${nearestFrac(webInch)}`     : null;
  const tfLabel       = flangeTInch != null ? `tf = ${nearestFrac(flangeTInch)}` : null;
  const bracketX = cx - fw / 2 - 16;
  const bracketY = top - 18;
  const rightX   = cx + fw / 2 + 16;
  const peralteW  = heightInch  != null ? 82 : 62;
  const patinW    = flangeInch  != null ? 82 : 56;
  const twPillW   = webInch     != null ? 72 : 0;
  const tfPillW   = flangeTInch != null ? 72 : 0;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{overflow:"visible", display:"block", margin:"0 auto"}}>
      <defs>
        <linearGradient id="gs2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d1fae5"/><stop offset="35%" stopColor="#4ade80"/><stop offset="100%" stopColor="#15803d"/>
        </linearGradient>
        <linearGradient id="gw2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#166534"/><stop offset="50%" stopColor="#4ade80"/><stop offset="100%" stopColor="#166534"/>
        </linearGradient>
        <filter id="sh2" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#15803d" floodOpacity="0.35"/>
        </filter>
      </defs>
      <rect x={cx-fw/2} y={top}    width={fw} height={ft}                   fill="url(#gs2)" rx="3" filter="url(#sh2)" style={{transition:T}}/>
      <rect x={cx-wt/2} y={top+ft} width={wt} height={Math.max(2,bh-ft*2)} fill="url(#gw2)"        style={{transition:T}}/>
      <rect x={cx-fw/2} y={bot-ft} width={fw} height={ft}                   fill="url(#gs2)" rx="3" filter="url(#sh2)" style={{transition:T}}/>
      <line x1={bracketX} y1={top} x2={bracketX} y2={bot} stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" strokeDasharray="4,3" style={{transition:T}}/>
      <line x1={bracketX-6} y1={top} x2={bracketX+6} y2={top} stroke="rgba(255,255,255,0.6)" strokeWidth="1.6" style={{transition:T}}/>
      <line x1={bracketX-6} y1={bot} x2={bracketX+6} y2={bot} stroke="rgba(255,255,255,0.6)" strokeWidth="1.6" style={{transition:T}}/>
      <rect x={bracketX-peralteW-6} y={(top+bot)/2-11} width={peralteW} height={22} rx="6" fill="rgba(0,0,0,0.5)" style={{transition:T}}/>
      <text x={bracketX-peralteW/2-6} y={(top+bot)/2+5} textAnchor="middle" fontSize="11" fontWeight="700" fill="rgba(255,255,255,0.95)" fontFamily="'Plus Jakarta Sans',sans-serif" style={{transition:T}}>{peralteLabel}</text>
      <line x1={cx-fw/2} y1={bracketY} x2={cx+fw/2} y2={bracketY} stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" strokeDasharray="4,3" style={{transition:T}}/>
      <line x1={cx-fw/2} y1={bracketY-6} x2={cx-fw/2} y2={bracketY+6} stroke="rgba(255,255,255,0.6)" strokeWidth="1.6" style={{transition:T}}/>
      <line x1={cx+fw/2} y1={bracketY-6} x2={cx+fw/2} y2={bracketY+6} stroke="rgba(255,255,255,0.6)" strokeWidth="1.6" style={{transition:T}}/>
      <rect x={cx-patinW/2} y={bracketY-22} width={patinW} height={22} rx="6" fill="rgba(0,0,0,0.5)" style={{transition:T}}/>
      <text x={cx} y={bracketY-7} textAnchor="middle" fontSize="11" fontWeight="700" fill="rgba(255,255,255,0.95)" fontFamily="'Plus Jakarta Sans',sans-serif" style={{transition:T}}>{patinLabel}</text>
      {tfLabel && (<>
        <line x1={rightX} y1={top} x2={rightX} y2={top+ft} stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" strokeDasharray="3,2" style={{transition:T}}/>
        <line x1={rightX-5} y1={top}    x2={rightX+5} y2={top}    stroke="rgba(255,255,255,0.6)" strokeWidth="1.4" style={{transition:T}}/>
        <line x1={rightX-5} y1={top+ft} x2={rightX+5} y2={top+ft} stroke="rgba(255,255,255,0.6)" strokeWidth="1.4" style={{transition:T}}/>
        <rect x={rightX+7} y={top+ft/2-11} width={tfPillW} height={22} rx="6" fill="rgba(0,0,0,0.5)" style={{transition:T}}/>
        <text x={rightX+7+tfPillW/2} y={top+ft/2+5} textAnchor="middle" fontSize="11" fontWeight="700" fill="rgba(255,255,255,0.95)" fontFamily="'Plus Jakarta Sans',sans-serif" style={{transition:T}}>{tfLabel}</text>
      </>)}
      {twLabel && (<>
        <line x1={cx+wt/2} y1={cy} x2={rightX} y2={cy} stroke="rgba(255,255,255,0.35)" strokeWidth="1" strokeDasharray="3,2" style={{transition:T}}/>
        <rect x={rightX+7} y={cy-11} width={twPillW} height={22} rx="6" fill="rgba(0,0,0,0.45)" style={{transition:T}}/>
        <text x={rightX+7+twPillW/2} y={cy+5} textAnchor="middle" fontSize="11" fontWeight="700" fill="rgba(255,255,255,0.85)" fontFamily="'Plus Jakarta Sans',sans-serif" style={{transition:T}}>{twLabel}</text>
      </>)}
    </svg>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App(): JSX.Element {
  const isMobile = useIsMobile();
  usePreventZoom();
  const [view, setView] = useState<"search"|"catalog">("search");
  const [height, setHeight] = useState("");
  const [flange, setFlange] = useState("");
  const [webInch, setWebInch] = useState<number|null>(null);
  const [flangeTInch, setFlangeTInch] = useState<number|null>(null);
  const [lbsPerFt, setLbsPerFt] = useState("");
  const [lengthFt, setLengthFt] = useState<LengthFt>(20);
  const [results, setResults] = useState<ClosestResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Beam|null>(null);
  const [catLength, setCatLength] = useState<LengthFt>(20);
  const [catSelected, setCatSelected] = useState<string|null>(null);


  function generateDatasheet(beam: Beam, lft: LengthFt) {
    const weightKg = beam.lbsPerFt * lft * LBS_TO_KG;
    const price = weightKg * PRICE_PER_KG;
    const fmt = (n:number) => new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",maximumFractionDigits:0}).format(n);
    const date = new Date().toLocaleDateString("es-MX",{year:"numeric",month:"long",day:"numeric"});
    const kgPerM = (beam.lbsPerFt*LBS_TO_KG).toFixed(2);
    const lftM   = (lft*FT_TO_M).toFixed(1);
    const flangeVal = beam.flange!=null ? nearestFrac(beam.flange) : "N/D";
    const flangeDec = beam.flange!=null ? beam.flange.toFixed(3)+'" \xb7 '+(beam.flange*25.4).toFixed(1)+' mm' : "\u2014";

    // SVG diagram with labeled dimensions
    const hR2=Math.max(0,Math.min(1,(beam.height-4)/40));
    const fR2=Math.max(0,Math.min(1,((beam.flange??8)-3.5)/13));
    const wR2=Math.max(0,Math.min(1,(beam.web-0.17)/1.3));
    const ftR2=Math.max(0,Math.min(1,(beam.flangeT-0.17)/2.1));
    const cx=120, cy=110;
    const H=60+hR2*80, FW=50+fR2*80, TW=6+wR2*14, TF=6+ftR2*12;
    const sx1=cx-FW/2, sx2=cx+FW/2, sy1=cy-H/2, sy2=cy+H/2, swx1=cx-TW/2, swx2=cx+TW/2;
    const svgInner =
      '<defs>' +
        '<marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#dc2626"/></marker>' +
        '<marker id="arrS" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse"><path d="M0,0 L6,3 L0,6 Z" fill="#dc2626"/></marker>' +
        '<marker id="arrB" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#2563eb"/></marker>' +
        '<marker id="arrBS" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse"><path d="M0,0 L6,3 L0,6 Z" fill="#2563eb"/></marker>' +
        '<marker id="arrG" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#16a34a"/></marker>' +
        '<marker id="arrGS" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse"><path d="M0,0 L6,3 L0,6 Z" fill="#16a34a"/></marker>' +
        '<marker id="arrO" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#d97706"/></marker>' +
        '<marker id="arrOS" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse"><path d="M0,0 L6,3 L0,6 Z" fill="#d97706"/></marker>' +
      '</defs>' +
      // beam shapes
      '<rect x="'+sx1+'" y="'+sy1+'" width="'+FW+'" height="'+TF+'" fill="#1e293b" rx="1"/>' +
      '<rect x="'+sx1+'" y="'+(sy2-TF)+'" width="'+FW+'" height="'+TF+'" fill="#1e293b" rx="1"/>' +
      '<rect x="'+swx1+'" y="'+(sy1+TF)+'" width="'+TW+'" height="'+(H-2*TF)+'" fill="#334155"/>' +
      // h arrow — left outside
      '<line x1="'+(sx1-14)+'" y1="'+sy1+'" x2="'+(sx1-14)+'" y2="'+sy2+'" stroke="#dc2626" stroke-width="1.2" marker-end="url(#arr)" marker-start="url(#arrS)"/>' +
      '<text x="'+(sx1-25)+'" y="'+cy+'" fill="#dc2626" font-size="9" font-family="Arial" font-weight="bold" text-anchor="middle" dominant-baseline="middle" transform="rotate(-90,'+(sx1-25)+','+cy+')">Peralte (h)</text>' +
      // b arrow — bottom outside
      '<line x1="'+sx1+'" y1="'+(sy2+16)+'" x2="'+sx2+'" y2="'+(sy2+16)+'" stroke="#2563eb" stroke-width="1.2" marker-end="url(#arrB)" marker-start="url(#arrBS)"/>' +
      '<text x="'+cx+'" y="'+(sy2+27)+'" fill="#2563eb" font-size="9" font-family="Arial" font-weight="bold" text-anchor="middle">Pat\u00edn (b)</text>' +
      // tw arrow — horizontal across web, at mid-height, right side label
      '<line x1="'+swx1+'" y1="'+cy+'" x2="'+swx2+'" y2="'+cy+'" stroke="#16a34a" stroke-width="1.2" marker-end="url(#arrG)" marker-start="url(#arrGS)"/>' +
      '<line x1="'+swx2+'" y1="'+cy+'" x2="'+(sx2+8)+'" y2="'+cy+'" stroke="#16a34a" stroke-width="0.7" stroke-dasharray="3,2"/>' +
      '<text x="'+(sx2+10)+'" y="'+(cy+4)+'" fill="#16a34a" font-size="9" font-family="Arial" font-weight="bold" text-anchor="start">tw</text>' +
      // tf arrow — vertical across top flange, right side
      '<line x1="'+(sx2+20)+'" y1="'+sy1+'" x2="'+(sx2+20)+'" y2="'+(sy1+TF)+'" stroke="#d97706" stroke-width="1.2" marker-end="url(#arrO)" marker-start="url(#arrOS)"/>' +
      '<line x1="'+sx2+'" y1="'+(sy1+TF/2)+'" x2="'+(sx2+20)+'" y2="'+(sy1+TF/2)+'" stroke="#d97706" stroke-width="0.7" stroke-dasharray="3,2"/>' +
      '<text x="'+(sx2+24)+'" y="'+(sy1+TF/2+4)+'" fill="#d97706" font-size="9" font-family="Arial" font-weight="bold" text-anchor="start">tf</text>';

    const css =
      '*{box-sizing:border-box;margin:0;padding:0}' +
      'body{font-family:Arial,sans-serif;padding:28px 36px;color:#111;font-size:13px;line-height:1.5;max-width:740px;margin:0 auto}' +
      '.topbar{background:#111827;color:#fff;text-align:center;font-size:10px;letter-spacing:.1em;padding:7px;margin:-28px -36px 24px;text-transform:uppercase}' +
      '.header{display:flex;justify-content:space-between;align-items:center;padding-bottom:16px;border-bottom:3px solid #16a34a;margin-bottom:22px}' +
      '.logo-text{font-size:20px;font-weight:800;color:#111827;letter-spacing:-0.02em}' +
      '.logo-text span{color:#16a34a}' +
      '.company p{font-size:11px;color:#666;margin:1px 0}' +
      '.beam-title{text-align:right}' +
      '.beam-title .label{font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em}' +
      '.beam-title .name{font-size:24px;font-weight:800;color:#16a34a;font-family:monospace;line-height:1.1}' +
      '.beam-title .sub{font-size:11px;color:#555;margin-top:2px}' +
      '.badge{display:inline-block;background:#e0f2fe;color:#0369a1;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;margin-top:4px;letter-spacing:.03em}' +
      '.svg-section{display:flex;gap:24px;align-items:center;margin-bottom:22px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:18px}' +
      '.svg-wrap{flex-shrink:0}' +
      '.dims-grid{flex:1;display:grid;grid-template-columns:1fr 1fr;gap:8px}' +
      '.dim-box{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:9px 11px}' +
      '.dim-box .lbl{font-size:9px;text-transform:uppercase;letter-spacing:.06em;color:#6b7280;font-weight:700;margin-bottom:2px}' +
      '.dim-box .val{font-size:14px;font-weight:800;color:#111827;font-family:monospace}' +
      '.dim-box .sub{font-size:10px;color:#9ca3af;font-family:monospace;margin-top:1px}' +
      '.price-section{background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:16px 20px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px}' +
      '.price-item .lbl{font-size:9px;text-transform:uppercase;letter-spacing:.06em;color:#15803d;font-weight:700;margin-bottom:2px}' +
      '.price-item .val{font-size:15px;font-weight:800;color:#111827;font-family:monospace}' +
      '.price-total .val{font-size:24px;color:#15803d}' +
      '.info-box{background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:11px 15px;margin-bottom:18px;font-size:11px;color:#7c2d12;line-height:1.8}' +
      '.footer{border-top:1px solid #e5e7eb;padding-top:11px;text-align:center;font-size:10px;color:#9ca3af;line-height:1.8}' +
      '.footer .green{color:#16a34a;font-weight:700}' +
      '@media print{body{padding:14px 18px}.topbar{margin:-14px -18px 18px}@page{margin:1cm}}';

    const body =
      '<div class="topbar">Surtiaceros del Pac\u00edfico S.A. de C.V. &nbsp;&middot;&nbsp; Ficha T\u00e9cnica de Producto</div>' +
      '<div class="header">' +
        '<div class="company">' +
          '<div class="logo-text">Surti<span>aceros</span></div>' +
          '<p style="font-weight:700;font-size:12px;color:#374151">del Pac\u00edfico S.A. de C.V.</p>' +
          '<p>Calle Aguascalientes No. 4255, Col. Constituci\u00f3n</p>' +
          '<p>Playas de Rosarito, B.C., C.P. 22707 &middot; Tel. 661 613 7038 / 7040</p>' +
          '<p>contacto@surtiaceros.com &middot; surtiaceros.com</p>' +
        '</div>' +
        '<div class="beam-title">' +
          '<div class="label">Perfil Estructural</div>' +
          '<div class="name">Viga '+beam.name+'</div>' +
          '<div class="sub">'+beam.lbsPerFt+' lb/ft &nbsp;&middot;&nbsp; '+kgPerM+' kg/m</div>' +
          '<div class="badge">Acero A36 &middot; ASTM A36</div>' +
          '<p style="font-size:10px;color:#aaa;margin-top:6px">'+date+'</p>' +
        '</div>' +
      '</div>' +
      '<div class="svg-section">' +
        '<div class="svg-wrap">' +
          '<svg width="220" height="210" viewBox="0 0 250 220" xmlns="http://www.w3.org/2000/svg">'+svgInner+'</svg>' +
        '</div>' +
        '<div class="dims-grid">' +
          '<div class="dim-box"><div class="lbl" style="color:#dc2626">&#9632; Peralte (h)</div><div class="val">'+nearestFrac(beam.height)+'</div><div class="sub">'+beam.height.toFixed(3)+'" &middot; '+(beam.height*25.4).toFixed(1)+' mm</div></div>' +
          '<div class="dim-box"><div class="lbl" style="color:#2563eb">&#9632; Pat\u00edn (b)</div><div class="val">'+flangeVal+'</div><div class="sub">'+flangeDec+'</div></div>' +
          '<div class="dim-box"><div class="lbl" style="color:#16a34a">&#9632; Esp. Alma (tw)</div><div class="val">'+nearestFrac(beam.web)+'</div><div class="sub">'+beam.web.toFixed(3)+'" &middot; '+(beam.web*25.4).toFixed(1)+' mm</div></div>' +
          '<div class="dim-box"><div class="lbl" style="color:#d97706">&#9632; Esp. Pat\u00edn (tf)</div><div class="val">'+nearestFrac(beam.flangeT)+'</div><div class="sub">'+beam.flangeT.toFixed(3)+'" &middot; '+(beam.flangeT*25.4).toFixed(1)+' mm</div></div>' +
          '<div class="dim-box" style="grid-column:span 2"><div class="lbl">Peso lineal</div><div class="val">'+beam.lbsPerFt+' lb/ft &nbsp;&middot;&nbsp; '+kgPerM+' kg/m</div></div>' +
        '</div>' +
      '</div>' +
      '<div class="price-section">' +
        '<div class="price-item"><div class="lbl">Longitud</div><div class="val">'+lft+' ft &nbsp;&middot;&nbsp; '+lftM+' m</div></div>' +
        '<div class="price-item"><div class="lbl">Peso total estimado</div><div class="val">'+Math.round(weightKg)+' kg</div></div>' +
        '<div class="price-item"><div class="lbl">Precio por kg c/IVA</div><div class="val">$'+PRICE_PER_KG+' MXN</div></div>' +
        '<div class="price-item price-total"><div class="lbl">Precio estimado c/IVA</div><div class="val">'+fmt(price)+'</div></div>' +
      '</div>' +
      '<div class="info-box">&#9888;&#65039; <strong>Nota:</strong> Precio de referencia sujeto a cambios sin previo aviso y a disponibilidad de inventario. El flete es gratis en pedidos con entrega dentro de los municipios de Playas de Rosarito y Tijuana, B.C. Para entregas for\u00e1neas, el costo de env\u00edo se cotiza por separado seg\u00fan el destino y el volumen del pedido. Favor de consultar con un agente el tiempo estimado de entrega.</div>' +
      '<div class="footer"><span class="green">Surtiaceros del Pac\u00edfico S.A. de C.V.</span> &nbsp;&middot;&nbsp; Tel. 661 613 7038 / 7040 &nbsp;&middot;&nbsp; contacto@surtiaceros.com &nbsp;&middot;&nbsp; surtiaceros.com<br>Ficha generada el '+date+' &nbsp;&middot;&nbsp; Todos los derechos reservados &copy; '+new Date().getFullYear()+'</div>';

    // Add print button to the HTML and open in new tab
    const printBtn = '<div style="position:fixed;top:16px;right:16px;z-index:999;display:flex;gap:8px">' +
      '<button onclick="window.print()" style="background:#16a34a;color:#fff;border:none;border-radius:10px;padding:10px 20px;font-size:14px;font-weight:700;cursor:pointer;font-family:Arial;box-shadow:0 2px 8px rgba(0,0,0,0.2)">🖨️ Imprimir / Guardar PDF</button>' +
      '<button onclick="window.close()" style="background:#374151;color:#fff;border:none;border-radius:10px;padding:10px 16px;font-size:13px;font-weight:600;cursor:pointer;font-family:Arial">✕ Cerrar</button>' +
      '</div>' +
      '<style>@media print{.no-print{display:none!important}}</style>' +
      '<div class="no-print" style="height:52px"></div>';

    const html = '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Ficha T\u00e9cnica \u2014 Viga '+beam.name+'</title><style>'+css+'</style></head><body>'+printBtn+body+'</body></html>';
    const w = window.open("","_blank");
    if (w) { w.document.write(html); w.document.close(); w.focus(); }
  }

  const catBeamObj = BEAMS.find(b => b.id === catSelected) ?? null;
  const catHR  = catBeamObj ? Math.max(0,Math.min(1,(catBeamObj.height-4)/40))        : 0.3;
  const catFR  = catBeamObj ? Math.max(0,Math.min(1,((catBeamObj.flange??8)-3.5)/13)) : 0.4;
  const catWR  = catBeamObj ? Math.max(0,Math.min(1,(catBeamObj.web-0.17)/1.3))       : 0.4;
  const catFTR = catBeamObj ? Math.max(0,Math.min(1,(catBeamObj.flangeT-0.17)/2.1))   : 0.4;

  const hI = height ? parseFloat(height) : null;
  const fI = flange ? parseFloat(flange) : null;
  const lbsI = lbsPerFt ? parseFloat(lbsPerFt) : null;
  const dispBeam = selected ?? null;
  const hR  = dispBeam ? Math.max(0,Math.min(1,(dispBeam.height-4)/40))            : (hI ? Math.max(0,Math.min(1,(hI-4)/40)) : 0.3);
  const fR  = dispBeam ? Math.max(0,Math.min(1,((dispBeam.flange??8)-3.5)/13))     : (fI ? Math.max(0,Math.min(1,(fI-3.5)/13)) : 0.4);
  const wR  = dispBeam ? Math.max(0,Math.min(1,(dispBeam.web-0.17)/1.3))           : (webInch ? Math.max(0,Math.min(1,(webInch-0.17)/1.3)) : 0.4);
  const ftR = dispBeam ? Math.max(0,Math.min(1,(dispBeam.flangeT-0.17)/2.1))       : (flangeTInch ? Math.max(0,Math.min(1,(flangeTInch-0.17)/2.1)) : 0.4);
  const svgH  = dispBeam ? dispBeam.height          : hI;
  const svgF  = dispBeam ? (dispBeam.flange ?? null) : fI;
  const svgW  = dispBeam ? dispBeam.web             : webInch;
  const svgFT = dispBeam ? dispBeam.flangeT         : flangeTInch;
  const canSearch = !!(!loading && (height || flange || webInch || flangeTInch || lbsPerFt));

  function doSearch() {
    if (!canSearch) return;
    setLoading(true); setSelected(null);
    setTimeout(()=>{ setResults(findClosest({height:hI,flange:fI,web:webInch,flangeT:flangeTInch,lbsPerFt:lbsI})); setSearched(true); setLoading(false); },380);
  }

  // Auto-search when any dimension changes
  useEffect(()=>{
    if (height || flange || webInch || flangeTInch || lbsPerFt) {
      setLoading(true); setSelected(null);
      const t = setTimeout(()=>{ setResults(findClosest({height:hI,flange:fI,web:webInch,flangeT:flangeTInch,lbsPerFt:lbsI})); setSearched(true); setLoading(false); },300);
      return ()=>clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[height, flange, webInch, flangeTInch, lbsPerFt]);

  const catBeams = BEAMS;

  const card: CSSProperties = {
    background:"#ffffff", borderRadius:16, border:"1px solid #e5e7eb",
    padding:"18px", boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
  };

  const searchBtn: CSSProperties = {
    width:"100%", padding:"15px", border:"none", borderRadius:14,
    fontSize:15, fontWeight:700, letterSpacing:"-0.01em",
    display:"flex", alignItems:"center", justifyContent:"center", gap:9,
    minHeight:52, cursor:"pointer", transition:"all 0.2s",
    background: canSearch ? "#16a34a" : "#e5e7eb",
    color: canSearch ? "#ffffff" : "#9ca3af",
    boxShadow: canSearch ? "0 4px 16px rgba(22,163,74,0.3)" : "none",
  };

  return (
    <div style={{minHeight:"100vh",background:"#f8f9fa",fontFamily:"'Plus Jakarta Sans','DM Sans',system-ui,sans-serif",fontSize:"15px",display:"flex",flexDirection:"column"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{-webkit-text-size-adjust:100%;}
        input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;}
        input[type=number]{-moz-appearance:textfield;}
        input,select,textarea{font-size:16px!important;}
        button,input{-webkit-tap-highlight-color:transparent;touch-action:manipulation;}
        *{-webkit-font-smoothing:antialiased;}
        ::-webkit-scrollbar{display:none;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        @keyframes spin{to{transform:rotate(360deg);}}
        .rc{animation:fadeUp 0.35s ease both;}
        .tap:active{transform:scale(0.96);}
        input:focus{border-color:#16a34a!important;box-shadow:0 0 0 3px rgba(22,163,74,0.15)!important;}
      `}</style>

      {/* ── Top banner ── */}
      <div style={{background:"#111827",padding:"7px 20px",textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
        <span style={{fontSize:11,color:"rgba(255,255,255,0.45)"}}>Visita nuestro sitio:</span>
        <a href="https://surtiaceros.com" target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:"#4ade80",fontWeight:700,textDecoration:"none"}}>www.surtiaceros.com →</a>
      </div>

      {/* ── Header ── */}
      <header style={{background:"#ffffff",borderBottom:"1px solid #e5e7eb",padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:30,boxShadow:"0 1px 6px rgba(0,0,0,0.06)"}}>
        <a href="https://surtiaceros.com" target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:8,textDecoration:"none"}}>
          <img src="/logo.jpg" alt="Surtiaceros" style={{height:isMobile?34:42,width:"auto",objectFit:"contain",flexShrink:0}}/>
          {!isMobile && <span style={{fontSize:11,color:"#16a34a",fontWeight:600,letterSpacing:"0.02em",borderBottom:"1px solid #bbf7d0"}}>surtiaceros.com</span>}
        </a>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          {/* Nav tabs */}
          <div style={{display:"flex",background:"#f3f4f6",borderRadius:10,padding:3,gap:2}}>
            {([
              {id:"search" as const, label:isMobile?"Buscar":"Identificador"},
              {id:"catalog" as const, label:isMobile?"Catálogo":"Catálogo de Vigas"},
            ]).map(({id,label})=>(
              <button key={id} type="button" onClick={()=>setView(id)} className="tap" style={{padding:isMobile?"7px 10px":"8px 14px",borderRadius:8,border:"none",cursor:"pointer",fontSize:isMobile?11:12,fontWeight:700,transition:"all 0.15s",background:view===id?"#111827":"transparent",color:view===id?"#ffffff":"#6b7280",minHeight:32,whiteSpace:"nowrap"}}>{label}</button>
            ))}
          </div>
        </div>
      </header>

      {/* ── SEARCH VIEW ── */}
      {view === "search" && <>

      <div style={{background:"linear-gradient(160deg,#111827 0%,#1f2937 65%,#166534 100%)",padding:isMobile?"22px 20px 16px":"32px 32px 20px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-40,right:-40,width:160,height:160,background:"rgba(22,163,74,0.07)",borderRadius:"50%",pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:-50,left:-30,width:180,height:180,background:"rgba(22,163,74,0.04)",borderRadius:"50%",pointerEvents:"none"}}/>
        <div style={{position:"relative"}}>
          <h1 style={{fontSize:isMobile?22:28,fontWeight:800,color:"#ffffff",letterSpacing:"-0.03em",lineHeight:1.2,marginBottom:6}}>Encuentra tu viga de acero</h1>
          <p style={{fontSize:isMobile?12:14,color:"rgba(255,255,255,0.5)",lineHeight:1.6,maxWidth:300,margin:"0 auto"}}>Selecciona peralte y patín → perfil más cercano + precio inmediato</p>
        </div>
      </div>

      <div style={{background:"linear-gradient(180deg,#1f2937 0%,#111827 100%)",padding:isMobile?"2px 12px 4px":"8px 32px 10px",textAlign:"center",position:"sticky",top:isMobile?56:64,zIndex:20,boxShadow:"0 4px 16px rgba(0,0,0,0.25)",overflow:"hidden",maxHeight:isMobile?140:200}}>
        <div style={{display:"flex",justifyContent:"center",alignItems:"center"}}>
          <BeamSVG hR={hR} fR={fR} wR={wR} ftR={ftR} size={isMobile?105:160} heightInch={svgH} flangeInch={svgF} webInch={svgW} flangeTInch={svgFT}/>
        </div>
      </div>

      <main style={{flex:1,padding:isMobile?"16px 14px 130px":"24px 24px 56px",maxWidth:580,width:"100%",margin:"0 auto",display:"flex",flexDirection:"column",gap:12}}>

        {/* Required dims — tap buttons */}
        <div style={{...card,display:"flex",flexDirection:"column",gap:16}}>
          <div style={{fontSize:11,fontWeight:700,color:"#374151",letterSpacing:"0.06em",textTransform:"uppercase",display:"flex",alignItems:"center",gap:6}}>
            Dimensiones principales
            <span style={{background:"#f0fdf4",color:"#16a34a",fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:20}}>Opcional</span>
          </div>

          {/* Height selector */}
          <div>
            <div style={{fontSize:11,fontWeight:700,color:"#374151",letterSpacing:"0.05em",textTransform:"uppercase",marginBottom:8}}>
              Peralte / Altura (h)
              {height && <span style={{marginLeft:8,fontSize:12,color:"#16a34a",fontWeight:800,fontFamily:"monospace",textTransform:"none",letterSpacing:0}}>{height}"</span>}
            </div>
            <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4,WebkitOverflowScrolling:"touch" as CSSProperties["WebkitOverflowScrolling"]}}>
              {Array.from(new Set(BEAMS.map(b=>b.heightR))).sort((a,b)=>a-b).map(h=>{
                const active = height === String(h);
                return (
                  <button key={h} type="button" onClick={()=>{
                    setHeight(String(h));
                    setSelected(null);
                  }} className="tap" style={{flexShrink:0,minWidth:48,minHeight:44,borderRadius:12,border:`2px solid ${active?"#16a34a":"#e5e7eb"}`,background:active?"#16a34a":"#ffffff",color:active?"#ffffff":"#374151",fontSize:14,fontWeight:active?800:500,cursor:"pointer",transition:"all 0.15s",fontFamily:"monospace",boxShadow:active?"0 2px 8px rgba(22,163,74,0.3)":"none"}}>
                    {h}"
                  </button>
                );
              })}
            </div>
          </div>

          {/* Flange selector — filtered to sizes that exist for selected height */}
          <div>
            <div style={{fontSize:11,fontWeight:700,color:"#374151",letterSpacing:"0.05em",textTransform:"uppercase",marginBottom:8}}>
              Ancho de Patín (b)
              {flange && <span style={{marginLeft:8,fontSize:12,color:"#16a34a",fontWeight:800,fontFamily:"monospace",textTransform:"none",letterSpacing:0}}>{flange}"</span>}
            </div>
            {(() => {
              // Show flange options: if height selected, show flanges of beams with that nominal height
              // Round flange to nearest whole or half inch for grouping
              const relevantBeams = height
                ? BEAMS.filter(b=>b.heightR === parseInt(height))
                : BEAMS;
              const flangeNominals = Array.from(new Set(
                relevantBeams
                  .filter(b=>b.flange!=null)
                  .map(b=>Math.round((b.flange as number)*2)/2)
              )).sort((a,b)=>a-b);
              if (flangeNominals.length === 0) flangeNominals.push(...[4,6,8,10,12,14,16].filter(f=>f<=20));
              return (
                <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4,WebkitOverflowScrolling:"touch" as CSSProperties["WebkitOverflowScrolling"]}}>
                  {flangeNominals.map(f=>{
                    const label = Number.isInteger(f) ? `${f}"` : `${f}"`;
                    const active = flange === String(f);
                    return (
                      <button key={f} type="button" onClick={()=>{
                        setFlange(String(f));
                        setSelected(null);
                      }} className="tap" style={{flexShrink:0,minWidth:50,minHeight:44,borderRadius:12,border:`2px solid ${active?"#16a34a":"#e5e7eb"}`,background:active?"#16a34a":"#ffffff",color:active?"#ffffff":"#374151",fontSize:13,fontWeight:active?800:500,cursor:"pointer",transition:"all 0.15s",fontFamily:"monospace",boxShadow:active?"0 2px 8px rgba(22,163,74,0.3)":"none"}}>
                        {label}
                      </button>
                    );
                  })}
                </div>
              );
            })()}
            {height && <div style={{fontSize:10,color:"#9ca3af",marginTop:5}}>Mostrando anchos disponibles para vigas de {height}"</div>}
          </div>

          {/* Clear selection */}
          {(height || flange) && (
            <button type="button" onClick={()=>{setHeight("");setFlange("");setLbsPerFt("");setResults([]);setSearched(false);setSelected(null);}} style={{alignSelf:"flex-start",fontSize:12,color:"#9ca3af",background:"none",border:"none",cursor:"pointer",padding:"2px 0",fontWeight:500}}>
              ✕ Limpiar selección
            </button>
          )}
        </div>

        {/* Thicknesses */}
        <div style={{...card,display:"flex",flexDirection:"column",gap:16}}>
          <div style={{fontSize:11,fontWeight:700,color:"#374151",letterSpacing:"0.06em",textTransform:"uppercase"}}>
            Espesores (pulgadas) <span style={{fontWeight:400,color:"#9ca3af",textTransform:"none",fontSize:11}}>(opcional)</span>
          </div>

          {/* Alma (tw) */}
          {(()=>{
            const relevant = BEAMS.filter(b =>
              (!height || b.heightR === parseInt(height)) &&
              (!flange || Math.abs((b.flange??0) - parseFloat(flange)) < 0.4)
            );
            const options = Array.from(new Set(
              relevant.map(b => Math.round(b.web * 16) / 16)
            )).sort((a,b)=>a-b);
            return (
              <div>
                <div style={{fontSize:11,fontWeight:700,color:"#374151",letterSpacing:"0.05em",textTransform:"uppercase",marginBottom:8}}>
                  Alma (tw)
                  {webInch && <span style={{marginLeft:8,fontSize:12,color:"#16a34a",fontWeight:800,fontFamily:"monospace",textTransform:"none",letterSpacing:0}}>≈ {nearestFrac(webInch)}</span>}
                </div>
                <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4,WebkitOverflowScrolling:"touch" as CSSProperties["WebkitOverflowScrolling"]}}>
                  <button type="button" onClick={()=>setWebInch(null)} className="tap" style={{flexShrink:0,minWidth:40,minHeight:42,borderRadius:12,border:`2px solid ${webInch===null?"#16a34a":"#e5e7eb"}`,background:webInch===null?"#16a34a":"#ffffff",color:webInch===null?"#ffffff":"#9ca3af",fontSize:15,fontWeight:600,cursor:"pointer",transition:"all 0.15s"}}>—</button>
                  {options.map(v=>{
                    const frac = nearestFrac(v);
                    const active = webInch !== null && Math.abs(webInch - v) < 0.03;
                    return (
                      <button key={v} type="button" onClick={()=>setWebInch(v)} className="tap" style={{flexShrink:0,minWidth:54,minHeight:42,padding:"0 10px",borderRadius:12,border:`2px solid ${active?"#16a34a":"#e5e7eb"}`,background:active?"#16a34a":"#ffffff",color:active?"#ffffff":"#374151",fontSize:13,fontWeight:active?800:500,cursor:"pointer",transition:"all 0.15s",fontFamily:"monospace",whiteSpace:"nowrap",boxShadow:active?"0 2px 8px rgba(22,163,74,0.3)":"none"}}>
                        {frac}
                      </button>
                    );
                  })}
                </div>
                {height && flange && <div style={{fontSize:10,color:"#9ca3af",marginTop:4}}>Espesores de alma disponibles para esta combinación</div>}
              </div>
            );
          })()}

          <div style={{height:1,background:"#f3f4f6"}}/>

          {/* Patín (tf) */}
          {(()=>{
            const relevant = BEAMS.filter(b =>
              (!height || b.heightR === parseInt(height)) &&
              (!flange || Math.abs((b.flange??0) - parseFloat(flange)) < 0.4)
            );
            const options = Array.from(new Set(
              relevant.map(b => Math.round(b.flangeT * 16) / 16)
            )).sort((a,b)=>a-b);
            return (
              <div>
                <div style={{fontSize:11,fontWeight:700,color:"#374151",letterSpacing:"0.05em",textTransform:"uppercase",marginBottom:8}}>
                  Patín (tf)
                  {flangeTInch && <span style={{marginLeft:8,fontSize:12,color:"#16a34a",fontWeight:800,fontFamily:"monospace",textTransform:"none",letterSpacing:0}}>≈ {nearestFrac(flangeTInch)}</span>}
                </div>
                <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4,WebkitOverflowScrolling:"touch" as CSSProperties["WebkitOverflowScrolling"]}}>
                  <button type="button" onClick={()=>setFlangeTInch(null)} className="tap" style={{flexShrink:0,minWidth:40,minHeight:42,borderRadius:12,border:`2px solid ${flangeTInch===null?"#16a34a":"#e5e7eb"}`,background:flangeTInch===null?"#16a34a":"#ffffff",color:flangeTInch===null?"#ffffff":"#9ca3af",fontSize:15,fontWeight:600,cursor:"pointer",transition:"all 0.15s"}}>—</button>
                  {options.map(v=>{
                    const frac = nearestFrac(v);
                    const active = flangeTInch !== null && Math.abs(flangeTInch - v) < 0.03;
                    return (
                      <button key={v} type="button" onClick={()=>setFlangeTInch(v)} className="tap" style={{flexShrink:0,minWidth:54,minHeight:42,padding:"0 10px",borderRadius:12,border:`2px solid ${active?"#16a34a":"#e5e7eb"}`,background:active?"#16a34a":"#ffffff",color:active?"#ffffff":"#374151",fontSize:13,fontWeight:active?800:500,cursor:"pointer",transition:"all 0.15s",fontFamily:"monospace",whiteSpace:"nowrap",boxShadow:active?"0 2px 8px rgba(22,163,74,0.3)":"none"}}>
                        {frac}
                      </button>
                    );
                  })}
                </div>
                {height && flange && <div style={{fontSize:10,color:"#9ca3af",marginTop:4}}>Espesores de patín disponibles para esta combinación</div>}
              </div>
            );
          })()}
        </div>

        {/* Peso lineal */}
        <div style={{...card,display:"flex",flexDirection:"column",gap:10}}>
          <div style={{fontSize:11,fontWeight:700,color:"#374151",letterSpacing:"0.06em",textTransform:"uppercase",display:"flex",alignItems:"center",gap:6}}>
            Peso lineal
            <span style={{background:"#f0fdf4",color:"#16a34a",fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:20}}>Opcional</span>
          </div>
          <div style={{position:"relative"}}>
            <input
              type="number" inputMode="decimal" value={lbsPerFt}
              onChange={e=>{ setLbsPerFt(e.target.value); setSelected(null); }}
              placeholder="ej. 50"
              style={{width:"100%",padding:"11px 60px 11px 14px",border:`1.5px solid ${lbsPerFt?"#16a34a":"#e5e7eb"}`,borderRadius:12,fontSize:16,fontWeight:500,color:"#111827",fontFamily:"'JetBrains Mono','Fira Mono',monospace",outline:"none",background:"#ffffff",WebkitAppearance:"none",MozAppearance:"textfield" as CSSProperties["MozAppearance"],transition:"border-color 0.2s, box-shadow 0.2s"}}
            />
            <span style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",fontSize:11,fontWeight:700,color:lbsPerFt?"#16a34a":"#9ca3af",fontFamily:"monospace",pointerEvents:"none"}}>lb/ft</span>
          </div>
          <div style={{fontSize:11,color:"#9ca3af"}}>Rango del catálogo: 8 – 290 lb/ft</div>
        </div>

        {/* Length */}
        <div style={{...card}}>
          <div style={{fontSize:11,fontWeight:700,color:"#374151",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:12}}>Longitud de viga</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {LENGTH_OPTIONS.map(ft=>{
              const active=lengthFt===ft;
              return (
                <button key={ft} type="button" onClick={()=>setLengthFt(ft)} className="tap" style={{padding:"14px 12px",borderRadius:14,border:`2px solid ${active?"#16a34a":"#e5e7eb"}`,background:"#ffffff",cursor:"pointer",transition:"all 0.15s",textAlign:"center",boxShadow:active?"0 0 0 3px rgba(22,163,74,0.15)":undefined,position:"relative",overflow:"hidden"}}>
                  {active&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"#16a34a"}}/>}
                  <div style={{fontSize:22,fontWeight:800,color:active?"#16a34a":"#6b7280",fontFamily:"monospace",lineHeight:1}}>{ft}<span style={{fontSize:13,fontWeight:500}}> ft</span></div>
                  <div style={{fontSize:12,color:active?"#16a34a":"#9ca3af",marginTop:3,fontWeight:600}}>{(ft*FT_TO_M).toFixed(1)} m</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search (desktop) */}
        {!isMobile && (
          <button type="button" onClick={doSearch} disabled={!canSearch} className="tap" style={searchBtn}>
            {loading
              ? <><svg width="18" height="18" viewBox="0 0 20 20" style={{animation:"spin 0.7s linear infinite"}}><circle cx="10" cy="10" r="8" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" fill="none"/><path d="M10 2 A8 8 0 0 1 18 10" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/></svg>Buscando...</>
              : <><svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="2.2"/><path d="M13 13L17 17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>Buscar Viga</>
            }
          </button>
        )}

        {/* Results */}
        {searched && !loading && results.length > 0 && (
          <div>
            <div style={{fontSize:11,fontWeight:700,color:"#374151",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10,paddingLeft:2}}>Vigas más cercanas a lo que usted busca:</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {results.map(({beam,dist},i)=>{
                const isTop=i===0, isExp=selected?.id===beam.id;
                const score=Math.max(0,100-dist*200);
                const mLabel=score>90?"Casi Exacto":score>70?"Muy cercano":score>50?"Cercano":"Aproximado";
                const mColor=score>90?"#16a34a":score>70?"#3b82f6":score>50?"#f59e0b":"#9ca3af";
                const weightKg=beam.lbsPerFt*lengthFt*LBS_TO_KG;
                const price=weightKg*PRICE_PER_KG;
                return (
                  <div key={beam.id} className="rc" style={{animationDelay:`${i*0.07}s`}}>
                    <div onClick={()=>setSelected(isExp?null:beam)} className="tap" style={{background:isTop?"#111827":"#ffffff",border:`1.5px solid ${isTop?"#111827":isExp?"#16a34a":"#e5e7eb"}`,borderRadius:isExp?"16px 16px 0 0":16,padding:"16px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,userSelect:"none",boxShadow:isTop?"0 4px 16px rgba(0,0,0,0.2)":"0 1px 3px rgba(0,0,0,0.04)"}}>
                      <div style={{width:34,height:34,borderRadius:10,flexShrink:0,background:isTop?"rgba(255,255,255,0.1)":"#f3f4f6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:isTop?"rgba(255,255,255,0.7)":"#374151"}}>{i+1}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:15,fontWeight:700,color:isTop?"#ffffff":"#111827",fontFamily:"'JetBrains Mono',monospace",letterSpacing:"-0.02em"}}>Viga {beam.name}</div>
                        <div style={{display:"flex",alignItems:"center",gap:5,marginTop:4}}>
                          <span style={{width:6,height:6,borderRadius:"50%",background:isTop?"rgba(255,255,255,0.5)":mColor,flexShrink:0,display:"inline-block"}}/>
                          <span style={{fontSize:10,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",color:isTop?"rgba(255,255,255,0.55)":mColor}}>{mLabel}</span>
                        </div>
                        <div style={{fontSize:9,color:isTop?"rgba(255,255,255,0.3)":"#9ca3af",marginTop:3,lineHeight:1.4}}>Sujeto a disponibilidad, favor de contactar para revisar tiempos de entrega</div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <div style={{fontSize:15,fontWeight:800,color:isTop?"#4ade80":"#16a34a",fontFamily:"monospace"}}>{fmtPeso(price)}</div>
                        <div style={{fontSize:11,color:isTop?"rgba(255,255,255,0.4)":"#9ca3af",marginTop:2,fontWeight:500}}>{Math.round(weightKg)} kg · {lengthFt} ft</div>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 18 18" fill="none" style={{flexShrink:0,transform:isExp?"rotate(90deg)":"none",transition:"transform 0.2s",opacity:0.4}}>
                        <path d="M7 5l4 4-4 4" stroke={isTop?"#ffffff":"#374151"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    {isExp && (
                      <div style={{animation:"fadeUp 0.2s ease",background:"#ffffff",border:"1.5px solid #e5e7eb",borderTop:"none",borderRadius:"0 0 16px 16px",padding:"18px 16px 20px",boxShadow:"0 4px 12px rgba(0,0,0,0.06)"}}>
                        <div style={{background:"#f3f4f6",border:"1px solid #e5e7eb",borderRadius:12,padding:"16px 18px",marginBottom:16}}>
                          <div style={{fontSize:10,fontWeight:700,color:"#6b7280",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:12}}>Precio — {lengthFt} ft ({(lengthFt*FT_TO_M).toFixed(1)} m)</div>
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
                            {[["Peso total",`${Math.round(weightKg)} kg`],["$/kg",`$${PRICE_PER_KG} MXN`],["Total c/IVA",fmtPeso(price)]].map(([l,v],j)=>(
                              <div key={l as string}>
                                <div style={{fontSize:10,color:"#6b7280",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:4,fontWeight:600}}>{l}</div>
                                <div style={{fontSize:j===2?18:14,fontWeight:j===2?800:600,color:j===2?"#15803d":"#111827",fontFamily:"monospace",lineHeight:1}}>{v}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div style={{fontSize:11,fontWeight:700,color:"#374151",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:10}}>Especificaciones</div>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:16}}>
                          {[
                            {lbl:"Peralte (h)",    dec:`${beam.height.toFixed(3)}"`,  frac:nearestFrac(beam.height)},
                            {lbl:"Patín (b)",      dec:beam.flange!=null?`${beam.flange.toFixed(3)}"`:"N/D", frac:beam.flange!=null?nearestFrac(beam.flange):""},
                            {lbl:"Esp. Alma (tw)", dec:`${beam.web.toFixed(3)}"`,     frac:nearestFrac(beam.web)},
                            {lbl:"Esp. Patín (tf)",dec:`${beam.flangeT.toFixed(3)}"`,frac:nearestFrac(beam.flangeT)},
                            {lbl:"Peso lineal",    dec:`${beam.lbsPerFt} lb/ft`,      frac:"", bottom:`${(beam.lbsPerFt*LBS_TO_KG).toFixed(2)} kg/m`},
                          ].map(({lbl,dec,frac,bottom})=>(
                            <div key={lbl} style={{background:"#f9fafb",border:"1px solid #e5e7eb",borderRadius:10,padding:"9px 10px"}}>
                              <div style={{fontSize:10,color:"#6b7280",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:4,fontWeight:600}}>{lbl}</div>
                              <div style={{display:"flex",alignItems:"baseline",gap:5,flexWrap:"wrap"}}>
                                <span style={{fontSize:11,color:"#6b7280",fontFamily:"monospace",fontWeight:500}}>{dec}</span>
                                {frac && <span style={{fontSize:13,fontWeight:800,color:"#111827",fontFamily:"monospace"}}>≈ {frac}</span>}
                              </div>
                              {bottom && <div style={{fontSize:11,color:"#6b7280",fontFamily:"monospace",marginTop:2}}>{bottom}</div>}
                            </div>
                          ))}
                        </div>
                        <div style={{display:"flex",flexDirection:"column",gap:8}}>
                          <button type="button" onClick={()=>generateDatasheet(beam,lengthFt)} className="tap"
                            style={{width:"100%",padding:"13px",background:"#f8fafc",color:"#374151",border:"1.5px solid #e5e7eb",borderRadius:12,fontSize:14,fontWeight:700,minHeight:46,display:"flex",alignItems:"center",justifyContent:"center",gap:8,cursor:"pointer"}}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                            Consultar e imprimir ficha técnica
                          </button>
                          <a href={`mailto:contacto@surtiaceros.com?subject=${encodeURIComponent(`Cotización Viga ${beam.name}`)}&body=${encodeURIComponent(`Hola,\n\nMe interesa cotizar:\n\nViga: ${beam.name}\nLongitud: ${lengthFt} ft (${(lengthFt*FT_TO_M).toFixed(1)} m)\nPeso estimado: ${Math.round(weightKg)} kg\nPrecio estimado: ${fmtPeso(price)} (c/IVA)\n\nFavor de confirmar disponibilidad y precio final.\n\nGracias.`)}`}
                            className="tap" style={{width:"100%",padding:"13px",background:"#111827",color:"#ffffff",borderRadius:12,fontSize:14,fontWeight:700,minHeight:46,display:"flex",alignItems:"center",justifyContent:"center",gap:8,textDecoration:"none"}}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                            Contactar por correo electrónico
                          </a>
                          <a href={`https://wa.me/526616137040?text=${encodeURIComponent(`Hola Surtiaceros, me interesa cotizar:\n\n*Viga ${beam.name}*\n📏 ${lengthFt} ft (${(lengthFt*FT_TO_M).toFixed(1)} m)\n⚖️ ${Math.round(weightKg)} kg\n💰 ${fmtPeso(price)} c/IVA\n\n¿Pueden confirmar disponibilidad?`)}`}
                            target="_blank" rel="noopener noreferrer" className="tap" style={{width:"100%",padding:"13px",background:"#25d366",color:"#ffffff",borderRadius:12,fontSize:14,fontWeight:700,minHeight:46,display:"flex",alignItems:"center",justifyContent:"center",gap:8,textDecoration:"none"}}>
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.558 4.121 1.532 5.856L.057 23.882l6.198-1.627A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.667-.52-5.184-1.426l-.371-.22-3.681.965.982-3.588-.242-.38A9.937 9.937 0 0 1 2 12C2 6.478 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                            Contactar por WhatsApp
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!searched && !isMobile && (
          <div style={{textAlign:"center",color:"#9ca3af",fontSize:12,paddingTop:4}}>
            {BEAMS.length} perfiles · 20 ft y 40 ft · $40 MXN/kg con IVA
          </div>
        )}
      </main>

      {isMobile && (
        <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:40,background:"#ffffff",borderTop:"1px solid #e5e7eb",padding:"10px 16px",paddingBottom:"calc(10px + env(safe-area-inset-bottom))",boxShadow:"0 -2px 16px rgba(0,0,0,0.08)"}}>
          {searched && !loading && (
            <div style={{fontSize:11,color:"#16a34a",fontWeight:700,textAlign:"center",marginBottom:7}}>
              {results.length} coincidencias · toca para ver precio
            </div>
          )}
          <button type="button" onClick={doSearch} disabled={!canSearch} className="tap" style={searchBtn}>
            {loading
              ? <><svg width="18" height="18" viewBox="0 0 20 20" style={{animation:"spin 0.7s linear infinite"}}><circle cx="10" cy="10" r="8" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" fill="none"/><path d="M10 2 A8 8 0 0 1 18 10" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/></svg>Buscando...</>
              : <><svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="2.2"/><path d="M13 13L17 17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>Buscar Viga</>
            }
          </button>
        </div>
      )}
      </>}

      {/* ── CATALOG VIEW ── */}
      {view === "catalog" && (
        <div style={{flex:1,display:"flex",flexDirection:"column"}}>
          <div style={{background:"#111827",padding:isMobile?"16px 16px 12px":"20px 28px 14px"}}>
            <div style={{maxWidth:640,margin:"0 auto"}}>
              <div style={{fontSize:isMobile?18:22,fontWeight:800,color:"#ffffff",marginBottom:4}}>Catálogo de Vigas</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.45)",marginBottom:12}}>{BEAMS.length} perfiles disponibles</div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:12,color:"rgba(255,255,255,0.45)",fontWeight:600}}>Ver precios para:</span>
                <div style={{display:"flex",background:"rgba(255,255,255,0.08)",borderRadius:8,padding:3,gap:2}}>
                  {LENGTH_OPTIONS.map(ft=>(
                    <button key={ft} type="button" onClick={()=>setCatLength(ft)} className="tap" style={{padding:"6px 14px",borderRadius:6,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,transition:"all 0.15s",background:catLength===ft?"#16a34a":"transparent",color:catLength===ft?"#ffffff":"rgba(255,255,255,0.5)",minHeight:30}}>{ft} ft</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{background:"linear-gradient(180deg,#1f2937 0%,#111827 100%)",padding:isMobile?"2px 12px 4px":"8px 32px 10px",textAlign:"center",position:"sticky",top:isMobile?56:64,zIndex:20,boxShadow:"0 4px 16px rgba(0,0,0,0.25)",overflow:"hidden",maxHeight:isMobile?140:200}}>
            <div style={{display:"flex",justifyContent:"center",alignItems:"center"}}>
              <BeamSVG hR={catHR} fR={catFR} wR={catWR} ftR={catFTR} size={isMobile?105:160} heightInch={catBeamObj?.height??null} flangeInch={catBeamObj?.flange??null} webInch={catBeamObj?.web??null} flangeTInch={catBeamObj?.flangeT??null}/>
            </div>
            {!catBeamObj && <p style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginTop:2}}>Toca una viga para ver sus dimensiones</p>}
          </div>

          <div style={{flex:1,padding:isMobile?"12px 12px 80px":"16px 20px 40px",maxWidth:640,width:"100%",margin:"0 auto",display:"flex",flexDirection:"column",gap:6}}>
            {catBeams.map((beam,i)=>{
              const weightKg = beam.lbsPerFt * catLength * LBS_TO_KG;
              const price = weightKg * PRICE_PER_KG;
              const isExp = catSelected === beam.id;
              return (
                <div key={beam.id} className="rc" style={{animationDelay:`${Math.min(i,20)*0.02}s`}}>
                  <div onClick={()=>setCatSelected(isExp?null:beam.id)} className="tap" style={{background:"#ffffff",border:`1.5px solid ${isExp?"#16a34a":"#e5e7eb"}`,borderRadius:isExp?"14px 14px 0 0":14,padding:"13px 14px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",userSelect:"none",boxShadow:isExp?"0 2px 8px rgba(22,163,74,0.12)":"0 1px 3px rgba(0,0,0,0.04)"}}>
                    <div style={{width:38,height:38,borderRadius:10,background:isExp?"#f0fdf4":"#f3f4f6",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:isExp?"#15803d":"#374151",fontFamily:"monospace",border:isExp?"1.5px solid #bbf7d0":"none"}}>{beam.heightR}"</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:14,fontWeight:700,color:"#111827",fontFamily:"'JetBrains Mono',monospace",letterSpacing:"-0.02em",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>Viga {beam.name}</div>
                      <div style={{fontSize:11,color:"#9ca3af",marginTop:2}}>{beam.lbsPerFt} lb/ft · {(beam.lbsPerFt*LBS_TO_KG).toFixed(2)} kg/m{beam.flange?` · patín ${beam.flange}"`:""}
                      </div>
                      <div style={{fontSize:9,color:"#9ca3af",marginTop:3,lineHeight:1.4}}>Sujeto a disponibilidad, favor de contactar para revisar tiempos de entrega</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:14,fontWeight:800,color:"#16a34a",fontFamily:"monospace"}}>{fmtPeso(price)}</div>
                      <div style={{fontSize:11,color:"#9ca3af",marginTop:1}}>{Math.round(weightKg)} kg · {catLength} ft</div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{flexShrink:0,transform:isExp?"rotate(90deg)":"none",transition:"transform 0.2s",opacity:0.35}}>
                      <path d="M5 3l4 4-4 4" stroke="#111827" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  {isExp && (
                    <div style={{animation:"fadeUp 0.2s ease",background:"#ffffff",border:"1.5px solid #16a34a",borderTop:"none",borderRadius:"0 0 14px 14px",padding:"16px 14px 18px",boxShadow:"0 4px 12px rgba(0,0,0,0.06)"}}>
                      <div style={{background:"#f3f4f6",border:"1px solid #e5e7eb",borderRadius:10,padding:"14px 16px",marginBottom:14}}>
                        <div style={{fontSize:10,fontWeight:700,color:"#6b7280",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>Precio — {catLength} ft ({(catLength*FT_TO_M).toFixed(1)} m)</div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                          {[["Peso total",`${Math.round(weightKg)} kg`],["$/kg",`$${PRICE_PER_KG} MXN`],["Total c/IVA",fmtPeso(price)]].map(([l,v],j)=>(
                            <div key={l as string}>
                              <div style={{fontSize:10,color:"#6b7280",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:3,fontWeight:600}}>{l}</div>
                              <div style={{fontSize:j===2?17:13,fontWeight:j===2?800:600,color:j===2?"#15803d":"#111827",fontFamily:"monospace",lineHeight:1}}>{v}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{fontSize:11,fontWeight:700,color:"#374151",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:10}}>Especificaciones</div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:14}}>
                        {[
                          ["Peralte (h)",beam.height,null],["Patín (b)",beam.flange,null],
                          ["Esp. Alma (tw)",beam.web,true],["Esp. Patín (tf)",beam.flangeT,true],
                          ["Peso lineal",null,null],["lb/ft + kg/m",null,null],
                        ].map(([lbl],idx)=>{
                          let decVal="",fracVal="",bottom="";
                          if(idx===0){decVal=`${beam.height.toFixed(3)}"`;fracVal=nearestFrac(beam.height);}
                          else if(idx===1){decVal=beam.flange!=null?`${beam.flange.toFixed(3)}"`:"N/D";fracVal=beam.flange!=null?nearestFrac(beam.flange):"";}
                          else if(idx===2){decVal=`${beam.web.toFixed(3)}"`;fracVal=nearestFrac(beam.web);}
                          else if(idx===3){decVal=`${beam.flangeT.toFixed(3)}"`;fracVal=nearestFrac(beam.flangeT);}
                          else if(idx===4){decVal=`${beam.lbsPerFt} lb/ft`;fracVal="";bottom=`${(beam.lbsPerFt*LBS_TO_KG).toFixed(2)} kg/m`;}
                          else return null;
                          return (
                            <div key={lbl as string} style={{background:"#f9fafb",border:"1px solid #e5e7eb",borderRadius:10,padding:"10px 12px"}}>
                              <div style={{fontSize:10,color:"#6b7280",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:5,fontWeight:600}}>{lbl as string}</div>
                              <div style={{display:"flex",alignItems:"baseline",gap:5,flexWrap:"wrap"}}>
                                <span style={{fontSize:12,color:"#374151",fontFamily:"monospace",fontWeight:500}}>{decVal}</span>
                                {fracVal&&<span style={{fontSize:13,fontWeight:800,color:"#111827",fontFamily:"monospace"}}>≈ {fracVal}</span>}
                              </div>
                              {bottom&&<div style={{fontSize:11,color:"#6b7280",fontFamily:"monospace",marginTop:3}}>{bottom}</div>}
                            </div>
                          );
                        }).filter(Boolean)}
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:8}}>
                        <a href={`mailto:contacto@surtiaceros.com?subject=${encodeURIComponent(`Cotización Viga ${beam.name}`)}&body=${encodeURIComponent(`Hola,\n\nMe interesa cotizar:\n\nViga: ${beam.name}\nLongitud: ${catLength} ft (${(catLength*FT_TO_M).toFixed(1)} m)\nPeso estimado: ${Math.round(weightKg)} kg\nPrecio estimado: ${fmtPeso(price)} (c/IVA)\n\nFavor de confirmar disponibilidad y precio final.\n\nGracias.`)}`}
                          className="tap" style={{width:"100%",padding:"12px",background:"#111827",color:"#ffffff",borderRadius:12,fontSize:13,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:7,textDecoration:"none",minHeight:44}}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                          Contactar por correo electrónico
                        </a>
                        <a href={`https://wa.me/526616137040?text=${encodeURIComponent(`Hola Surtiaceros, me interesa cotizar:\n\n*Viga ${beam.name}*\n📏 ${catLength} ft (${(catLength*FT_TO_M).toFixed(1)} m)\n⚖️ ${Math.round(weightKg)} kg\n💰 ${fmtPeso(price)} c/IVA\n\n¿Pueden confirmar disponibilidad?`)}`}
                          target="_blank" rel="noopener noreferrer" className="tap" style={{width:"100%",padding:"12px",background:"#25d366",color:"#ffffff",borderRadius:12,fontSize:13,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:7,textDecoration:"none",minHeight:44}}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.558 4.121 1.532 5.856L.057 23.882l6.198-1.627A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.667-.52-5.184-1.426l-.371-.22-3.681.965.982-3.588-.242-.38A9.937 9.937 0 0 1 2 12C2 6.478 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                          Contactar por WhatsApp
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Shipping info banner ── */}
      <div style={{background:"#f0fdf4",borderTop:"1px solid #bbf7d0",borderBottom:"1px solid #bbf7d0",padding:"14px 20px",marginBottom:0}}>
        <div style={{maxWidth:640,margin:"0 auto",display:"flex",flexDirection:isMobile?"column":"row",gap:isMobile?6:20,alignItems:isMobile?"flex-start":"center"}}>
          <div style={{fontSize:22,flexShrink:0}}>🚚</div>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <span style={{background:"#16a34a",color:"#fff",fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:20,whiteSpace:"nowrap"}}>SIN COSTO</span>
            <span style={{fontSize:13,color:"#166534",fontWeight:600}}>Entregas dentro de Playas de Rosarito y Tijuana, B.C.</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <span style={{background:"#f59e0b",color:"#fff",fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:20,whiteSpace:"nowrap"}}>COSTO ADICIONAL</span>
            <span style={{fontSize:13,color:"#374151"}}>Entregas foráneas, tarifa según destino y volumen</span>
          </div>
        </div>
      </div>

      <footer style={{background:"#111827",borderTop:"1px solid #1f2937",padding:"28px 20px 32px",textAlign:"center",marginBottom:isMobile?"80px":0}}>
        <div style={{marginBottom:20}}>
          <a href="https://surtiaceros.com" target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",flexDirection:"column",alignItems:"center",gap:8,textDecoration:"none"}}>
            <img src="/logo.jpg" alt="Surtiaceros" style={{height:40,width:"auto",objectFit:"contain",opacity:0.85,filter:"brightness(1.1)"}}/>
            <span style={{fontSize:13,color:"#4ade80",fontWeight:600,letterSpacing:"0.02em",borderBottom:"1px solid rgba(74,222,128,0.4)",paddingBottom:1}}>www.surtiaceros.com</span>
          </a>
        </div>
        <div style={{maxWidth:420,margin:"0 auto",display:"flex",flexDirection:"column",gap:5,marginBottom:20}}>
          <p style={{fontSize:13,fontWeight:700,color:"#ffffff",letterSpacing:"-0.01em"}}>Surtiaceros del Pacífico S.A. de C.V.</p>
          <p style={{fontSize:12,color:"rgba(255,255,255,0.55)",lineHeight:1.7}}>Calle Aguascalientes No. 4255, Col. Constitución<br/>Playas de Rosarito, Baja California, C.P. 22707, México</p>
          <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:"4px 16px",marginTop:4}}>
            <a href="tel:6616137038" style={{fontSize:12,color:"#4ade80",textDecoration:"none",fontWeight:500}}>📞 661 613 7038</a>
            <a href="tel:6616137040" style={{fontSize:12,color:"#4ade80",textDecoration:"none",fontWeight:500}}>📞 661 613 7040</a>
            <a href="mailto:contacto@surtiaceros.com" style={{fontSize:12,color:"#4ade80",textDecoration:"none",fontWeight:500}}>✉️ contacto@surtiaceros.com</a>
          </div>
        </div>
        <div style={{height:1,background:"rgba(255,255,255,0.08)",maxWidth:420,margin:"0 auto 18px"}}/>
        <div style={{maxWidth:420,margin:"0 auto",display:"flex",flexDirection:"column",gap:4}}>
          <p style={{fontSize:11,color:"rgba(255,255,255,0.38)",lineHeight:1.7}}>
            El costo de flete está incluido en pedidos con entrega dentro de los municipios de Playas de Rosarito y Tijuana, B.C. Para entregas foráneas, el flete se cotiza por separado según destino y volumen.<br/>
            Los precios mostrados son de referencia. El envío puede tardar de 7 a 10 días hábiles.<br/>
            Favor de contactar a un agente para confirmar disponibilidad.
          </p>
          <p style={{fontSize:11,color:"rgba(255,255,255,0.28)",marginTop:6,lineHeight:1.6}}>
            Aplicación desarrollada por Surtiaceros del Pacífico S.A. de C.V.<br/>
            Todos los derechos reservados © {new Date().getFullYear()}
          </p>
          <p style={{fontSize:10,color:"rgba(255,255,255,0.18)",marginTop:4}}>v2.5</p>
        </div>
      </footer>
    </div>
  );
}
