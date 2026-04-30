import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, MessageCircle, Share2, Bookmark, Play, Pause, Volume2, VolumeX, 
  Sparkles, Send, X, MoreVertical, ThumbsUp, ThumbsDown, CheckCircle, 
  ArrowLeft, Search, Filter, Plus, UserPlus, PlayCircle, Mail
} from 'lucide-react';

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
}

export const CinemaSection: React.FC<CinemaSectionProps> = ({ viewMode, setViewMode, videos, user, searchMode, searchQuery, onResetSearch, onOpenAI }) => {
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
      {/* Header Tabs */}
      <div className="flex items-center gap-6 mb-8 px-2 overflow-x-auto no-scrollbar relative min-h-[48px]">
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-4 rounded-[32px] border-white/5 hover:border-lumina-blue/30 transition-all group relative overflow-hidden"
                  >
                    <div className="relative aspect-video rounded-2xl overflow-hidden mb-4">
                       <img src={video.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            onClick={() => onOpenAI(video)}
                            className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl"
                          >
                            <Play fill="currentColor" size={20} className="ml-1" />
                          </button>
                       </div>
                       <div className="absolute bottom-2 right-2 px-2 py-1 glass rounded-lg text-[10px] font-black text-white">
                          {video.type === 'short' ? '0:60' : '4:20'}
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
                <ShortsCard video={video} onOpenAI={onOpenAI} />
              </div>
            ))}
          </div>
        ) : viewMode === 'long' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
            {longForm.map(video => (
              <LongFormCard key={video.id} video={video} onOpenAI={onOpenAI} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-6 pb-20 max-w-2xl mx-auto w-full">
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

const ShortsCard = ({ video, onOpenAI }: { video: Video, onOpenAI: (v: Video) => void }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const togglePlay = () => {
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

  return (
    <div ref={containerRef} className="relative w-full max-w-[400px] h-[80vh] min-h-[600px] max-h-[850px] bg-black rounded-[40px] overflow-hidden shadow-2xl border border-white/10 group">
      {/* Video Element */}
      <video 
        ref={videoRef}
        src={video.url}
        className="w-full h-full object-cover cursor-pointer"
        loop
        muted={isMuted}
        playsInline
        onClick={togglePlay}
      />

      {/* Play/Pause Button Animation (Center) */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
          >
            <div className="p-8 bg-black/40 backdrop-blur-xl rounded-full border border-white/10">
              <Play fill="currentColor" size={40} className="text-white ml-1" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlays */}
      <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <div className="flex items-end justify-between gap-4">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <img src={video.creator.avatar} className="w-10 h-10 rounded-full border border-white/20" alt="" />
              <span className="font-bold text-white shadow-sm">{video.creator.name}</span>
              <button className="bg-lumina-pink px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">Follow</button>
            </div>
            <h3 className="text-white text-lg font-medium leading-tight">{video.title}</h3>
            <p className="text-white/70 text-xs line-clamp-2">{video.description}</p>
            <div className="flex gap-2">
              {video.tags.map(t => <span key={t} className="text-[10px] text-lumina-blue font-bold px-2 py-0.5 bg-lumina-blue/10 rounded-md">#{t}</span>)}
            </div>
          </div>

          <div className="flex flex-col gap-6 items-center">
            <div className="flex flex-col items-center gap-1">
              <button className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all active:scale-90">
                <Heart size={24} fill="currentColor" className="text-lumina-pink" />
              </button>
              <span className="text-[10px] font-bold text-white">{video.stats.likes}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <button className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all active:scale-90">
                <MessageCircle size={24} />
              </button>
              <span className="text-[10px] font-bold text-white">{video.stats.comments}</span>
            </div>
            <button className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all">
              <Share2 size={24} />
            </button>
            <button className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all">
              <Bookmark size={24} />
            </button>
            
            {/* AI Integration Trigger */}
            <button 
              onClick={() => onOpenAI(video)}
              className="p-3 bg-lumina-gradient rounded-full text-white shadow-lg shadow-lumina-blue/20 animate-pulse active:scale-90 transition-all"
            >
              <Sparkles size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Top Bar Indicators */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
        <div className="flex gap-1 h-0.5 flex-1 bg-white/20 rounded-full overflow-hidden mr-4">
           <motion.div 
             initial={{ width: 0 }}
             animate={{ width: "100%" }}
             transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
             className="bg-white h-full"
           />
        </div>
        <button onClick={() => setIsMuted(!isMuted)} className="text-white/60 hover:text-white">
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Play size={64} className="text-white/40" />
        </div>
      )}
    </div>
  );
};

const LongFormCard = ({ video, onOpenAI }: { video: Video, onOpenAI: (v: Video) => void }) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white/[0.03] border border-white/5 rounded-[32px] overflow-hidden group/card shadow-xl"
    >
      <div className="relative aspect-video">
        <img src={video.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110" alt="" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center">
          <PlayCircle size={64} className="text-white" />
        </div>
        <div className="absolute bottom-4 right-4 bg-black/80 px-2 py-0.5 rounded-md text-[10px] font-bold text-white border border-white/10">
          12:45
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex gap-4">
          <img src={video.creator.avatar} className="w-12 h-12 rounded-full border border-white/10 shadow-lg" alt="" />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white line-clamp-2 leading-tight group-hover/card:text-lumina-blue transition-colors">
              {video.title}
            </h3>
            <p className="text-white/40 text-sm mt-1">{video.creator.name} • {video.stats.views} views</p>
          </div>
          <button 
            onClick={() => onOpenAI(video)}
            className="self-start p-2 bg-white/5 rounded-full text-white/40 hover:text-white hover:bg-lumina-blue/20 transition-all"
          >
            <Sparkles size={20} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
           {video.tags.map(t => (
             <span key={t} className="text-[10px] text-white/30 font-bold uppercase tracking-wider px-3 py-1 bg-white/5 rounded-full border border-white/5">
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
