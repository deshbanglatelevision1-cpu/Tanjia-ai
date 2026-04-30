import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, MessageCircle, Share2, Bookmark, Play, Pause, Volume2, VolumeX, 
  Sparkles, Send, X, MoreVertical, ThumbsUp, ThumbsDown, CheckCircle, 
  ArrowLeft, Search, Filter, Plus, UserPlus, PlayCircle, Mail, Users
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';

interface Video {
  id: string;
  creator: {
    id: string;
    name: string;
    avatar: string;
    isSubscribed?: boolean;
  };
  url: string;
  thumbnail: string;
  title: string;
  description: string;
  type: 'short' | 'long';
  qualityLabel?: string;
  durationLabel?: string;
  stats: {
    views: string;
    likes: string;
    comments: string;
  };
  tags: string[];
}

interface CinemaSectionProps {
  viewMode: 'shorts' | 'long' | 'community';
  setViewMode: (mode: 'shorts' | 'long' | 'community') => void;
  videos: Video[];
  user: any;
  searchMode: 'results' | 'ai';
  searchQuery: string;
  onResetSearch: () => void;
  onOpenAI: (video: Video) => void;
  selectedVideo: Video | null;
  onSelectVideo: (video: Video | null) => void;
}

// Dedicated Upload Progress Bar Component
const UploadProgressBar = ({ progress, onCancel }: { progress: number, onCancel: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.9 }}
      className="flex items-center gap-4 glass px-5 py-3 rounded-2xl border-white/10 shadow-2xl relative overflow-hidden"
    >
      {/* Background Animated Glow */}
      <div className="absolute inset-0 bg-lumina-blue/5 animate-pulse" />
      
      <div className="flex flex-col gap-1.5 relative z-10">
        <div className="flex items-center justify-between gap-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-lumina-blue animate-ping" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-lumina-blue">
              {progress < 100 ? 'Neural Syncing...' : 'Upload Complete'}
            </span>
          </div>
          <span className="text-[10px] font-black text-white/60 tracking-wider">{progress}%</span>
        </div>
        
        <div className="w-40 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
           <motion.div 
             className="h-full bg-lumina-gradient relative shadow-[0_0_10px_rgba(30,144,255,0.4)]" 
             initial={{ width: 0 }} 
             animate={{ width: `${progress}%` }} 
             transition={{ type: 'spring', damping: 20, stiffness: 60 }}
           >
             {/* Scanning effect */}
             <motion.div 
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent"
             />
           </motion.div>
        </div>
      </div>

      <button 
        onClick={onCancel}
        className="p-2 transition-all text-white/20 hover:text-white/40 hover:bg-white/5 rounded-xl group relative z-10"
      >
        <X size={16} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>
    </motion.div>
  );
};

export const CinemaSection: React.FC<CinemaSectionProps> = ({ 
  viewMode, setViewMode, videos, user, searchMode, searchQuery, onResetSearch, onOpenAI,
  selectedVideo, onSelectVideo
}) => {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  
  const handleSimulateUpload = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null || prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setUploadProgress(null), 1000);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  if (selectedVideo) {
     return <VideoPlayerController video={selectedVideo} onClose={() => onSelectVideo(null)} onOpenAI={onOpenAI} user={user} />;
  }

  const shorts = videos.filter(v => v.type === 'short');
  const longForm = videos.filter(v => v.type === 'long');
  
  const searchResults = searchQuery 
    ? videos.filter(v => 
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        v.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header Tabs with Upload Link */}
      <div className="flex items-center justify-between mb-8 px-2 overflow-x-auto no-scrollbar relative min-h-[48px]">
        <div className="flex items-center gap-6">
          {searchMode === 'results' ? (
             <motion.button 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               onClick={onResetSearch}
               className="flex items-center gap-2 text-lumina-blue font-bold group"
             >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span>Back to Engine</span>
             </motion.button>
          ) : (
            <>
              <button 
                onClick={() => setViewMode('shorts')}
                className={`text-2xl font-bold transition-all whitespace-nowrap ${viewMode === 'shorts' ? 'text-white scale-110' : 'text-white/40 hover:text-white/60'}`}
              >
                Shorts
              </button>
              <button 
                onClick={() => setViewMode('long')}
                className={`text-2xl font-bold transition-all whitespace-nowrap ${viewMode === 'long' ? 'text-white scale-110' : 'text-white/40 hover:text-white/60'}`}
              >
                Cinema
              </button>
              <button 
                onClick={() => setViewMode('community')}
                className={`text-2xl font-bold transition-all whitespace-nowrap ${viewMode === 'community' ? 'text-white scale-110' : 'text-white/40 hover:text-white/60'}`}
              >
                Community
              </button>
            </>
          )}
        </div>
        
        {/* Upload Simulation */}
        <div className="flex items-center gap-3">
           <AnimatePresence>
             {uploadProgress !== null && (
               <UploadProgressBar 
                 progress={uploadProgress} 
                 onCancel={() => setUploadProgress(null)} 
               />
             )}
           </AnimatePresence>
           <button 
             onClick={handleSimulateUpload}
             className="p-3 glass rounded-2xl text-white/40 hover:text-lumina-blue hover:bg-white/5 transition-all"
             title="Upload Neural Content"
           >
              <Plus size={20} />
           </button>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto no-scrollbar ${viewMode === 'shorts' && searchMode !== 'results' ? 'snap-y snap-mandatory h-[80vh]' : ''}`}>
        {searchMode === 'results' && searchQuery ? (
          <div className="flex flex-col gap-6 pb-24">
             <div className="flex items-center justify-between px-2 mb-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-white/40">Search Results for "{searchQuery}"</h3>
                <div className="flex items-center gap-2 text-[10px] font-bold text-lumina-blue">
                   <span>{searchResults.length} Results</span>
                   <div className="w-1 h-1 rounded-full bg-lumina-blue" />
                   <span>Neural Index</span>
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map(video => (
                  <motion.div 
                    key={video.id}
                    layoutId={`video-${video.id}`}
                    onClick={() => onSelectVideo(video)}
                    className="glass p-4 rounded-[32px] border-white/5 hover:border-lumina-blue/30 transition-all group relative overflow-hidden cursor-pointer"
                  >
                    <div className="relative aspect-video rounded-2xl overflow-hidden mb-4">
                       <img src={video.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl">
                            <Play fill="currentColor" size={20} className="ml-1" />
                          </div>
                       </div>
                       <div className="absolute bottom-2 right-2 flex gap-1 items-center">
                          {video.qualityLabel && (
                            <div className="px-2 py-1 bg-lumina-blue/80 backdrop-blur-md rounded-lg text-[8px] font-black text-white border border-white/20">
                               {video.qualityLabel}
                            </div>
                          )}
                          <div className="px-2 py-1 glass rounded-lg text-[10px] font-black text-white">
                             {video.durationLabel || (video.type === 'short' ? '0:60' : '4:20')}
                          </div>
                       </div>
                    </div>
                    <h4 className="font-bold text-white mb-2 line-clamp-1 group-hover:text-lumina-blue transition-colors">{video.title}</h4>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-lumina-gradient" />
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Neural AI</span>
                       </div>
                       <span className="text-[10px] font-black text-white/20">{video.stats.views} Views</span>
                    </div>
                  </motion.div>
                ))}
             </div>
             {searchResults.length === 0 && (
               <div className="flex flex-col items-center justify-center py-20 opacity-20">
                  <Search size={40} className="mb-4" />
                  <p className="text-xs font-bold uppercase tracking-widest">No neural matches found</p>
               </div>
             )}
          </div>
        ) : viewMode === 'shorts' ? (
          <div className="flex flex-col items-center pb-40">
            {shorts.map(video => (
              <div key={video.id} className="snap-start snap-always w-full min-h-[80vh] flex justify-center py-4">
                <ShortsCard video={video} onOpenAI={onOpenAI} onSelect={() => onSelectVideo(video)} />
              </div>
            ))}
          </div>
        ) : viewMode === 'long' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-32 px-2">
            {longForm.map(video => (
              <LongFormCard key={video.id} video={video} onOpenAI={onOpenAI} onClick={() => onSelectVideo(video)} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-6 pb-20 max-w-2xl mx-auto w-full">
            {/* Community logic stays similar but themed */}
             <div className="glass p-6 rounded-[32px] border-white/10 mb-8">
                <div className="flex gap-4 mb-4">
                   <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10">
                      {user ? <img src={user.photoURL} alt="" /> : <div className="w-full h-full bg-lumina-gradient" />}
                   </div>
                   <textarea 
                     placeholder={user ? `What's your AI vision, ${user.displayName?.split(' ')[0]}?` : "Sign in to post your AI vision..."}
                     disabled={!user}
                     className="flex-1 bg-transparent border-none text-white focus:outline-none resize-none pt-2"
                     rows={3}
                   />
                </div>
                <div className="flex justify-between items-center border-t border-white/5 pt-4">
                   <div className="flex gap-4">
                      <button className="p-2 text-white/40 hover:text-lumina-blue"><Search size={20} /></button>
                      <button className="p-2 text-white/40 hover:text-lumina-blue"><Filter size={20} /></button>
                      <button className="p-2 text-white/40 hover:text-lumina-blue"><Plus size={20} /></button>
                   </div>
                   <button className="bg-lumina-gradient text-white px-6 py-2 rounded-full font-bold text-sm shadow-xl shadow-lumina-blue/20">
                      Post
                   </button>
                </div>
             </div>

             <div className="space-y-6">
                {[1,2,3].map(i => (
                  <div key={i} className="glass p-8 rounded-[40px] border-white/5">
                     <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10" />
                        <div>
                           <div className="font-bold text-white">Neural Architect {i}</div>
                           <div className="text-[10px] text-white/20 uppercase font-black tracking-widest">2 hours ago</div>
                        </div>
                     </div>
                     <p className="text-white/60 leading-relaxed mb-6">
                        Just deployed the latest adaptive bitrate protocol. The streaming quality on 5G is absolutely insane! 🚀 #NeuralCinema #FutureTech
                     </p>
                     <div className="flex gap-8 border-t border-white/5 pt-6">
                        <button className="flex items-center gap-2 text-white/40 hover:text-lumina-blue group">
                           <Heart size={18} className="group-hover:fill-current" />
                           <span className="text-xs font-bold">1.2K</span>
                        </button>
                        <button className="flex items-center gap-2 text-white/40 hover:text-lumina-blue">
                           <MessageCircle size={18} />
                           <span className="text-xs font-bold">450</span>
                        </button>
                        <button className="flex items-center gap-2 text-white/40 hover:text-lumina-blue">
                           <Share2 size={18} />
                        </button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const getYoutubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Dynamic VideoPlayerController: Switches between 16:9 and 9:16 layout
const VideoPlayerController = ({ video, onClose, onOpenAI, user }: { video: Video, onClose: () => void, onOpenAI: (v: Video) => void, user: FirebaseUser | null }) => {
  const isShort = video.type === 'short';
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const ytId = getYoutubeId(video.url);

  useEffect(() => {
    // Check if user is already subscribed (mock logic for now or fetch from Firestore)
    const checkSub = async () => {
      if (!user) return;
      const userRef = doc(db, 'users', user.uid);
      try {
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const subs = snap.data().subscribedTo || [];
          setIsSubscribed(subs.includes(video.creator.id));
        }
      } catch (e) {
        console.error("Subscription check failed", e);
      }
    };
    checkSub();
  }, [user, video.creator.id]);

  const toggleSubscription = async () => {
    if (!user) {
      alert("Please sign in to subscribe to neural creators.");
      return;
    }
    
    setIsSyncing(true);
    const userRef = doc(db, 'users', user.uid);
    try {
      const snap = await getDoc(userRef);
      const currentSubs = snap.exists() ? (snap.data().subscribedTo || []) : [];
      let newSubs;
      
      if (isSubscribed) {
        newSubs = currentSubs.filter((id: string) => id !== video.creator.id);
      } else {
        newSubs = [...currentSubs, video.creator.id];
      }
      
      await setDoc(userRef, {
        subscribedTo: newSubs,
        lastSync: serverTimestamp()
      }, { merge: true });
      
      setIsSubscribed(!isSubscribed);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isShort) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black flex flex-col items-center"
      >
        <div className="relative w-full max-w-[500px] h-full">
           {ytId ? (
             <iframe 
               src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${ytId}`}
               className="w-full h-full object-cover"
               allow="autoplay; encrypted-media"
               allowFullScreen
             />
           ) : (
             <video 
                ref={videoRef}
                src={video.url}
                className="w-full h-full object-cover"
                autoPlay
                loop
                playsInline
                onClick={() => setIsPlaying(!isPlaying)}
             />
           )}
           
           {/* Top Controls */}
           <div className="absolute top-8 left-6 right-6 flex justify-between items-center z-10">
              <button onClick={onClose} className="p-3 glass rounded-2xl text-white">
                <ArrowLeft size={24} />
              </button>
              <div className="flex gap-3">
                 <button onClick={() => setIsMuted(!isMuted)} className="p-3 glass rounded-2xl text-white">
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                 </button>
              </div>
           </div>

           {/* Bottom Right Actions - Transparent Overlays */}
           <div className="absolute right-4 bottom-32 flex flex-col gap-6 items-center z-20">
              <div className="flex flex-col items-center gap-1 group">
                 <button className="p-4 bg-white/10 backdrop-blur-xl rounded-full text-white border border-white/10 shadow-xl group-active:scale-95 transition-all">
                    <Heart size={28} className="text-lumina-pink fill-current shadow-[0_0_15px_rgba(255,105,180,0.5)]" />
                 </button>
                 <span className="text-[10px] font-black text-white shadow-lg">{video.stats.likes}</span>
              </div>
              <div className="flex flex-col items-center gap-1 group">
                 <button className="p-4 bg-white/10 backdrop-blur-xl rounded-full text-white border border-white/10 shadow-xl group-active:scale-95 transition-all">
                    <MessageCircle size={28} />
                 </button>
                 <span className="text-[10px] font-black text-white shadow-lg">{video.stats.comments}</span>
              </div>
              <button className="p-4 bg-white/10 backdrop-blur-xl rounded-full text-white border border-white/10 shadow-xl group-active:scale-95 transition-all">
                 <Share2 size={28} />
              </button>
              <button 
                onClick={() => onOpenAI(video)}
                className="p-4 bg-lumina-gradient rounded-full text-white shadow-[0_0_20px_rgba(30,144,255,0.4)] animate-pulse"
              >
                 <Sparkles size={28} />
              </button>
           </div>

           {/* Brand & Detail Overlay (Bottom) */}
           <div className="absolute left-6 right-20 bottom-12 z-20 text-white">
              <div className="flex items-center gap-3 mb-4">
                 <img src={video.creator.avatar} className="w-12 h-12 rounded-full border-2 border-lumina-blue/50" alt="" />
                 <div>
                    <h4 className="font-black text-lg">@{video.creator.name}</h4>
                    <button className="text-[10px] font-black text-lumina-blue uppercase tracking-widest bg-lumina-blue/10 px-2 rounded">Subscribe</button>
                 </div>
              </div>
              <h3 className="text-xl font-bold mb-2 leading-tight">{video.title}</h3>
              <p className="text-xs text-white/60 line-clamp-2 mb-3">{video.description}</p>
              <div className="flex flex-wrap gap-2 text-[10px] uppercase font-black text-lumina-pink">
                 {video.tags.map(t => <span key={t}>#{t}</span>)}
              </div>
           </div>
        </div>
      </motion.div>
    );
  }

  // Long Form Professional Layout (YouTube-style nested View)
  return (
    <motion.div 
      initial={{ opacity: 0, y: 100 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="flex flex-col h-full rounded-t-[40px] overflow-hidden bg-[#050505] shadow-[0_-50px_100px_rgba(0,0,0,0.5)]"
    >
      {/* 16:9 Video Player at Top */}
      <div className="relative aspect-video w-full bg-black shrink-0 border-b border-white/5">
        {ytId ? (
          <iframe 
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&controls=1&modestbranding=1&rel=0`}
            className="w-full h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : (
          <video 
            ref={videoRef}
            src={video.url}
            className="w-full h-full object-contain"
            autoPlay
            controls
            playsInline
          />
        )}
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 p-3 bg-black/40 hover:bg-black/60 backdrop-blur-xl rounded-full text-white z-10 border border-white/10 transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* Info & Description Section below (Scrollable) */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-40">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8 space-y-8">
           
           {/* Metadata Area */}
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.2 }}
             className="space-y-4"
           >
              <div className="flex flex-wrap gap-2">
                 {video.tags.map(t => (
                   <span key={t} className="text-[10px] text-lumina-blue font-black uppercase tracking-[0.2em] px-3 py-1 bg-lumina-blue/10 rounded-full border border-lumina-blue/20">
                     #{t}
                   </span>
                 ))}
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
                {video.title}
              </h1>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-4 border-b border-white/5">
                 <div className="flex items-center gap-2 text-sm text-white/40 font-bold">
                    <span className="flex items-center gap-1.5"><Play size={14} className="fill-current" /> {video.stats.views} Views</span>
                    <span className="w-1 h-1 rounded-full bg-white/10" />
                    <span>2 days ago</span>
                 </div>
                 <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
                    <button className="flex items-center gap-2 px-6 py-2.5 glass rounded-2xl text-white font-black text-[10px] uppercase hover:bg-white/10 transition-all border border-white/5 shadow-xl">
                       <ThumbsUp size={16} /> {video.stats.likes}
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 glass rounded-2xl text-white font-black text-[10px] uppercase hover:bg-white/10 transition-all border border-white/5 shadow-xl">
                       <Share2 size={16} /> Share
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 glass rounded-2xl text-white font-black text-[10px] uppercase hover:bg-white/10 transition-all border border-white/5 shadow-xl">
                       <Bookmark size={16} /> Save
                    </button>
                    <button className="flex items-center justify-center w-[46px] h-[46px] glass rounded-2xl text-white hover:bg-white/10 transition-all border border-white/5 shadow-xl">
                       <MoreVertical size={18} />
                    </button>
                 </div>
              </div>
           </motion.div>

           {/* Channel Interactions */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="flex items-center justify-between p-6 bg-white/[0.03] backdrop-blur-3xl rounded-[32px] border border-white/5 shadow-2xl"
           >
              <div className="flex items-center gap-5">
                 <div className="relative group">
                   <div className="absolute inset-0 bg-lumina-blue/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                   <img src={video.creator.avatar} className="w-16 h-16 rounded-full border-2 border-white/10 shrink-0 relative z-10" alt="" />
                 </div>
                 <div>
                    <div className="flex items-center gap-2">
                       <h3 className="font-black text-white text-xl">{video.creator.name}</h3>
                       <div className="p-1 bg-lumina-blue/20 rounded-lg">
                          <CheckCircle size={14} className="text-lumina-blue" />
                       </div>
                    </div>
                    <span className="text-xs text-white/40 font-medium tracking-wide">
                      {isSubscribed ? 'Loyal Neural Member' : '1.2M Neural Citizens'}
                    </span>
                 </div>
              </div>
              <button 
                onClick={toggleSubscription}
                disabled={isSyncing}
                className={`px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-500 relative overflow-hidden group ${
                  isSubscribed 
                  ? 'bg-white/10 text-white border border-white/10 hover:bg-white/20' 
                  : 'bg-lumina-gradient text-white shadow-[0_15px_30px_rgba(255,105,180,0.2)] hover:shadow-[0_20px_40px_rgba(30,144,255,0.4)] hover:scale-105 active:scale-95'
                }`}
              >
                 <span className="relative z-10 flex items-center gap-2">
                   {isSyncing ? (
                     <>
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Syncing</span>
                     </>
                   ) : isSubscribed ? 'Subscribed' : 'Join Network'}
                 </span>
                 {!isSubscribed && (
                   <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                 )}
              </button>
           </motion.div>

           {/* Metadata Box */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.4 }}
             className="p-8 bg-white/[0.02] border border-white/5 rounded-[40px] shadow-inner"
           >
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-1.5 h-6 bg-lumina-blue rounded-full shadow-[0_0_10px_#1e90ff]" />
                 <h4 className="text-xs font-black uppercase text-white tracking-[0.3em]">Neural Transcript</h4>
              </div>
              <p className="text-white/60 leading-relaxed text-base">
                {video.description}
              </p>
              
              <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-6">
                 <div>
                    <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Resolution</div>
                    <div className="text-xs font-black text-lumina-blue">{video.qualityLabel || '4K NEURAL'}</div>
                 </div>
                 <div>
                    <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Interpolation</div>
                    <div className="text-xs font-black text-lumina-blue">Adaptive AI v4</div>
                 </div>
                 <div>
                    <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Audio Sync</div>
                    <div className="text-xs font-black text-lumina-blue">Lossless Spatial</div>
                 </div>
                 <div>
                    <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Render Date</div>
                    <div className="text-xs font-black text-lumina-blue">April 2026</div>
                 </div>
              </div>
           </motion.div>

           {/* Enhanced Comments Section */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.5 }}
             className="space-y-8"
           >
              <div className="flex items-center justify-between">
                 <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                   Neural Feed 
                   <span className="text-sm font-bold text-white/20 bg-white/5 px-3 py-1 rounded-lg border border-white/5">{video.stats.comments}</span>
                 </h3>
                 <button className="text-xs font-black text-lumina-blue uppercase tracking-widest flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <Filter size={16} /> Sort by Relevance
                 </button>
              </div>

              <div className="flex gap-4 p-6 bg-white/[0.03] border border-white/5 rounded-[32px] focus-within:border-lumina-blue/30 transition-all group">
                 <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-white/10 group-focus-within:border-lumina-blue/50">
                    <img src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'guest'}`} className="w-full h-full object-cover" alt="" />
                 </div>
                 <div className="flex-1 space-y-4">
                    <textarea 
                      placeholder="Share your neural insight..."
                      className="w-full bg-transparent border-none text-white focus:outline-none resize-none text-sm placeholder:text-white/20 pt-3"
                      rows={1}
                    />
                    <div className="flex justify-end pt-2">
                       <button className="px-6 py-2 bg-lumina-blue/10 text-lumina-blue border border-lumina-blue/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-lumina-blue hover:text-white transition-all">
                          Inject Comment
                       </button>
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 {[1,2,3].map(i => (
                   <motion.div 
                     key={i} 
                     initial={{ opacity: 0, x: -10 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     viewport={{ once: true }}
                     className="flex gap-5 p-6 rounded-[32px] hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5"
                   >
                      <div className="w-12 h-12 rounded-full bg-lumina-gradient border-2 border-white/5 shrink-0 shadow-lg" />
                      <div className="flex-1 space-y-2">
                         <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-white hover:text-lumina-blue cursor-pointer">NeuralExplorer_{i}88</span>
                            <span className="text-[10px] text-white/20 font-bold uppercase tracking-tighter">4 hours ago</span>
                            <div className="p-0.5 bg-lumina-blue/10 text-lumina-blue rounded text-[8px] font-black tracking-[0.1em] uppercase px-1.5">Alpha Member</div>
                         </div>
                         <p className="text-sm text-white/60 leading-relaxed max-w-2xl">
                           The cinematic color grading on the masterclass segments is breathtaking. It feels like every frame has been meticulously tuned for high dynamic range. Tanjia v2 is really pushing the boundaries of what's possible.
                         </p>
                         <div className="flex gap-6 pt-3">
                            <button className="flex items-center gap-2 text-[10px] font-black text-white/20 hover:text-lumina-pink transition-colors">
                               <Heart size={14} /> 128
                            </button>
                            <button className="flex items-center gap-2 text-[10px] font-black text-white/20 hover:text-lumina-blue transition-colors">
                               <MessageCircle size={14} /> Reply
                            </button>
                         </div>
                      </div>
                   </motion.div>
                 ))}
              </div>
           </motion.div>
        </div>
      </div>
      
      {/* Floating Sparkles for AI Interaction */}
      <AnimatePresence>
        <motion.button 
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onOpenAI(video)}
          className="fixed bottom-32 right-8 p-5 bg-lumina-gradient rounded-full text-white shadow-[0_20px_50px_rgba(255,105,180,0.4)] z-50 border border-white/20"
        >
          <Sparkles size={32} />
          <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-white rounded-full blur-xl"
          />
        </motion.button>
      </AnimatePresence>
    </motion.div>
  );
};


const ShortsCard = ({ video, onOpenAI, onSelect }: { video: Video, onOpenAI: (v: Video) => void, onSelect: () => void }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const ytId = getYoutubeId(video.url);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p || 0);
    }
  };

  const resetControlsTimer = () => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
  };

  useEffect(() => {
    resetControlsTimer();
    return () => {
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {});
          setIsPlaying(true);
        } else {
          videoRef.current?.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.6 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      resetControlsTimer();
    }
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    resetControlsTimer();
    setIsMuted(!isMuted);
  };

  return (
    <div 
      ref={containerRef} 
      onClick={(e) => {
        if (showControls) {
          onSelect();
        } else {
          resetControlsTimer();
        }
      }}
      onMouseMove={resetControlsTimer}
      className="relative w-full max-w-[400px] h-[80vh] min-h-[600px] max-h-[850px] bg-black rounded-[40px] overflow-hidden shadow-2xl border border-white/10 group cursor-pointer"
    >
      {ytId ? (
        <img 
          src={video.thumbnail} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          alt="" 
        />
      ) : (
        <video 
          ref={videoRef}
          src={video.url}
          onTimeUpdate={handleTimeUpdate}
          className="w-full h-full object-cover"
          loop
          muted={isMuted}
          playsInline
        />
      )}

      {/* Play/Pause Central Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 pointer-events-none"
          >
            <div className="relative group/btn pointer-events-auto">
              {/* Circular Progress Bar */}
              <svg className="absolute -inset-2 -rotate-90 w-[calc(100%+16px)] h-[calc(100%+16px)] pointer-events-none">
                <circle
                  cx="50%"
                  cy="50%"
                  r="48%"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeOpacity="0.1"
                />
                <motion.circle
                  cx="50%"
                  cy="50%"
                  r="48%"
                  fill="none"
                  stroke="url(#progress-gradient-shorts)"
                  strokeWidth="2"
                  strokeDasharray="100 100"
                  pathLength="100"
                  initial={{ strokeDashoffset: 100 }}
                  animate={{ strokeDashoffset: 100 - progress }}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
                <defs>
                   <linearGradient id="progress-gradient-shorts" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ff69b4" />
                      <stop offset="100%" stopColor="#1e90ff" />
                   </linearGradient>
                </defs>
              </svg>

              <motion.button 
                whileTap={{ scale: 0.8 }}
                onClick={togglePlay}
                className="p-6 bg-white/20 backdrop-blur-3xl rounded-full border border-white/30 text-white shadow-2xl relative z-10"
              >
                {isPlaying ? <Pause fill="currentColor" size={32} /> : <Play fill="currentColor" size={32} className="ml-1" />}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mute Toggle Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-8 right-8 z-30"
          >
            <button 
              onClick={toggleMute}
              className="p-3 glass rounded-2xl text-white border border-white/10 hover:bg-white/20 transition-all"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-8 pointer-events-none">
         <div className="flex items-center gap-3 mb-4">
            <img src={video.creator.avatar} className="w-10 h-10 rounded-full border border-white/20" alt="" />
            <span className="font-bold text-white uppercase text-[10px] tracking-widest">{video.creator.name}</span>
         </div>
         <h3 className="text-white text-lg font-black mb-2 line-clamp-1">{video.title}</h3>
      </div>
      <div className="absolute bottom-8 right-6">
         <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-3xl border border-white/20 flex items-center justify-center text-white">
            <Sparkles size={20} className="text-lumina-blue" />
         </div>
      </div>
    </div>
  );
};

const LongFormCard = ({ video, onOpenAI, onClick }: { video: Video, onOpenAI: (v: Video) => void, onClick: () => void }) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white/[0.02] border border-white/5 rounded-[40px] overflow-hidden group/card shadow-2xl transition-all hover:bg-white/[0.05]"
    >
      <div className="relative aspect-video">
        <img src={video.thumbnail} className="w-full h-full object-cover transition-transform duration-1000 group-hover/card:scale-110" alt="" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white scale-75 group-hover/card:scale-100 transition-transform duration-300">
            <Play fill="currentColor" size={24} className="ml-1" />
          </div>
        </div>
        
        {/* Cinematic Labels */}
        <div className="absolute top-4 left-4 flex gap-2">
           {video.qualityLabel && (
             <div className="px-3 py-1 bg-lumina-blue/20 backdrop-blur-md border border-lumina-blue/30 rounded-lg text-[10px] font-black text-lumina-blue tracking-tighter uppercase">
                {video.qualityLabel} CINEMA
             </div>
           )}
        </div>
        
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10 shadow-lg">
          {video.durationLabel || '12:45'}
        </div>
      </div>
      <div className="p-8 space-y-4">
        <div className="flex gap-5">
          <div className="relative shrink-0">
            <img src={video.creator.avatar} className="w-12 h-12 rounded-full border-2 border-white/10 shadow-2xl transition-transform group-hover/card:scale-110" alt="" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-lumina-blue rounded-full border-2 border-[#050505] flex items-center justify-center">
               <CheckCircle size={10} className="text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-black text-white line-clamp-2 leading-tight group-hover/card:text-lumina-blue transition-colors tracking-tight">
              {video.title}
            </h3>
            <div className="flex items-center gap-2 mt-2">
               <span className="text-white/40 text-xs font-bold uppercase tracking-widest">{video.creator.name}</span>
               <span className="w-1 h-1 rounded-full bg-white/10" />
               <span className="text-white/20 text-xs font-medium">{video.stats.views} Views</span>
            </div>
          </div>
          <button 
            onClick={() => onOpenAI(video)}
            className="self-start p-3 bg-white/[0.05] rounded-2xl text-white/40 hover:text-white hover:bg-lumina-blue/20 transition-all border border-transparent hover:border-lumina-blue/30 active:scale-95"
          >
            <Sparkles size={22} />
          </button>
        </div>
        <p className="text-white/40 text-sm line-clamp-2 leading-relaxed font-medium">
          {video.description}
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
           {video.tags.map(t => (
             <span key={t} className="text-[10px] text-white/30 font-bold uppercase tracking-widest px-4 py-1.5 bg-white/5 rounded-full border border-white/5 hover:bg-white/10 transition-colors">
                {t}
             </span>
           ))}
        </div>
      </div>
    </motion.div>
  );
};

export const InboxSection = ({ user }: { user: any }) => {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [inboxTab, setInboxTab] = useState<'private' | 'global'>('private');
  const [message, setMessage] = useState('');
  const [globalMessages, setGlobalMessages] = useState([
    { id: '1', user: 'NeuralCore', text: 'Has anyone seen the new AI documentary?', time: '10:42 AM' },
    { id: '2', user: 'CyberTanjia', text: 'The vertical shorts engine is smooth as silk!', time: '10:45 AM' },
    { id: '3', user: 'NexusDev', text: 'Does anyone have the link to the open-source neural script?', time: '11:02 AM' },
  ]);

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 glass p-20 rounded-[40px] border-white/5 opacity-40">
        <Mail size={80} strokeWidth={1} />
        <p className="text-xl font-light text-white">Sign in to access your neural inbox</p>
      </div>
    );
  }

  const users = [
    { id: 'u1', name: 'CyberTanjia', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tanjia', lastMsg: 'The new script is ready! Check it out.', time: '2m ago' },
    { id: 'u2', name: 'NeuralCore', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Core', lastMsg: 'Can you summarize the space documentary?', time: '1h ago' },
    { id: 'u3', name: 'DesignDev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Design', lastMsg: 'Joined the cinema crew!', time: '3h ago' },
  ];

  return (
    <div className="flex h-full glass-dark rounded-[40px] border border-white/5 overflow-hidden">
      {/* Sidebar List */}
      <div className="w-full md:w-80 border-r border-white/5 flex flex-col">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">{inboxTab === 'private' ? 'Inbox' : 'Neural Hub'}</h2>
            {inboxTab === 'private' && <button className="p-2 glass rounded-xl text-white/40"><Plus size={16} /></button>}
          </div>
          <div className="flex p-1 glass rounded-2xl border-white/5">
            <button 
              onClick={() => setInboxTab('private')} 
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${inboxTab === 'private' ? 'bg-white/10 text-white' : 'text-white/20'}`}
            >
              Private
            </button>
            <button 
              onClick={() => setInboxTab('global')} 
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${inboxTab === 'global' ? 'bg-white/10 text-white' : 'text-white/20'}`}
            >
              Global
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {inboxTab === 'private' ? users.map(u => (
            <button 
              key={u.id}
              onClick={() => setSelectedUser(u.id)}
              className={`w-full p-6 flex gap-4 transition-all hover:bg-white/5 border-b border-white/5 ${selectedUser === u.id ? 'bg-white/5' : ''}`}
            >
              <div className="relative">
                <img src={u.avatar} className="w-12 h-12 rounded-full border border-white/10" alt="" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-white truncate">{u.name}</span>
                  <span className="text-[10px] text-white/20">{u.time}</span>
                </div>
                <p className="text-xs text-white/40 truncate">{u.lastMsg}</p>
              </div>
            </button>
          )) : (
            <div className="p-6 space-y-6">
              {globalMessages.map(msg => (
                <div key={msg.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="w-8 h-8 rounded-full bg-lumina-gradient shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-white">{msg.user}</span>
                      <span className="text-[8px] text-white/20 font-black">{msg.time}</span>
                    </div>
                    <div className="glass p-3 rounded-2xl rounded-tl-none border-white/5">
                      <p className="text-xs text-white/80 leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="hidden md:flex flex-1 flex-col bg-black/20">
        {selectedUser || inboxTab === 'global' ? (
          <>
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/10">
              <div className="flex items-center gap-4">
                {inboxTab === 'global' ? (
                  <div className="w-10 h-10 rounded-full bg-lumina-gradient animate-pulse flex items-center justify-center">
                    <Users size={20} className="text-white" />
                  </div>
                ) : (
                  <img src={users.find(u => u.id === selectedUser)?.avatar} className="w-10 h-10 rounded-full" alt="" />
                )}
                <div>
                   <h3 className="font-bold text-white text-lg">{inboxTab === 'global' ? 'Neural Collective' : users.find(u => u.id === selectedUser)?.name}</h3>
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-lumina-blue">Live Neural Stream</span>
                   </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2.5 glass-dark rounded-xl text-white/40 hover:text-white"><Search size={20} /></button>
                <button className="p-2.5 glass-dark rounded-xl text-white/40 hover:text-white"><MoreVertical size={20} /></button>
              </div>
            </div>
            
            <div className="flex-1 p-8 space-y-6 overflow-y-auto no-scrollbar">
               <div className="flex justify-center mb-8">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 px-4 py-2 border border-white/5 rounded-full">Secure Neural Transmission Active</span>
               </div>
               
               {inboxTab === 'private' ? (
                 <>
                   <ChatMessage side="left" text="Assalamu Alaikum! The new cinema engine looks incredible." time="10:05 AM" />
                   <ChatMessage side="right" text="Walaikum Assalam! Thanks! Working on the Shorts PageView right now." time="10:06 AM" />
                   <ChatMessage side="left" text="Can't wait to see the final render. Let me know if you need help with the API." time="10:07 AM" />
                 </>
               ) : (
                 <div className="space-y-6">
                    {globalMessages.map((m, i) => (
                       <div key={m.id} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-[70%] glass p-4 rounded-3xl border-white/10 ${i % 2 === 0 ? 'rounded-tl-none bg-white/5' : 'rounded-tr-none bg-lumina-blue/10 border-lumina-blue/20'}`}>
                             <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold text-white/40 uppercase">{m.user}</span>
                             </div>
                             <p className="text-sm text-white/80">{m.text}</p>
                             <div className="mt-2 text-right">
                                <span className="text-[8px] font-black text-white/20">{m.time}</span>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
               )}
            </div>

            <div className="p-6 bg-black/40 backdrop-blur-3xl">
              <div className="relative group">
                <input 
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Transmit neural message..."
                  className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 pr-20 text-white focus:outline-none focus:border-lumina-blue/50 transition-all shadow-inner"
                  onKeyDown={(e) => e.key === 'Enter' && setMessage('')}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                   <button className="p-2 text-white/20 hover:text-lumina-blue transition-colors">
                      <Sparkles size={18} />
                   </button>
                   <button 
                     onClick={() => setMessage('')}
                     className="w-12 h-12 bg-lumina-gradient rounded-[20px] flex items-center justify-center text-white shadow-xl active:scale-95 transition-all group-hover:shadow-lumina-blue/20"
                   >
                     <Send size={20} />
                   </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 opacity-20">
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}>
              <MessageCircle size={100} strokeWidth={1} />
            </motion.div>
            <p className="text-xl font-light uppercase tracking-[0.4em]">Select Neural Node</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ChatMessage = ({ side, text, time }: { side: 'left' | 'right', text: string, time: string }) => (
  <div className={`flex ${side === 'right' ? 'justify-end' : 'justify-start'}`}>
    <div className={`max-w-[70%] p-5 rounded-[24px] ${side === 'right' ? 'bg-lumina-gradient text-white rounded-tr-none' : 'glass-dark text-white rounded-tl-none'} shadow-xl`}>
      <p className="leading-relaxed">{text}</p>
      <span className={`text-[10px] mt-2 block ${side === 'right' ? 'text-white/60' : 'text-white/20'}`}>{time}</span>
    </div>
  </div>
);
