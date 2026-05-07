import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Eraser, 
  Trash2, 
  Play, 
  Download, 
  Paintbrush,
  GraduationCap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { NEON_COLORS, BRUSH_SIZES, Point, TRACING_DATA, LearnCategory } from '../constants';
import { Tool } from '../types';

interface SidebarButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  color: string;
  active?: boolean;
  activeColor?: string;
  className?: string;
  compact?: boolean;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({ onClick, icon, label, color, active, activeColor, className, compact }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className={`
      tool-btn flex flex-col items-center justify-center rounded-full transition-all border-2
      w-12 h-12 md:w-14 md:h-14
      ${active ? (activeColor === 'pink' ? 'border-pink-500 glow-pink bg-pink-500/20' : activeColor === 'blue' ? 'border-blue-500 glow-blue bg-blue-500/20' : 'border-green-500 glow-green bg-green-500/20') : 'border-white/10 bg-zinc-900/40 backdrop-blur-md'}
      ${className}
    `}
    style={{ color: active ? 'white' : color }}
  >
    {React.cloneElement(icon as React.ReactElement, { size: 20 })}
    <span className="text-[7px] text-white/50 font-bold uppercase mt-0.5 hidden md:block">{label}</span>
  </motion.button>
);

interface ToolbarProps {
  isVisible: boolean;
  currentColor: string;
  currentSize: number;
  currentTool: Tool;
  isRainbow: boolean;
  isMusicOn: boolean;
  onColorChange: (color: string) => void;
  onSizeChange: (size: number) => void;
  onToolChange: (tool: Tool) => void;
  onToggleRainbow: () => void;
  onToggleMusic: () => void;
  onClear: () => void;
  onReplay: () => void;
  onSave: () => void;
  isReplaying: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  history: Point[];
  onAddPoint: (point: Point) => void;
  onReplayFinish: () => void;
  isLearnMode: boolean;
  onToggleLearn: () => void;
  learnCategory: LearnCategory;
  learnItem: string;
  onLearnChange: (category: LearnCategory, item: string) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  isVisible,
  currentColor,
  currentSize,
  currentTool,
  isRainbow,
  onColorChange,
  onSizeChange,
  onToolChange,
  onToggleRainbow,
  onClear,
  onReplay,
  onSave,
  isReplaying,
  isLearnMode,
  onToggleLearn,
  learnCategory,
  learnItem,
  onLearnChange
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const currentItems = TRACING_DATA[learnCategory];
  const currentIndex = currentItems.indexOf(learnItem);

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % currentItems.length;
    onLearnChange(learnCategory, currentItems[nextIdx]);
  };

  const handlePrev = () => {
    const prevIdx = (currentIndex - 1 + currentItems.length) % currentItems.length;
    onLearnChange(learnCategory, currentItems[prevIdx]);
  };

  const showUI = isVisible && !isCollapsed;

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {/* Sidebars (Floating) */}
      <AnimatePresence>
        {isVisible && (
          <>
            {/* Left Tools */}
            <motion.div 
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: isCollapsed ? -60 : 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 pointer-events-auto items-center"
            >
              <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-8 h-8 rounded-full bg-zinc-900/60 border border-white/20 flex items-center justify-center text-white mb-2 shadow-lg"
              >
                {isCollapsed ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}
              </button>
              
              {!isCollapsed && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-2">
                  <SidebarButton onClick={onClear} icon={<Trash2 />} label="Clear" color="#fff" />
                  <SidebarButton 
                    onClick={() => onToolChange('eraser')} 
                    active={currentTool === 'eraser'} 
                    icon={<Eraser />} 
                    label="Eraser" 
                    color="#ff00ff" 
                    activeColor="pink" 
                  />
                  <SidebarButton 
                    onClick={() => onToolChange('brush')} 
                    active={currentTool === 'brush'} 
                    icon={<Paintbrush />} 
                    label="Brush" 
                    color="#00d2ff" 
                    activeColor="blue" 
                  />
                  <SidebarButton 
                    onClick={onToggleLearn} 
                    active={isLearnMode} 
                    icon={<GraduationCap />} 
                    label={isLearnMode ? "Draw" : "Learn"} 
                    color="#39ff14" 
                    activeColor="green" 
                  />
                </motion.div>
              )}
            </motion.div>

            {/* Right Tools - Adjusted for better spacing */}
            <motion.div 
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: isCollapsed ? 60 : 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 pointer-events-auto items-center"
            >
              {!isCollapsed && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-2">
                  <SidebarButton 
                    onClick={onReplay} 
                    active={isReplaying} 
                    icon={<Play />} 
                    label="Replay" 
                    color="#fff" 
                    activeColor="green" 
                  />
                  <SidebarButton 
                    onClick={onSave} 
                    icon={<Download />} 
                    label="Save" 
                    color="#fff" 
                  />
                </motion.div>
              )}
            </motion.div>

            {/* Bottom Bar: Lower profile for more drawing space */}
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: isCollapsed ? 80 : 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl bg-zinc-900/60 backdrop-blur-xl rounded-full p-2 px-4 shadow-2xl border border-white/10 pointer-events-auto flex items-center gap-3"
            >
              {isLearnMode ? (
                <div className="flex-1 flex gap-2 overflow-x-auto w-full no-scrollbar px-2 py-1">
                  {(Object.keys(TRACING_DATA) as LearnCategory[]).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => onLearnChange(cat, TRACING_DATA[cat][0])}
                      className={`
                        px-4 py-1.5 rounded-full font-bold uppercase tracking-wider text-[9px] transition-all whitespace-nowrap
                        ${learnCategory === cat ? 'bg-green-500 text-black glow-green scale-105 shadow-lg' : 'bg-white/5 text-zinc-400 border border-white/10'}
                      `}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex justify-between px-2 overflow-x-auto min-w-0 w-full no-scrollbar items-center gap-2 py-1">
                  {NEON_COLORS.map((c) => (
                    <motion.button
                      key={c.value}
                      whileHover={{ scale: 1.25 }}
                      whileTap={{ scale: 0.8 }}
                      onClick={() => onColorChange(c.value)}
                      className={`
                        w-8 h-8 md:w-9 md:h-9 flex-shrink-0 rounded-full border-2 transition-all
                        ${currentColor === c.value && !isRainbow ? 'border-white scale-110 shadow-lg' : 'border-white/10'}
                      `}
                      style={{ 
                        backgroundColor: c.value,
                        boxShadow: currentColor === c.value ? `0 0 15px ${c.value}` : ''
                      }}
                    />
                  ))}
                  <motion.button
                    whileHover={{ scale: 1.25 }}
                    whileTap={{ scale: 0.8 }}
                    onClick={onToggleRainbow}
                    className={`
                      w-8 h-8 md:w-9 md:h-9 flex-shrink-0 rounded-full border-2 transition-all rainbow-grad
                      ${isRainbow ? 'border-white scale-110 shadow-lg' : 'border-white/10'}
                    `}
                  />
                </div>
              )}

              <div className="h-6 w-[1px] bg-white/10 hidden md:block" />

              {/* Brush Sizes - Compact */}
              <div className="w-32 md:w-40 flex items-center gap-2">
                <div className="flex flex-1 justify-around bg-black/40 rounded-full p-0.5 border border-white/5 relative h-7">
                  {BRUSH_SIZES.map((s) => (
                    <button 
                      key={s}
                      onClick={() => onSizeChange(s)}
                      className={`flex-1 flex items-center justify-center rounded-full transition-all z-10 text-[8px] font-bold ${currentSize === s ? 'text-white' : 'text-zinc-500'}`}
                    >
                      {s}
                    </button>
                  ))}
                  <motion.div 
                    layoutId="size-pill"
                    className="absolute h-5 w-[23%] bg-gradient-to-r from-pink-500 to-blue-500 rounded-full shadow-lg top-1"
                    animate={{ left: `${(BRUSH_SIZES.indexOf(currentSize) * 25) + 1}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Tracing Controls Overlay */}
      <AnimatePresence>
        {isLearnMode && showUI && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between pointer-events-none px-6"
          >
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handlePrev}
              className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center text-white pointer-events-auto hover:bg-black/60 transition-colors"
            >
              <ChevronLeft size={24} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleNext}
              className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center text-white pointer-events-auto hover:bg-black/60 transition-colors"
            >
              <ChevronRight size={24} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
