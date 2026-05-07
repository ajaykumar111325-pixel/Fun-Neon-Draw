import React, { useState, useCallback, useRef } from 'react';
import { DrawingCanvas } from './components/DrawingCanvas';
import { Toolbar } from './components/Toolbar';
import { NEON_COLORS, BRUSH_SIZES, Point, TRACING_DATA, LearnCategory } from './constants';
import { AppState, Tool } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { audioService } from './services/audioService';

export default function App() {
  const [state, setState] = useState<AppState>({
    color: NEON_COLORS[0].value,
    size: BRUSH_SIZES[1],
    tool: 'brush',
    isRainbow: false,
    history: [],
    isReplaying: false,
    isMusicOn: true,
    isLearnMode: false,
    learnCategory: 'letters',
    learnItem: 'A',
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const toggleMusic = () => {
    setState(s => ({ ...s, isMusicOn: !s.isMusicOn }));
    if (state.isMusicOn) {
      audioService.stopAmbience();
    }
  };

  const handleLearnToggle = () => {
    const nextMode = !state.isLearnMode;
    // Reset interaction states when toggling modes
    setState(s => ({ 
      ...s, 
      isLearnMode: nextMode,
      isReplaying: false, // Ensure replay stops
    }));
    
    if (nextMode) {
      audioService.speak(state.learnItem);
      handleClear(); // Clear canvas when entering learning mode for a clean start
    } else {
      handleClear(); // Clear when returning to draw mode too
    }
  };

  const handleLearnChange = (category: LearnCategory, item: string) => {
    setState(s => ({ ...s, learnCategory: category, learnItem: item }));
    audioService.speak(item);
    handleClear();
  };

  const handleAddPoint = useCallback((point: Point) => {
    setState((s) => ({
      ...s,
      history: [...s.history, point],
    }));
  }, []);

  const handleClear = () => {
    audioService.playClearSound();
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setState((s) => ({ ...s, history: [], isReplaying: false }));
  };

  const handleSave = () => {
    if (!canvasRef.current) return;
    const compositeCanvas = document.createElement('canvas');
    compositeCanvas.width = canvasRef.current.width;
    compositeCanvas.height = canvasRef.current.height;
    const ctx = compositeCanvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, compositeCanvas.width, compositeCanvas.height);
    ctx.drawImage(canvasRef.current, 0, 0);
    const link = document.createElement('a');
    link.download = `fun-neon-drawing-${Date.now()}.png`;
    link.href = compositeCanvas.toDataURL('image/png');
    link.click();
  };

  const handleReplay = () => {
    if (state.history.length === 0) return;
    setState(s => ({ ...s, isReplaying: true }));
  };

  const [isVisible, setIsVisible] = useState(true);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleDrawingStart = () => {
    setIsVisible(false);
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
  };

  const handleDrawingEnd = () => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => {
      setIsVisible(true);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#050505] font-sans select-none overflow-hidden relative">
      {/* Immersive Header (Floating) */}
      <AnimatePresence>
        {isVisible && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="absolute top-0 left-0 right-0 z-40 p-4 flex justify-between items-center bg-black/20 backdrop-blur-sm pointer-events-none"
          >
            <div className="flex items-center gap-3 pointer-events-auto">
              <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center glow-pink scale-75 md:scale-100">
                <span className="text-xl">✏️</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black italic tracking-tighter text-white neon-text-pink drop-shadow-lg">
                FUN NEON <span className="text-blue-400 neon-text-blue">DRAWING</span>
              </h1>
            </div>
            
            <div className="flex gap-4 pointer-events-auto">
              <button 
                onClick={toggleMusic}
                className="bg-zinc-900/60 backdrop-blur-md p-2 px-4 rounded-full flex items-center gap-3 border border-white/10 cursor-pointer active:scale-95 transition-all hover:bg-zinc-800"
              >
                <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Music</span>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${state.isMusicOn ? 'bg-green-500' : 'bg-zinc-600'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${state.isMusicOn ? 'right-0.5' : 'left-0.5'}`}></div>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Workspace */}
      <div className="flex-1 relative">
        <DrawingCanvas
          color={state.color}
          size={state.size}
          tool={state.tool}
          isRainbow={state.isRainbow}
          history={state.history}
          onAddPoint={handleAddPoint}
          isReplaying={state.isReplaying}
          onReplayFinish={() => setState(s => ({ ...s, isReplaying: false }))}
          onClear={handleClear}
          setCanvasRef={(ref) => { canvasRef.current = ref; }}
          isLearnMode={state.isLearnMode}
          learnCategory={state.learnCategory}
          learnItem={state.learnItem}
          isMusicOn={state.isMusicOn}
          onDrawingStart={handleDrawingStart}
          onDrawingEnd={handleDrawingEnd}
        />
        
        <Toolbar
          isVisible={isVisible}
          currentColor={state.color}
          currentSize={state.size}
          currentTool={state.tool}
          isRainbow={state.isRainbow}
          isMusicOn={state.isMusicOn}
          onColorChange={(color) => setState(s => ({ ...s, color, isRainbow: false }))}
          onSizeChange={(size) => setState(s => ({ ...s, size }))}
          onToolChange={(tool) => setState(s => ({ ...s, tool }))}
          onToggleRainbow={() => setState(s => ({ ...s, isRainbow: !s.isRainbow }))}
          onToggleMusic={toggleMusic}
          onClear={handleClear}
          onReplay={handleReplay}
          onSave={handleSave}
          isReplaying={state.isReplaying}
          canvasRef={canvasRef}
          history={state.history}
          onAddPoint={handleAddPoint}
          onReplayFinish={() => setState(s => ({ ...s, isReplaying: false }))}
          isLearnMode={state.isLearnMode}
          onToggleLearn={handleLearnToggle}
          learnCategory={state.learnCategory}
          learnItem={state.learnItem}
          onLearnChange={handleLearnChange}
        />
      </div>

      {/* Mode Switch Flash Effect */}
      <AnimatePresence>
        {(state.isLearnMode || !state.isLearnMode) && (
          <motion.div
            key={state.isLearnMode ? 'learn' : 'draw'}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            className="absolute inset-0 bg-white pointer-events-none z-[100]"
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* Initial Tip */}
      <AnimatePresence>
        {isVisible && state.history.length === 0 && !state.isReplaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          >
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">
              Magic Awaits... Start Drawing
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
