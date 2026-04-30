import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Volume2, VolumeX, Sparkles, Maximize2, Minimize2 } from 'lucide-react';

interface Props {
  url: string;
  onOpenAI: () => void;
  ytId?: string | null;
}

export const LongFormVideoPlayer: React.FC<Props> = ({ url, onOpenAI, ytId }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 2000);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const updateProgress = () => {
    if (videoRef.current) {
      const percentage = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(percentage);
    }
  };

  const setTime = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const time = (parseFloat(e.target.value) / 100) * videoRef.current.duration;
      videoRef.current.currentTime = time;
      setProgress(parseFloat(e.target.value));
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const setVolumeLevel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      setIsMuted(vol === 0);
    }
  };

  if (ytId) {
    return (
      <div className="relative w-full h-full bg-black flex items-center justify-center">
        <iframe 
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&controls=1&modestbranding=1&rel=0`}
            className="w-full h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
         <div className="absolute top-4 right-4 z-20">
             <button 
                onClick={onOpenAI}
                className="flex items-center gap-2 bg-lumina-gradient text-white px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-widest shadow-[0_5px_15px_rgba(30,144,255,0.3)] animate-pulse"
             >
                <Sparkles size={16} /> AI Analysis
             </button>
         </div>
      </div>
    );
  }

  return (
    <div 
        className="relative w-full h-full overflow-hidden bg-black group"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setShowControls(false)}
    >
      <video 
        ref={videoRef}
        src={url}
        className="w-full h-full object-contain"
        onTimeUpdate={updateProgress}
        onEnded={() => setIsPlaying(false)}
      />
      
      {/* Controls Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 gap-4"
          >
            {/* Progress Bar */}
            <input 
                type="range" 
                min="0" max="100" 
                value={progress} 
                onChange={setTime}
                className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-lumina-blue"
            />
            
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={togglePlay} className="text-white hover:text-lumina-blue transition-all">
                        {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
                    </button>
                    <div className="flex items-center gap-2">
                         <button onClick={toggleMute} className="text-white">
                            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                         </button>
                         <input 
                            type="range" 
                            min="0" max="1" step="0.1"
                            value={volume} 
                            onChange={setVolumeLevel}
                            className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                         />
                    </div>
                </div>

                {/* CTA */}
                <button 
                    onClick={onOpenAI}
                    className="flex items-center gap-2 bg-lumina-gradient text-white px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest shadow-[0_5px_15px_rgba(30,144,255,0.3)] hover:scale-105 transition-all"
                >
                    <Sparkles size={16} /> AI Analysis
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
