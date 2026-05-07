/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Point {
  x: number;
  y: number;
  color: string;
  size: number;
  timestamp: number;
  isNewStroke?: boolean;
}

export const NEON_COLORS = [
  { name: 'Blue', value: '#00f2ff', glow: '#00f2ff' },
  { name: 'Pink', value: '#ff007f', glow: '#ff007f' },
  { name: 'Green', value: '#39ff14', glow: '#39ff14' },
  { name: 'Yellow', value: '#fff01f', glow: '#fff01f' },
  { name: 'Purple', value: '#bc13fe', glow: '#bc13fe' },
];

export const BRUSH_SIZES = [5, 12, 24, 48];

export const TRACING_DATA = {
  letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  numbers: "0123456789".split(""),
  shapes: ["Circle", "Square", "Triangle", "Star", "Heart"],
  hindi: ["अ", "आ", "इ", "ई", "उ", "ऊ", "ए", "ऐ", "ओ", "औ", "क", "ख", "ग", "घ"],
};

export type LearnCategory = keyof typeof TRACING_DATA;
