import { Point, LearnCategory } from './constants';

export type Tool = 'brush' | 'eraser';

export interface AppState {
  color: string;
  size: number;
  tool: Tool;
  isRainbow: boolean;
  history: Point[];
  isReplaying: boolean;
  isMusicOn: boolean;
  isLearnMode: boolean;
  learnCategory: LearnCategory;
  learnItem: string;
}
