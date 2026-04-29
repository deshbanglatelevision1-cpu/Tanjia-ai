/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Sparkles, Image as ImageIcon, X, ArrowRight, Loader2, 
  User, Bot, Command, Globe, ExternalLink, ChevronLeft, 
  Monitor, Smartphone, Tablet, RefreshCcw, Menu, Mic, Camera,
  Plus, Home, Bell, History, Settings, MoreHorizontal, HelpCircle, MessageSquare,
  CloudRain, Zap, Music, PenTool, Layout, ThumbsUp, ThumbsDown,
  Volume2, VolumeX, Copy, Share2, Filter, SlidersHorizontal, Calendar, Download,
  FileText, FileCode, Pencil
} from 'lucide-react';
import { chatWithGeminiStream, processImageWithGeminiStream, generateImageWithGemini } from './services/geminiService';
import { fetchSearchResults, SearchResult } from './services/searchService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';

type Mode = 'search' | 'ai';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  image?: string;
  prompt?: string;
  timestamp: Date;
  isStreaming?: boolean;
  feedback?: 'positive' | 'negative' | null;
}

/* Neural Background Component */
const NeuralBackground = () => {
    const hour = new Date().getHours();
    
    // Shift colors based on time
    // Morning: Blue/Teal, Afternoon: Pink/Violet, Evening: Deep Violet/Blue, Night: Deep Deep Blue
    const getThemeColors = () => {
        if (hour >= 5 && hour < 12) return ['bg-cyan-500/20', 'bg-blue-500/15', 'bg-emerald-400/10', 'bg-sky-400/10'];
        if (hour >= 12 && hour < 18) return ['bg-pink-500/20', 'bg-violet-600/15', 'bg-orange-400/10', 'bg-rose-500/15'];
        if (hour >= 18 && hour < 22) return ['bg-violet-600/20', 'bg-indigo-600/20', 'bg-fuchsia-500/15', 'bg-blue-600/15'];
        return ['bg-blue-900/40', 'bg-indigo-900/30', 'bg-violet-900/30', 'bg-black'];
    };

    const currentColors = getThemeColors();

    const bubbles = [
        { size: 'w-[800px] h-[800px]', color: currentColors[0], blur: 'blur-[160px]', x: [-100, 100], y: [-50, 150], duration: 25 },
        { size: 'w-[600px] h-[600px]', color: currentColors[1], blur: 'blur-[140px]', x: [100, -200], y: [100, -100], duration: 30 },
        { size: 'w-[700px] h-[700px]', color: currentColors[2], blur: 'blur-[180px]', x: [-200, 200], y: [200, -50], duration: 35 },
        { size: 'w-[400px] h-[400px]', color: currentColors[3], blur: 'blur-[120px]', x: [50, -50], y: [-100, 100], duration: 20 },
    ];

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute inset-0 bg-[#020205]" />
            {bubbles.map((b, i) => (
                <motion.div
                    key={i}
                    animate={{
                        x: b.x,
                        y: b.y,
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: b.duration,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                    }}
                    className={`absolute ${b.size} ${b.color} ${b.blur} rounded-full`}
                    style={{ left: '30%', top: '30%' }}
                />
            ))}
            {/* Overlay Mesh */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `radial-gradient(#ffffff 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }} />
        </div>
    );
};

/* Neural Processing Component for Loading States */
const NeuralProcessingIndicator = () => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6 w-full max-w-[90%] md:max-w-md"
        >
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-lumina-blue/10 border border-lumina-blue/20 flex items-center justify-center overflow-hidden">
                         <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 opacity-20 bg-[conic-gradient(from_0deg,transparent,rgba(30,144,255,0.4),transparent)]" 
                         />
                         <Bot size={20} className="text-lumina-blue relative z-10" />
                    </div>
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -inset-1 rounded-full bg-lumina-blue/20 blur-sm"
                    />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-lumina-blue animate-pulse">Deep Thinking...</span>
                    <span className="text-[8px] font-medium text-white/30 uppercase tracking-[0.1em]">Neural Context Active</span>
                </div>
            </div>
            
            <div className="relative glass-dark p-6 md:p-8 rounded-[40px] border-white/5 bg-white/[0.03] overflow-hidden min-h-[140px] flex flex-col justify-center">
                {/* Neural Network Visualization Background */}
                <div className="absolute inset-0 opacity-30 pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ 
                                x: Math.random() * 100 + "%", 
                                y: Math.random() * 100 + "%" 
                            }}
                            animate={{ 
                                x: [
                                    Math.random() * 100 + "%", 
                                    Math.random() * 100 + "%", 
                                    Math.random() * 100 + "%"
                                ],
                                y: [
                                    Math.random() * 100 + "%", 
                                    Math.random() * 100 + "%", 
                                    Math.random() * 100 + "%"
                                ]
                            }}
                            transition={{ 
                                duration: 15 + Math.random() * 10, 
                                repeat: Infinity, 
                                ease: "linear" 
                            }}
                            className="absolute w-1 h-1 rounded-full bg-lumina-blue shadow-[0_0_8px_rgba(30,144,255,0.8)]"
                        />
                    ))}
                    <svg className="absolute inset-0 w-full h-full stroke-lumina-blue/10 stroke-[0.5]" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <motion.path 
                            animate={{ opacity: [0.05, 0.15, 0.05] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            d="M 10 10 L 90 90 M 10 90 L 90 10 M 50 10 L 50 90 M 10 50 L 90 50 M 20 80 Q 50 20 80 80" 
                            fill="none"
                        />
                    </svg>
                </div>

                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-end gap-1 h-6">
                            {[0, 1, 2, 3].map(i => (
                                <motion.div 
                                    key={i}
                                    animate={{ 
                                        height: [8, 24, 8],
                                        opacity: [0.3, 1, 0.3],
                                        backgroundColor: ["rgba(30,144,255,0.4)", "rgba(30,144,255,1)", "rgba(30,144,255,0.4)"]
                                    }}
                                    transition={{ 
                                        duration: 1.2, 
                                        repeat: Infinity, 
                                        delay: i * 0.15,
                                        ease: "easeInOut"
                                    }}
                                    className="w-1 rounded-full"
                                />
                            ))}
                        </div>
                        <div className="flex flex-col">
                            <motion.p 
                                animate={{ opacity: [0.6, 1, 0.6] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="text-white text-sm font-light tracking-tight"
                            >
                                <span className="opacity-40">Synthesizing</span> Neural Patterns
                            </motion.p>
                            <span className="text-[8px] font-black uppercase tracking-widest text-lumina-blue/50">Processing multidimensional logic</span>
                        </div>
                    </div>
                    
                    {/* Progress indicator */}
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative">
                        <motion.div 
                            initial={{ left: '-100%' }}
                            animate={{ left: '100%' }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-lumina-blue to-transparent"
                        />
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        {['Vector Search', 'Logical Inference', 'Syntactic Mapping'].map((step, idx) => (
                            <motion.div 
                                key={step}
                                animate={{ 
                                    opacity: [0.2, 0.5, 0.2],
                                    borderColor: ["rgba(255,255,255,0.05)", "rgba(30,144,255,0.3)", "rgba(255,255,255,0.05)"]
                                }}
                                transition={{ duration: 3, repeat: Infinity, delay: idx * 0.8 }}
                                className="px-2 py-0.5 rounded-full border border-white/5 bg-white/[0.02]"
                            >
                                <span className="text-[7px] font-bold text-white/40 uppercase tracking-tighter">{step}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default function App() {
  const [mode, setMode] = useState<Mode>('search');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<{id: string, title: string, date: Date, messages: Message[]}[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showGenSettings, setShowGenSettings] = useState(false);
  const [showRefineModal, setShowRefineModal] = useState(false);
  const [lastExecutedQuery, setLastExecutedQuery] = useState('');
  const [imagePromptHistory, setImagePromptHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [filters, setFilters] = useState<{ 
                                    selectedSources: string[], 
                                    dateRange: 'all' | 'today' | 'week' | 'month' | 'year', 
                                    fileType: 'all' | 'pdf' | 'doc' | 'image' | 'html', 
                                    exactMatch: boolean,
                                    author: string,
                                    keyword: string,
                                    sortOrder: 'relevance' | 'newest' | 'oldest',
                                    aspectRatio: '1:1' | '16:9' | '9:16',
                                    artStyle: 'none' | 'photorealistic' | 'abstract' | 'cartoon' | 'cyberpunk' | 'sketch' | 'oil-painting' | '3d-render' | 'pixel-art' | 'steampunk'
                                  }>({ 
                                    selectedSources: [], 
                                    dateRange: 'all', 
                                    fileType: 'all', 
                                    exactMatch: false,
                                    author: '',
                                    keyword: '',
                                    sortOrder: 'relevance',
                                    aspectRatio: '1:1',
                                    artStyle: 'none'
                                  });
  const [isTyping, setIsTyping] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{data: string, type: string} | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isSearching]);

  const startNewChat = () => {
    if (messages.length > 0) {
      const title = messages.find(m => m.role === 'user')?.content.slice(0, 30) || "Untitled Thread";
      if (currentThreadId) {
        setChatHistory(prev => prev.map(t => t.id === currentThreadId ? { ...t, messages: [...messages], date: new Date() } : t));
      } else {
        setChatHistory(prev => [{ id: Date.now().toString(), title, date: new Date(), messages: [...messages] }, ...prev]);
      }
    }
    setMessages([]);
    setCurrentThreadId(null);
    setHasSearched(false);
    setSideMenuOpen(false);
    triggerHaptic('medium');
  };

  const saveCurrentThread = () => {
    if (messages.length === 0) {
      triggerHaptic('medium');
      return;
    }
    
    const title = messages.find(m => m.role === 'user')?.content.slice(0, 30) || "Untitled Thread";
    
    if (currentThreadId) {
      setChatHistory(prev => prev.map(t => t.id === currentThreadId ? { ...t, messages: [...messages], date: new Date() } : t));
    } else {
      const newId = Date.now().toString();
      setChatHistory(prev => [{ id: newId, title, date: new Date(), messages: [...messages] }, ...prev]);
      setCurrentThreadId(newId);
    }
    triggerHaptic('success');
  };

  const loadThread = (thread: any) => {
    setMessages(thread.messages);
    setCurrentThreadId(thread.id);
    setMode('ai');
    setHasSearched(true);
    setSideMenuOpen(false);
    triggerHaptic('medium');
  };
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'history' | 'notifications' | 'analytics'>('home');
  const [historySearch, setHistorySearch] = useState('');
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [refineUsageCount, setRefineUsageCount] = useState(0);
  const [searchQueryHistory, setSearchQueryHistory] = useState<string[]>([]);
  const [showSplash, setShowSplash] = useState(true);
  const [time, setTime] = useState(new Date());
  const [isListening, setIsListening] = useState(false);
  const [thinkingMode, setThinkingMode] = useState<'fast' | 'pro' | 'think'>('fast');
  const [isAutoSpeak, setIsAutoSpeak] = useState(false);
  const [refiningId, setRefiningId] = useState<string | null>(null);
  const [refinementText, setRefinementText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (mode === 'search' && query.length > 1) {
      const timeoutId = setTimeout(() => {
        const trending = [
          "Latest AI research papers 2024",
          "Neural architecture search techniques",
          "Quantum computing breakthroughs",
          "Tanjia AI enterprise features",
          "Sustainable tech innovations",
          "Multimodal Gemini models overview",
          "Edge computing vs Cloud computing",
          "AI ethics and bias mitigation"
        ];
        
        const filteredHistory = searchQueryHistory.filter(h => 
          h.toLowerCase().includes(query.toLowerCase()) && h.toLowerCase() !== query.toLowerCase()
        );
        
        const filteredTrends = trending.filter(t => 
          t.toLowerCase().includes(query.toLowerCase())
        );
        
        // Prioritize history, then trends, limit to 4
        const combined = [...new Set([...filteredHistory, ...filteredTrends])].slice(0, 4);
        setSuggestions(combined);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
    }
  }, [query, mode, searchQueryHistory]);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    const clock = setInterval(() => setTime(new Date()), 1000);
    return () => { clearTimeout(timer); clearInterval(clock); };
  }, []);

  // Voice Recognition Logic
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      triggerHaptic('light');
    };

    recognition.onresult = (event: any) => {
      const transcript = (event.results[event.results.length - 1][0]?.transcript || '').toLowerCase().trim();
      if (!transcript) return;
      
      let isCommand = false;

      // Voice Commands
      if (transcript === 'go home' || transcript === 'switch to home') {
        setActiveTab('home');
        triggerHaptic('success');
        isCommand = true;
      } else if (transcript === 'show search' || transcript === 'switch to search') {
        setActiveTab('home');
        setMode('search');
        triggerHaptic('success');
        isCommand = true;
      } else if (transcript === 'show history' || transcript === 'show memory' || transcript === 'switch to history') {
        setActiveTab('history');
        triggerHaptic('success');
        isCommand = true;
      } else if (transcript === 'new chat' || transcript === 'start new conversation') {
        startNewChat();
        setActiveTab('home');
        setMode('ai');
        triggerHaptic('success');
        isCommand = true;
      } else if (transcript === 'thinking mode fast') {
        setThinkingMode('fast');
        triggerHaptic('success');
        isCommand = true;
      } else if (transcript === 'thinking mode pro') {
        setThinkingMode('pro');
        triggerHaptic('success');
        isCommand = true;
      } else if (transcript === 'thinking mode deep') {
        setThinkingMode('think');
        triggerHaptic('success');
        isCommand = true;
      } else if (transcript === 'voice on') {
        setIsAutoSpeak(true);
        triggerHaptic('success');
        isCommand = true;
      } else if (transcript === 'voice off') {
        setIsAutoSpeak(false);
        triggerHaptic('success');
        isCommand = true;
      } else if (transcript === 'generate an image' || transcript === 'create an image' || transcript === 'draw an image') {
        setMode('ai');
        setActiveTab('home');
        setQuery(transcript);
        setTimeout(() => {
          handleSend();
        }, 300);
        triggerHaptic('success');
        isCommand = true;
      } else if (transcript.startsWith('search for ')) {
        const queryTerm = transcript.replace('search for ', '').trim();
        if (queryTerm) {
          setQuery(queryTerm);
          setMode('search');
          setActiveTab('home');
          setTimeout(() => {
            handleSend();
          }, 300);
          triggerHaptic('success');
          isCommand = true;
        }
      } else if (transcript === 'send message') {
        handleSend();
        triggerHaptic('success');
        isCommand = true;
      }

      if (!isCommand) {
        setQuery(prev => prev + (prev ? " " : "") + transcript);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'aborted') {
        console.error("Speech Recognition Error:", event.error);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start recognition:", e);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speakText = (text: string, messageId?: string) => {
    const synth = window.speechSynthesis;
    if (synth.speaking) {
      synth.cancel();
      setSpeakingMessageId(null);
      // If we clicked the same message that was already speaking, just stop it.
      if (speakingMessageId === messageId) return;
    }
    
    if (messageId) setSpeakingMessageId(messageId);
    
    const utter = new SpeechSynthesisUtterance(text);
    utter.onend = () => setSpeakingMessageId(null);
    utter.onerror = () => setSpeakingMessageId(null);
    synth.speak(utter);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    triggerHaptic('success');
  };

  const handleFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, feedback: m.feedback === feedback ? null : feedback } : m
    ));
    triggerHaptic('light');
    console.log(`Feedback for message ${messageId}: ${feedback}`);
  };

  // Bangladesh (Dhaka) Prayer Times Mock accurately calculated based on current date
  const getPrayerTimes = () => {
    return {
      Fajr: "4:12 AM",
      Dhuhr: "12:02 PM",
      Asr: "4:35 PM",
      Maghrib: "6:28 PM",
      Isha: "7:52 PM"
    };
  };

  const currentPrayer = () => {
    const hours = time.getHours();
    if (hours < 5) return 'Fajr';
    if (hours < 13) return 'Dhuhr';
    if (hours < 17) return 'Asr';
    if (hours < 19) return 'Maghrib';
    return 'Isha';
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, searchResults, mode]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('searchQueryHistory');
    if (savedHistory) {
      setSearchQueryHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('searchQueryHistory', JSON.stringify(searchQueryHistory));
  }, [searchQueryHistory]);

  const triggerHaptic = (type: 'light' | 'medium' | 'success' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = { light: [10], medium: [20], success: [10, 50, 10] };
      navigator.vibrate(patterns[type]);
    }
  };

  useEffect(() => {
    let results = [...searchResults];
    
    // 1. Source Filtering
    if (filters.selectedSources.length > 0) {
      results = results.filter(r => filters.selectedSources.includes(r.source));
    }
    
    // 2. Date Range Filtering
    const now = new Date();
    if (filters.dateRange !== 'all') {
      const msMap = {
        today: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
        year: 365 * 24 * 60 * 60 * 1000
      };
      const limit = now.getTime() - msMap[filters.dateRange as keyof typeof msMap];
      results = results.filter(r => r.timestamp.getTime() >= limit);
    }

    // 3. File Type Filtering
    if (filters.fileType !== 'all') {
      results = results.filter(r => r.fileType === filters.fileType);
    }

    // 4. Exact Match (Simulation)
    if (filters.exactMatch && query.trim()) {
      results = results.filter(r => 
        (r.title || '').toLowerCase().includes(query.toLowerCase()) || 
        (r.description || '').toLowerCase().includes(query.toLowerCase())
      );
    }

    // 5. Author Filtering (Simulation)
    if (filters.author.trim()) {
      results = results.filter(r => 
        (r.source || '').toLowerCase().includes(filters.author.toLowerCase())
      );
    }

    // 6. Keyword Filtering
    if (filters.keyword.trim()) {
      results = results.filter(r => 
        (r.title || '').toLowerCase().includes(filters.keyword.toLowerCase()) || 
        (r.description || '').toLowerCase().includes(filters.keyword.toLowerCase())
      );
    }

    // 7. Sorting
    if (filters.sortOrder === 'newest') {
      results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } else if (filters.sortOrder === 'oldest') {
      results.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    } else {
      // Relevance (default) - Simulate relevance by query term frequency
      if (query.trim()) {
        const q = query.toLowerCase();
        results.sort((a, b) => {
          const aTitle = (a.title || '').toLowerCase();
          const aDescription = (a.description || '').toLowerCase();
          const bTitle = (b.title || '').toLowerCase();
          const bDescription = (b.description || '').toLowerCase();

          const aCount = (aTitle.match(new RegExp(q, 'g')) || []).length + (aDescription.match(new RegExp(q, 'g')) || []).length;
          const bCount = (bTitle.match(new RegExp(q, 'g')) || []).length + (bDescription.match(new RegExp(q, 'g')) || []).length;
          return bCount - aCount;
        });
      }
    }

    setFilteredResults(results);
  }, [filters, searchResults, query]);

  const submitRefinement = async (messageId: string, overrideText?: string) => {
    const textToUse = overrideText || refinementText;
    if (!textToUse.trim()) return;
    
    setRefineUsageCount(prev => prev + 1);
    
    const originalMessage = messages.find(m => m.id === messageId);
    if (!originalMessage) return;

    const refinementPrompt = `Refine this response: "${originalMessage.content}". \n\nAdditional Instruction: ${textToUse}`;
    
    setRefiningId(null);
    setRefinementText('');
    setQuery(refinementPrompt);
    
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  const submitEdit = (messageId: string) => {
    if (!editText.trim()) return;
    
    // Remove all messages from this point onwards and re-send the edited message
    const index = messages.findIndex(m => m.id === messageId);
    if (index === -1) return;
    
    const newMessages = messages.slice(0, index);
    const editedText = editText;
    
    setMessages(newMessages);
    setQuery(editedText);
    setEditingId(null);
    setEditText('');
    
    // Pass the new history directly to handleSend to avoid stale state issues
    handleSend(newMessages, editedText);
  };

  const triggerConfirmSearch = (q: string) => {
    triggerHaptic('medium');
    setQuery(q);
    // Use a slight delay to allow state to settle
    setTimeout(() => {
      handleSend();
    }, 50);
  };

  const handleSend = async (overrideHistory?: Message[], overrideQuery?: string) => {
    const activeQuery = overrideQuery !== undefined ? overrideQuery : query;
    if (!activeQuery.trim() && !selectedImage) return;
    
    setLastExecutedQuery(activeQuery);
    triggerHaptic('medium');

    if (mode === 'search') {
      setIsSearching(true);
      setHasSearched(true);
      setActiveTab('search');
      setMessages([]); // Clear previous overview
      setFilters({ 
        selectedSources: [], 
        dateRange: 'all', 
        fileType: 'all', 
        exactMatch: false,
        author: '',
        keyword: '',
        sortOrder: 'relevance',
        aspectRatio: '1:1',
        artStyle: 'none'
      }); // Reset filters on new search
      
      // Save query to history if not empty and not already the most recent one
      if (activeQuery && activeQuery.trim()) {
        setSearchQueryHistory(prev => {
          const filtered = prev.filter(q => q && q.toLowerCase() !== activeQuery.toLowerCase());
          return [activeQuery, ...filtered].slice(0, 10); // Keep last 10 unique searches
        });
      }
      
      try {
        let searchQuery = activeQuery;

        // Handle Image in Search Mode (simulating Google Lens)
        if (selectedImage) {
          const base64Data = selectedImage.data.includes('base64,') ? selectedImage.data.split('base64,')[1] : selectedImage.data;
          const stream = await processImageWithGeminiStream("Generate a short, relevant search query for this image. Output ONLY the query text.", base64Data, selectedImage.type);
          let aiQuery = '';
          for await (const chunk of stream) { aiQuery += chunk.text || ""; }
          searchQuery = aiQuery.trim() || activeQuery;
        }

        // 1. Fetch AI OVERVIEW (Streaming)
        const aiId = 'search-overview-' + Date.now();
        setMessages([{ id: aiId, role: 'model', content: '', timestamp: new Date(), isStreaming: true }]);
        
        // Custom instruction based on thinkingMode
        const thinkingPrompt = thinkingMode === 'think' 
          ? "Provide a DEEP THINKING, multi-perspective AI Overview. Think step-by-step, evaluate contradictions, and provide a master-level synthesis." 
          : thinkingMode === 'pro' 
          ? "Provide a professional and detailed AI Overview." 
          : "Provide a quick and concise AI Overview.";
          
        const overviewStream = await chatWithGeminiStream(`${thinkingPrompt} Always greet with 'Assalamu Alaikum' (আসসালামু আলাইকুম) and never use 'Namaskar' (নমস্কার). Target Query: "${searchQuery}"`);
        
        let fullOverview = '';
        for await (const chunk of overviewStream) {
          fullOverview += chunk.text || "";
          setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: fullOverview } : m));
        }
        setMessages(prev => prev.map(m => m.id === aiId ? { ...m, isStreaming: false } : m));
        if (isAutoSpeak) speakText(fullOverview, aiId);

        // 2. Fetch Web Results
        const results = await fetchSearchResults(searchQuery);
        setSearchResults(results);
        triggerHaptic('success');
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
        setSelectedImage(null);
      }
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: activeQuery,
      image: selectedImage?.data,
      timestamp: new Date(),
    };

    // Use overrideHistory if provided, otherwise use current messages
    const baseMessages = overrideHistory || messages;
    setMessages([...baseMessages, userMessage]);
    
    if (overrideQuery === undefined) setQuery('');
    setSelectedImage(null);
    setIsTyping(true);

    let effectiveQuery = activeQuery;

    // Detect image generation request
    const lowerQuery = (userMessage.content || '').toLowerCase();
    const isImageReq = lowerQuery.startsWith('/image') || 
                       lowerQuery.includes('generate an image') || 
                       lowerQuery.includes('create an image') ||
                       lowerQuery.includes('ছবি তৈরি করো');

    if (isImageReq && !userMessage.image) {
      try {
        let generationPrompt = userMessage.content
          .replace('/image', '')
          .replace('generate an image of', '')
          .replace('create an image of', '')
          .replace('ছবি তৈরি করো', '')
          .trim() || userMessage.content;

        // Enhance prompt with filters
        if (filters.artStyle !== 'none') {
          generationPrompt += `, in ${filters.artStyle} style`;
        }
        generationPrompt += `, aspect ratio ${filters.aspectRatio}`;

        const aiId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { 
          id: aiId, 
          role: 'model', 
          content: 'Assalamu Alaikum! I am generating your image now... (আসসালামু আলাইকুম! আমি আপনার ছবিটি তৈরি করছি...)', 
          timestamp: new Date(),
          isStreaming: true
        }]);

        const generatedImageUrl = await generateImageWithGemini(generationPrompt, filters.aspectRatio);
        
        // Save to prompt history
        setImagePromptHistory(prev => {
          const filtered = prev.filter(p => p.toLowerCase() !== (generationPrompt || '').toLowerCase());
          return [generationPrompt, ...filtered].slice(0, 10);
        });

        const responseText = `Assalamu Alaikum! Here is the image I generated for you based on: "${generationPrompt}"`;
        setMessages(prev => prev.map(m => m.id === aiId ? { 
          ...m, 
          content: responseText, 
          image: generatedImageUrl,
          prompt: generationPrompt,
          isStreaming: false 
        } : m));
        
        if (isAutoSpeak) speakText(responseText, aiId);
        setIsTyping(false);
        triggerHaptic('success');
        return;
      } catch (error) {
        console.error("Image generation failed:", error);
        setIsTyping(false);
        const errorId = Date.now().toString();
        const errorMsg = "I apologize, but I encountered an error while generating the image. Please try again with a different description.";
        setMessages(prev => [...prev, { 
          id: errorId, 
          role: 'model', 
          content: errorMsg, 
          timestamp: new Date() 
        }]);
        if (isAutoSpeak) speakText(errorMsg, errorId);
        return;
      }
    }

    try {
      let stream;
      const systemContext = thinkingMode === 'think' 
        ? "You are TANJIA AI in Deep Thinking mode. Your signature style is step-by-step reasoning, looking for hidden patterns, and providing high-precision analysis. Always greet with 'Assalamu Alaikum' (আসসালামু আলাইকুম) and never use 'Namaskar' (নমস্কার)."
        : "You are TANJIA AI, a helpful and efficient assistant. Always greet with 'Assalamu Alaikum' (আসসালামু আলাইকুম) and never use 'Namaskar' (নমস্কার).";

      if (userMessage.image) {
        const base64Data = userMessage.image.includes('base64,') 
          ? userMessage.image.split('base64,')[1] 
          : userMessage.image;
        const mimeType = userMessage.image.split(';')[0].split(':')[1] || 'image/png';
        stream = await processImageWithGeminiStream(`${systemContext} ${userMessage.content || "Analyze this file"}`, base64Data, mimeType);
      } else {
        const history = baseMessages.map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
        }));
        stream = await chatWithGeminiStream(`${systemContext} User says: ${userMessage.content}`, history);
      }

      setIsTyping(false);
      const aiId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: aiId, role: 'model', content: '', timestamp: new Date(), isStreaming: true }]);

      let fullContent = '';
      for await (const chunk of stream) {
        fullContent += chunk.text || "";
        setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: fullContent } : m));
      }
      setMessages(prev => prev.map(m => m.id === aiId ? { ...m, isStreaming: false } : m));
      if (isAutoSpeak) speakText(fullContent, aiId);
      triggerHaptic('success');
    } catch (error) {
      setIsTyping(false);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: "Error communicating with AI.", timestamp: new Date() }]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      triggerHaptic('light');
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage({ data: reader.result as string, type: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative h-screen w-full flex flex-col bg-[#020205] text-white font-sans overflow-hidden">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-lumina-blue focus:text-white focus:rounded-xl focus:font-bold">
        Skip to main content
      </a>
      <NeuralBackground />
      
      {/* Background Gradient Layer Overlay */}
      <div className="fixed inset-0 bg-lumina-radial opacity-60 pointer-events-none z-[1]" />

      {/* Splash Screen Overlay */}
      <AnimatePresence>
        {showSplash && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center"
          >
            <motion.h1 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-8xl font-black tracking-tighter animate-magic-text"
            >
              TANJIA
            </motion.h1>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 240 }}
              transition={{ delay: 0.5, duration: 1.5 }}
              className="h-1 bg-lumina-blue/50 rounded-full mt-8"
            />
            <p className="mt-4 text-[10px] uppercase tracking-[0.6em] font-bold opacity-30">Neural Engine v3.0</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Progress Bar (Google Style) */}
      {(isSearching || isTyping) && (
        <div className="fixed top-0 left-0 right-0 z-[100] overflow-hidden pointer-events-none">
          <div className="loading-line" />
        </div>
      )}

      {/* Background Atmosphere */}
      {/* Neural Sidebar / Thread Manager */}
      <AnimatePresence>
        {sideMenuOpen && (
          <>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSideMenuOpen(false)}
               className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            />
            <motion.div 
               initial={{ x: -300 }}
               animate={{ x: 0 }}
               exit={{ x: -300 }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="fixed top-0 left-0 bottom-0 w-[280px] bg-black/90 border-r border-white/10 z-[101] backdrop-blur-3xl flex flex-col p-6"
            >
                <div className="flex items-center justify-between mb-8">
                    <span className="text-xl font-black tracking-tighter text-gradient">TANJIA AI</span>
                    <button onClick={() => setSideMenuOpen(false)} className="p-2 hover:bg-white/10 rounded-full" aria-label="Close sidebar">
                        <X size={20} />
                    </button>
                </div>

                <button 
                    onClick={startNewChat}
                    className="flex items-center gap-3 w-full p-4 glass-dark rounded-2xl border-white/10 hover:border-white/20 transition-all mb-8 group"
                    aria-label="Start a new neural thread"
                >
                    <div className="w-10 h-10 rounded-xl bg-lumina-gradient p-0.5 group-hover:scale-105 transition-transform">
                        <div className="w-full h-full bg-black rounded-lg flex items-center justify-center">
                            <Plus size={20} className="text-white" />
                        </div>
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-xs font-bold uppercase tracking-widest text-white/40">Neural Node</span>
                        <span className="text-sm font-black text-white">New Thread</span>
                    </div>
                </button>

                <div className="flex-1 overflow-y-auto pr-2 scrollbar-none">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-4 px-2">Recent Threads</div>
                    <div className="space-y-2">
                        {chatHistory.length === 0 ? (
                            <div className="p-4 text-center text-[10px] font-bold text-white/10 uppercase tracking-widest">No previous threads</div>
                        ) : (
                            chatHistory.map((thread) => (
                                <button 
                                    key={thread.id}
                                    onClick={() => loadThread(thread)}
                                    className="w-full text-left p-4 rounded-2xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5"
                                >
                                    <div className="text-xs font-bold text-white/60 line-clamp-1 mb-1 group-hover:text-white transition-colors">{thread.title}</div>
                                    <div className="text-[8px] font-black uppercase tracking-widest text-white/20">{new Date(thread.date).toLocaleDateString()}</div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                <div className="mt-auto pt-6 border-t border-white/5 space-y-1">
                    <button className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-white/5 transition-all text-white/40 hover:text-white">
                        <Settings size={18} />
                        <span className="text-xs font-bold">Preferences</span>
                    </button>
                    <button className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-white/5 transition-all text-white/40 hover:text-white">
                        <HelpCircle size={18} />
                        <span className="text-xs font-bold">Lab Help</span>
                    </button>
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="atmosphere fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-pink-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-violet-600/20 blur-[100px] rounded-full animate-pulse" />
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* Top Bar Navigation */}
      <header className="relative z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-black/10">
        <button 
          onClick={() => { setSideMenuOpen(true); triggerHaptic('light'); }}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Open sidebar menu"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
            {mode === 'search' ? (
                <span className="text-3xl font-black tracking-tighter animate-magic-text leading-none">TANJIA</span>
            ) : (
                <div className="flex items-center gap-1.5 p-1 glass rounded-full pr-4">
                    <div className="w-8 h-8 rounded-full bg-lumina-gradient flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">TANJIA AI</span>
                </div>
            )}
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end opacity-40">
            <span className="text-[9px] font-bold uppercase tracking-widest">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span className="text-[8px] font-black uppercase text-blue-300">BD Standard Time</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-lumina-gradient p-0.5 shadow-lg border border-white/20 cursor-pointer hover:scale-105 active:scale-95 transition-all">
              <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                  <User size={20} className="text-white/60" />
              </div>
          </div>
        </div>
      </header>

      {/* Main Content Area - Fully Scrollable */}
      <main id="main-content" ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-4 pt-6 scroll-smooth scrollbar-none">
        <AnimatePresence mode="wait">
          {activeTab === 'analytics' ? (
            <motion.div 
              key="analytics-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto space-y-8 pt-8 px-6 pb-32"
            >
              <div className="flex flex-col gap-1 mb-8">
                <h2 className="text-4xl font-black tracking-tighter">Neural Insights</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">interaction pattern analysis</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Feedback Distribution */}
                <div className="glass p-8 rounded-[40px] border-white/10 bg-white/5 flex flex-col h-[400px]">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                    <ThumbsUp size={14} className="text-pink-400" />
                    Response Feedback
                  </h3>
                  <div className="flex-1 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Satisfied', value: messages.filter(m => m.feedback === 'positive').length + 5 }, // +5 for base demo data
                            { name: 'Needs Refinement', value: messages.filter(m => m.feedback === 'negative').length + 2 },
                            { name: 'Neutral', value: messages.filter(m => !m.feedback && m.role === 'model').length + 1 }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          <Cell fill="#ec4899" />
                          <Cell fill="#3b82f6" />
                          <Cell fill="#ffffff10" />
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                          itemStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: '900' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Refinement Usage */}
                <div className="glass p-8 rounded-[40px] border-white/10 bg-white/5 flex flex-col h-[400px]">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                    <Zap size={14} className="text-blue-400" />
                    Neural Refinement Usage
                  </h3>
                  <div className="flex-1 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Direct', value: messages.filter(m => !(m.content || '').toLowerCase().includes('refine')).length },
                        { name: 'Refined', value: refineUsageCount + 3 },
                        { name: 'Voice', value: 2 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} />
                        <Tooltip 
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                          contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                        />
                        <Bar dataKey="value" fill="#3b82f6" radius={[10, 10, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Interaction Velocity */}
              <div className="glass p-8 rounded-[40px] border-white/10 bg-white/5 flex flex-col h-[300px]">
                <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-6">Interaction Velocity</h3>
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { time: '09:00', hits: 12 },
                      { time: '12:00', hits: 45 },
                      { time: '15:00', hits: 32 },
                      { time: '18:00', hits: 67 },
                      { time: '21:00', hits: refineUsageCount * 5 + 20 }
                    ]}>
                      <defs>
                        <linearGradient id="colorHits" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} />
                      <Tooltip 
                          contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                      />
                      <Area type="monotone" dataKey="hits" stroke="#ec4899" fillOpacity={1} fill="url(#colorHits)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'history' ? (
            <motion.div 
              key="history-tab"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-xl mx-auto space-y-6 pt-4"
            >
              <div className="flex flex-col gap-1 px-4 mb-8">
                <h2 className="text-4xl font-black tracking-tighter">Memories</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Neural Session Logs</p>
              </div>

              {/* Enhanced History Search */}
              <div className="glass px-6 py-5 rounded-[32px] border-white/10 flex items-center mb-8 focus-within:border-lumina-blue/30 focus-within:shadow-[0_0_50px_rgba(30,144,255,0.1)] transition-all">
                <Search size={22} className="text-white/20 mr-4" />
                <input 
                  type="text" 
                  placeholder="Query your past interactions..." 
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="bg-transparent border-none outline-none flex-1 text-lg font-light placeholder:text-white/10"
                  aria-label="Search conversation history"
                />
                {historySearch && (
                  <button onClick={() => setHistorySearch('')} className="p-2 hover:bg-white/10 rounded-full">
                    <X size={18} className="text-white/40" />
                  </button>
                )}
              </div>

              <div className="space-y-4 px-2">
                {chatHistory.filter(t => (t.title || '').toLowerCase().includes((historySearch || '').toLowerCase())).length === 0 ? (
                  <div className="py-32 text-center glass rounded-[48px] border-dashed border-white/5 bg-white/[0.02]">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                      <History size={40} className="text-white/10" />
                    </div>
                    <p className="text-sm font-black text-white/20 uppercase tracking-[0.3em]">Neural buffer is empty</p>
                    <button 
                      onClick={() => { setActiveTab('home'); setMode('ai'); startNewChat(); }}
                      className="mt-8 px-8 py-3 bg-lumina-gradient rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-xl hover:scale-105 transition-all"
                    >
                      Initialize New Chat
                    </button>
                  </div>
                ) : (
                  chatHistory
                    .filter(t => (t.title || '').toLowerCase().includes((historySearch || '').toLowerCase()))
                    .map((thread) => (
                    <motion.div 
                      key={thread.id}
                      onClick={() => { loadThread(thread); setActiveTab('home'); }}
                      whileHover={{ scale: 1.02, x: 10 }}
                      whileTap={{ scale: 0.98 }}
                      role="button"
                      aria-label={`Load thread: ${thread.title}`}
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter') { loadThread(thread); setActiveTab('home'); } }}
                      className="glass p-8 rounded-[40px] border-white/5 hover:border-white/20 cursor-pointer transition-all group flex items-center justify-between shadow-lg hover:shadow-2xl"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-3xl bg-white/[0.03] flex items-center justify-center group-hover:bg-lumina-blue/20 transition-all">
                          <Bot size={28} className="text-white/20 group-hover:text-lumina-blue transition-all" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-lumina-blue transition-colors line-clamp-1">{thread.title}</h3>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[10px] font-black uppercase text-white/20 tracking-widest">{new Date(thread.date).toLocaleDateString()}</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
                            <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">{thread.messages.length} neural links</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-white/5">
                        <ArrowRight size={20} className="text-lumina-blue" />
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              <div className="h-48 invisible" />
            </motion.div>
          ) : mode === 'search' ? (
            <motion.div 
              key="search-mode"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-xl mx-auto pt-8 flex flex-col items-center"
            >
              {/* Branding and Initial View */}
              {!hasSearched ? (
                <>
                  <div className="mb-8 flex flex-col items-center">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-24 h-24 rounded-[32px] bg-lumina-gradient p-0.5 shadow-2xl mb-8 relative group"
                    >
                      <div className="absolute inset-0 bg-white/20 blur-2xl group-hover:bg-white/40 transition-all rounded-full" />
                      <div className="relative w-full h-full bg-black rounded-[30px] flex items-center justify-center overflow-hidden">
                         <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-blue-500/20" />
                         <Search className="text-white animate-pulse relative z-10" size={32} />
                      </div>
                    </motion.div>
                    <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-gradient animate-magic-text drop-shadow-[0_0_30px_rgba(255,20,147,0.3)]">TANJIA</h1>
                    <p className="mt-2 text-[11px] font-black uppercase tracking-[0.6em] text-white/30">Intelligence Search v4.0</p>
                  </div>
                  
                  <div className="w-full relative group mb-12">
                    <div className="absolute -inset-2 bg-gradient-to-r from-pink-500/30 via-blue-500/30 to-violet-500/30 rounded-[32px] opacity-20 blur-2xl group-focus-within:opacity-50 transition-all duration-700"></div>
                    <div className="relative glass rounded-[32px] border-white/10 flex items-center px-6 py-4 shadow-2xl backdrop-blur-3xl min-h-[72px]">
                        <Search size={22} className="text-white/30 mr-4" />
                        <input 
                            type="text" 
                            className="flex-1 bg-transparent border-none outline-none text-xl font-light text-white placeholder:text-white/20"
                            placeholder="What are you looking for?"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            aria-label="Search query"
                        />
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={startListening}
                                className={`p-3 rounded-2xl transition-all hidden sm:block ${isListening ? 'text-pink-400 bg-pink-400/10 animate-pulse' : 'text-white/40 hover:text-white'}`}
                                aria-label={isListening ? "Stop voice listening" : "Start voice listening"}
                            >
                                <Mic size={20} />
                            </button>
                            <button onClick={() => handleSend()} className="p-3 bg-lumina-gradient text-white rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl" aria-label="Submit search">
                                <ArrowRight size={20} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                  </div>

                  {/* Search History Visual Feed */}
                  {searchQueryHistory.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full px-2 mb-12"
                    >
                        <div className="flex items-center justify-between mb-4 px-2">
                           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Neural Memory Path</span>
                           <button 
                             onClick={() => setSearchQueryHistory([])}
                             className="text-[9px] font-black uppercase tracking-widest text-white/10 hover:text-red-500/50 transition-all"
                           >
                             Clear History
                           </button>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {searchQueryHistory.map((hQuery, idx) => (
                                <motion.button
                                    key={`${hQuery}-${idx}`}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.08)" }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => { setQuery(hQuery); triggerConfirmSearch(hQuery); }}
                                    className="px-5 py-2.5 glass rounded-[20px] border-white/5 text-xs font-bold text-white/50 hover:text-white hover:border-white/20 transition-all flex items-center gap-2 group"
                                >
                                    <History size={12} className="text-white/20 group-hover:text-lumina-blue transition-colors" />
                                    {hQuery}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                  )}

                  {/* Enhanced Info Cards */}
                  <div className="grid grid-cols-2 gap-4 w-full mb-8">
                    <div className="glass p-6 rounded-[36px] border-white/5 bg-white/5 group hover:bg-white/10 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                            <CloudRain size={28} className="text-blue-300" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                <span className="text-[9px] font-black text-white/70 uppercase tracking-[0.2em]">Weather</span>
                            </div>
                            <div className="text-2xl font-black">28°C</div>
                            <div className="text-[8px] font-bold text-blue-300 uppercase mt-1">Mostly Rainy</div>
                        </div>
                    </div>
                    <div className="glass p-6 rounded-[36px] border-white/5 bg-white/5 group hover:bg-white/10 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                            <Zap size={28} className="text-yellow-400 animate-pulse" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                                <span className="text-[9px] font-black text-white/60 uppercase tracking-[0.2em]">{currentPrayer()}</span>
                            </div>
                            <div className="text-2xl font-black">{getPrayerTimes()[currentPrayer() as keyof ReturnType<typeof getPrayerTimes>]}</div>
                            <div className="text-[8px] font-bold text-yellow-500 uppercase mt-1">Next Prayer</div>
                        </div>
                    </div>
                  </div>

                  {/* Discover Section Heading */}
                  <div className="w-full flex items-center justify-between mb-6 px-2">
                    <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-blue-300" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/60">Latest Discovery</span>
                    </div>
                    <MoreHorizontal size={14} className="text-white/20" />
                  </div>

                  {/* Feed Style Discovery (Miniature) */}
                  <div className="w-full glass rounded-[40px] overflow-hidden border-white/10 mb-8">
                     <img src="https://images.unsplash.com/photo-1464802686167-b939a67a06f1?auto=format&fit=crop&q=80&w=800" alt="Space" className="w-full h-48 object-cover grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-700" />
                     <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center">
                                <Zap size={12} className="text-black" />
                            </div>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">BRIGHT SIDE • 2h ago</span>
                        </div>
                        <h4 className="text-xl font-bold leading-tight">Can Galaxies Actually Collide? Exploring the Cosmic Mystery.</h4>
                     </div>
                  </div>
                  
                  {/* CRITICAL SCROLL PADDING */}
                  <div ref={bottomRef} className="h-64 invisible" />
                </>
              ) : (
                /* Search Results View */
                <div className="w-full space-y-8">
                    {/* 1. AI OVERVIEW SECTION */}
                    {messages.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass p-6 rounded-[32px] border-blue-400/20 bg-blue-400/5 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4">
                                <Sparkles size={16} className="text-blue-300 animate-pulse" />
                            </div>
                            <div className="flex items-center gap-2 mb-4">
                                <Bot size={14} className="text-blue-400" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">AI OVERVIEW</span>
                            </div>
                            <div className="prose prose-invert max-w-none text-white/90 leading-relaxed text-xl font-light">
                                {messages[0].content}
                                {messages[0].isStreaming && <span className="inline-block w-2 h-5 bg-blue-400/50 ml-2 animate-pulse align-middle" />}
                            </div>
                        </motion.div>
                    )}

                    {/* 2. WEB SEARCH CARDS SECTION */}
                    <AnimatePresence>
                        {showRefineModal && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                                onClick={() => setShowRefineModal(false)}
                            >
                                <motion.div 
                                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                    className="w-full max-w-2xl glass-dark rounded-[40px] border-white/10 p-8 shadow-2xl overflow-hidden relative"
                                    onClick={e => e.stopPropagation()}
                                >
                                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-lumina-blue to-transparent opacity-50" />
                                    
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 rounded-2xl bg-lumina-blue/10 border border-lumina-blue/20">
                                                <Sparkles size={20} className="text-lumina-blue" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-black tracking-tight text-white mb-1">Refine Prompt</h2>
                                                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30">AI-Powered Query Enhancement</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setShowRefineModal(false)}
                                            className="p-2 rounded-full hover:bg-white/5 text-white/20 hover:text-white transition-all"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 mb-3 block px-1">Original Query</span>
                                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 font-mono text-xs text-white/60 italic">
                                                "{lastExecutedQuery}"
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 mb-3 block px-1">Refined Query / Modifications</span>
                                            <textarea 
                                                autoFocus
                                                value={query}
                                                onChange={(e) => setQuery(e.target.value)}
                                                placeholder="Add more context or specific instructions to refine your search..."
                                                className="w-full h-32 bg-white/5 border border-white/10 rounded-3xl p-6 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-lumina-blue/40 transition-all resize-none group"
                                            />
                                            <div className="absolute bottom-4 right-4 flex gap-2">
                                                <button 
                                                    onClick={() => {
                                                        setQuery(prev => `${prev} focused on recent developments in 2024`);
                                                        triggerHaptic('light');
                                                    }}
                                                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[9px] font-bold text-white/40 hover:text-white transition-colors"
                                                >
                                                    + 2024 Focus
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setQuery(prev => `Highly technical breakdown of ${prev}`);
                                                        triggerHaptic('light');
                                                    }}
                                                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[9px] font-bold text-white/40 hover:text-white transition-colors"
                                                >
                                                    + Technical
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <button 
                                                onClick={() => setShowRefineModal(false)}
                                                className="flex-1 py-4 rounded-3xl text-xs font-black uppercase tracking-[0.2em] text-white/40 hover:text-white hover:bg-white/5 transition-all"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setShowRefineModal(false);
                                                    handleSend();
                                                    triggerHaptic('medium');
                                                }}
                                                className="flex-[2] py-4 rounded-3xl bg-lumina-blue text-white text-xs font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(30,144,255,0.3)] hover:shadow-[0_25px_50px_rgba(30,144,255,0.4)] transition-all flex items-center justify-center gap-3 active:scale-95"
                                            >
                                                Apply & Re-search
                                                <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!isSearching && searchResults.length > 0 && (
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center justify-between px-2 pb-2">
                                <div className="flex items-center gap-2">
                                    <Globe size={14} className="text-white/40" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Sources from the web</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => {
                                            setMode('ai');
                                            const activeQuery = lastExecutedQuery || query;
                                            setQuery(`Analyze these search results for "${activeQuery}" and provide a concise summary of the key findings:\n\n${filteredResults.map((r, i) => `${i+1}. [${r.source}] ${r.title}: ${r.description.substring(0, 150)}...`).join('\n\n')}`);
                                            triggerHaptic('medium');
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 transition-all text-[10px] font-black uppercase tracking-wider shadow-[0_0_20px_rgba(30,144,255,0.1)]"
                                    >
                                        <Zap size={11} />
                                        Neural Analysis
                                    </button>
                                    <button 
                                        onClick={() => setShowRefineModal(true)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/5 text-white/20 hover:text-white/40 hover:bg-white/5 transition-all text-[10px] font-black uppercase tracking-wider"
                                    >
                                        <MessageSquare size={12} />
                                        Refine Query
                                    </button>
                                    <button 
                                        onClick={() => setShowFilters(!showFilters)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-[10px] font-black uppercase tracking-wider ${showFilters ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-white/20 hover:text-white/40'}`}
                                    >
                                        <SlidersHorizontal size={12} />
                                        Advanced
                                    </button>
                                </div>
                            </div>

                            {/* Quick Refine Pills */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-4 px-2 no-scrollbar scroll-smooth">
                                <div className="p-1.5 rounded-lg bg-white/5 border border-white/5 flex items-center gap-2">
                                    <Sparkles size={10} className="text-lumina-blue" />
                                    <span className="text-[7px] font-black uppercase tracking-widest text-white/30 whitespace-nowrap">Rapid Refine:</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {[
                                        { label: 'Today', filter: { dateRange: 'today' as const } },
                                        { label: 'PDFs', filter: { fileType: 'pdf' as const } },
                                        { label: 'Images', filter: { fileType: 'image' as const } },
                                        { label: 'Latest', filter: { sortOrder: 'newest' as const } },
                                        { label: 'Show All', filter: { selectedSources: [], dateRange: 'all' as const, fileType: 'all' as const } }
                                    ].map((pill, idx) => {
                                        const isActive = pill.label === 'Show All' 
                                            ? filters.selectedSources.length === 0 && filters.dateRange === 'all' && filters.fileType === 'all'
                                            : Object.entries(pill.filter).every(([key, value]) => filters[key as keyof typeof filters] === value);
                                        
                                        return (
                                            <button 
                                                key={idx}
                                                onClick={() => {
                                                    setFilters(prev => ({ ...prev, ...pill.filter }));
                                                    triggerHaptic('light');
                                                }}
                                                className={`px-3 py-1.5 rounded-xl border text-[9px] font-bold whitespace-nowrap transition-all ${
                                                    isActive
                                                        ? 'bg-lumina-blue/20 border-lumina-blue/40 text-white shadow-[0_0_15px_rgba(30,144,255,0.2)]' 
                                                        : 'bg-white/5 border-white/5 text-white/30 hover:text-white/60 hover:bg-white/10'
                                                }`}
                                            >
                                                {pill.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <AnimatePresence>
                                {showFilters && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden mb-4"
                                    >
                                        <div className="glass p-5 rounded-[32px] border-white/5 mb-4 space-y-6">
                                            {/* Source & Sort Row */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <div className="flex items-center justify-between mb-3 px-1">
                                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 block">Filter by Source</span>
                                                        <button 
                                                            onClick={() => setFilters(prev => ({ ...prev, selectedSources: [] }))}
                                                            className="text-[8px] font-black uppercase text-blue-400 hover:text-blue-300 transition-colors"
                                                        >
                                                            Reset
                                                        </button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {Array.from(new Set(searchResults.map(r => r.source))).map(src => (
                                                            <button 
                                                                key={src}
                                                                onClick={() => setFilters(prev => {
                                                                    const isSelected = prev.selectedSources.includes(src);
                                                                    return {
                                                                        ...prev,
                                                                        selectedSources: isSelected 
                                                                            ? prev.selectedSources.filter(s => s !== src)
                                                                            : [...prev.selectedSources, src]
                                                                    };
                                                                })}
                                                                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${filters.selectedSources.includes(src) ? 'bg-lumina-blue/20 text-white border border-lumina-blue/30' : 'bg-white/5 text-white/20 hover:text-white/40 border border-transparent'}`}
                                                            >
                                                                {src}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 mb-3 block px-1">Sort Order</span>
                                                    <div className="flex gap-2">
                                                        {(['relevance', 'newest', 'oldest'] as const).map(order => (
                                                            <button 
                                                                key={order}
                                                                onClick={() => setFilters(prev => ({ ...prev, sortOrder: order }))}
                                                                className={`flex-1 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${filters.sortOrder === order ? 'bg-lumina-blue/20 text-white border border-lumina-blue/30' : 'bg-white/5 text-white/20 hover:text-white/40 border border-transparent'}`}
                                                            >
                                                                {order}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Key Inputs Row */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="relative group">
                                                    <User size={10} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-lumina-blue transition-colors" />
                                                    <input 
                                                        type="text"
                                                        placeholder="Filter by Author"
                                                        value={filters.author}
                                                        onChange={(e) => setFilters(prev => ({ ...prev, author: e.target.value }))}
                                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-2.5 pl-9 pr-4 text-xs text-white placeholder:text-white/10 focus:outline-none focus:border-lumina-blue/30 transition-all font-medium"
                                                    />
                                                </div>
                                                <div className="relative group">
                                                    <Zap size={10} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-lumina-blue transition-colors" />
                                                    <input 
                                                        type="text"
                                                        placeholder="Specific Keywords"
                                                        value={filters.keyword}
                                                        onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
                                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-2.5 pl-9 pr-4 text-xs text-white placeholder:text-white/10 focus:outline-none focus:border-lumina-blue/30 transition-all font-medium"
                                                    />
                                                </div>
                                            </div>

                                            {/* Time & File Type Row */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 mb-3 block px-1">Time Frame</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {(['all', 'today', 'week', 'month', 'year'] as const).map(range => (
                                                            <button 
                                                                key={range}
                                                                onClick={() => setFilters(prev => ({ ...prev, dateRange: range }))}
                                                                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${filters.dateRange === range ? 'bg-lumina-blue/20 text-white border border-lumina-blue/30' : 'bg-white/5 text-white/20 hover:text-white/40 border border-transparent'}`}
                                                            >
                                                                {range === 'all' ? 'Any Time' : range === 'today' ? 'Today' : range === 'week' ? 'Past Week' : range === 'month' ? 'Past Month' : 'Past Year'}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 mb-3 block px-1">File Type</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {(['all', 'pdf', 'doc', 'image', 'html'] as const).map(type => (
                                                            <button 
                                                                key={type}
                                                                onClick={() => setFilters(prev => ({ ...prev, fileType: type }))}
                                                                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${filters.fileType === type ? 'bg-lumina-blue/20 text-white border border-lumina-blue/30' : 'bg-white/5 text-white/20 hover:text-white/40 border border-transparent'}`}
                                                            >
                                                                {type === 'all' ? 'All Formats' : type === 'pdf' ? 'PDF' : type === 'doc' ? 'DOC' : type === 'image' ? 'IMG' : 'HTML'}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Image Gen Params */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 mb-3 block px-1">Aspect Ratio (AI Gen)</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {(['1:1', '16:9', '9:16'] as const).map(ratio => (
                                                            <button 
                                                                key={ratio}
                                                                onClick={() => setFilters(prev => ({ ...prev, aspectRatio: ratio }))}
                                                                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${filters.aspectRatio === ratio ? 'bg-lumina-blue/20 text-white border border-lumina-blue/30' : 'bg-white/5 text-white/20 hover:text-white/40 border border-transparent'}`}
                                                            >
                                                                {ratio}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 mb-3 block px-1">Art Style (AI Gen)</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {(['none', 'photorealistic', 'abstract', 'cartoon', 'cyberpunk'] as const).map(style => (
                                                            <button 
                                                                key={style}
                                                                onClick={() => setFilters(prev => ({ ...prev, artStyle: style }))}
                                                                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${filters.artStyle === style ? 'bg-lumina-blue/20 text-white border border-lumina-blue/30' : 'bg-white/5 text-white/20 hover:text-white/40 border border-transparent'}`}
                                                            >
                                                                {style}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-3 group px-1">
                                                        <div className="flex flex-col">
                                                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20">Exact Phrase Match</span>
                                                            <span className="text-[7px] text-white/10 uppercase tracking-widest">Literal query indexing</span>
                                                        </div>
                                                        <button 
                                                            onClick={() => setFilters(prev => ({ ...prev, exactMatch: !prev.exactMatch }))}
                                                            className={`w-8 h-4 rounded-full relative transition-all ${filters.exactMatch ? 'bg-lumina-blue shadow-[0_0_10px_rgba(30,144,255,0.3)]' : 'bg-white/10'}`}
                                                        >
                                                            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${filters.exactMatch ? 'left-[16px]' : 'left-[3px]'}`} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => setFilters({ 
                                                        selectedSources: [], 
                                                        dateRange: 'all', 
                                                        fileType: 'all', 
                                                        exactMatch: false,
                                                        author: '',
                                                        keyword: '',
                                                        sortOrder: 'relevance',
                                                        aspectRatio: '1:1',
                                                        artStyle: 'none'
                                                    })} 
                                                    className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-blue-400 hover:bg-blue-400/10 rounded-xl transition-all"
                                                >
                                                    Clear All Filters
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {filteredResults.length > 0 ? (
                                filteredResults.map((res, i) => (
                                    <motion.div 
                                        key={res.id} 
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileHover={{ 
                                            scale: 1.015, 
                                            y: -4,
                                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                                            borderColor: "rgba(255, 255, 255, 0.45)",
                                            backgroundColor: "rgba(255, 255, 255, 0.05)"
                                        }}
                                        transition={{ 
                                            duration: 0.4, 
                                            delay: i * 0.05,
                                            scale: { duration: 0.2 },
                                            y: { duration: 0.2 }
                                        }}
                                        onClick={() => setActiveUrl(res.url)} 
                                        className="glass p-6 rounded-[32px] border-white/10 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] uppercase tracking-widest font-bold text-lumina-blue group-hover:text-blue-300 transition-colors">{res.source}</span>
                                                <span className="w-1 h-1 rounded-full bg-white/10" />
                                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5 group-hover:bg-lumina-blue/10 group-hover:border-lumina-blue/20 transition-all">
                                                    {res.fileType === 'pdf' && <FileText size={10} className="text-red-400" />}
                                                    {res.fileType === 'doc' && <FileCode size={10} className="text-blue-400" />}
                                                    {res.fileType === 'image' && <ImageIcon size={10} className="text-pink-400" />}
                                                    {res.fileType === 'html' && <Globe size={10} className="text-emerald-400" />}
                                                    <span className="text-[8px] font-black text-white/30 uppercase tracking-widest group-hover:text-white/60 transition-colors">{res.fileType}</span>
                                                </div>
                                            </div>
                                            <span className="text-[8px] font-black text-white/10 uppercase">{res.timestamp.toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="text-lg font-bold mb-2 group-hover:underline underline-offset-4">{res.title}</h3>
                                        <p className="text-sm text-white/60 font-light line-clamp-2">{res.description}</p>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="py-12 text-center glass rounded-[32px] border-white/5">
                                    <p className="text-sm font-bold text-white/20 uppercase tracking-widest">No results match your filters</p>
                                    <button onClick={() => setFilters({ 
                                        selectedSources: [], 
                                        dateRange: 'all', 
                                        fileType: 'all', 
                                        exactMatch: false,
                                        author: '',
                                        keyword: '',
                                        sortOrder: 'relevance',
                                        aspectRatio: '1:1',
                                        artStyle: 'none'
                                    })} className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 hover:text-blue-300">Clear All Filters</button>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Recent Searches at bottom of results */}
                    {!isSearching && searchResults.length > 0 && searchQueryHistory.length > 1 && (
                        <div className="pt-12 pb-8">
                             <div className="flex items-center gap-2 mb-6 px-2">
                                <History size={14} className="text-white/20" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Related Session Paths</span>
                             </div>
                             <div className="flex flex-col gap-2">
                                {searchQueryHistory.filter(h => h && h.toLowerCase() !== (query || '').toLowerCase()).slice(0, 3).map((hQuery, idx) => (
                                    <button
                                        key={hQuery}
                                        onClick={() => triggerConfirmSearch(hQuery)}
                                        className="flex items-center justify-between p-5 glass rounded-[24px] border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-lumina-blue transition-colors">
                                                <Search size={14} />
                                            </div>
                                            <span className="text-sm font-medium text-white/50 group-hover:text-white transition-colors">{hQuery}</span>
                                        </div>
                                        <ArrowRight size={16} className="text-white/10 group-hover:text-lumina-blue transform group-hover:translate-x-1 transition-all" />
                                    </button>
                                ))}
                             </div>
                        </div>
                    )}

                    {isSearching && (
                        <div className="py-20 flex flex-col items-center gap-4 opacity-30" role="status" aria-live="polite">
                            <Loader2 className="w-10 h-10 animate-spin" aria-hidden="true" />
                            <p className="text-xs uppercase tracking-[0.4em] font-bold">Querying Nexus Intelligence...</p>
                        </div>
                    )}

                    {/* Padding for footer offset */}
                    <div className="h-80 invisible" />
                </div>
              )}
            </motion.div>
          ) : (
            /* AI Mode View */
            <motion.div 
              key="ai-mode"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto pt-8 flex flex-col min-h-full"
            >
              <div className="flex-1 space-y-8 pb-12 pr-2">
                {messages.length === 0 ? (
                  <div className="space-y-12 mb-20 text-center sm:text-left">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-loose md:leading-[1.1]">
                        <span className="opacity-40 font-light block mb-2 text-xl">Lumina Engine v4.0</span>
                        <span className="animate-magic-text font-black">TANJIA AI</span><br />
                        <span className="opacity-80 text-2xl">Infinite Possibilities.</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto sm:mx-0">
                        {[
                            { icon: ImageIcon, label: 'Create stunning images', color: 'text-pink-400' },
                            { icon: Music, label: 'Compose custom music', color: 'text-violet-400' },
                            { icon: Zap, label: 'Supercharge my day', color: 'text-blue-400' },
                            { icon: PenTool, label: 'Write premium content', color: 'text-cyan-400' }
                        ].map(preset => (
                            <button key={preset.label} onClick={() => setQuery(preset.label)} className="flex items-center gap-4 p-4 glass border-white/10 rounded-[24px] hover:bg-white/10 transition-all text-left group" aria-label={`Use preset: ${preset.label}`}>
                                <preset.icon className={`${preset.color} group-hover:scale-110 transition-all`} size={18} aria-hidden="true" />
                                <span className="text-sm font-bold opacity-60 group-hover:opacity-100 transition-opacity">{preset.label}</span>
                            </button>
                        ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-12 px-4 pb-6 border-b border-white/5">
                        <div className="flex flex-col">
                            <h2 className="text-xl font-bold text-white line-clamp-1">
                                {messages.find(m => m.role === 'user')?.content.slice(0, 40) || "Active Neural Thread"}
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                <div className={`w-1.5 h-1.5 rounded-full ${currentThreadId ? 'bg-lumina-blue animate-pulse' : 'bg-white/20'}`} />
                                <span className="text-[10px] uppercase tracking-[0.3em] text-white/30">
                                    {currentThreadId ? 'Synchronized with Neural Core' : 'Ephemeral Layer session'}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={saveCurrentThread}
                                className={`p-3 glass rounded-2xl border-white/10 transition-all ${currentThreadId ? 'text-lumina-blue bg-lumina-blue/10 border-lumina-blue/20' : 'text-white/40 hover:text-white hover:border-white/20'}`}
                                title={currentThreadId ? "Update Thread" : "Save Thread"}
                            >
                                <History size={18} />
                            </button>
                            <button 
                                onClick={startNewChat}
                                className="p-3 glass rounded-2xl border-white/10 hover:border-pink-400/50 text-white/40 hover:text-pink-400 transition-all"
                                title="Initialize New Thread"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>
                    {messages.map((msg) => (
                    <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`${speakingMessageId === msg.id ? 'ring-2 ring-lumina-pink/50 shadow-[0_0_30px_rgba(255,105,180,0.3)]' : ''} w-full ${msg.role === 'user' ? 'max-w-[85%] bg-lumina-pink/20 border border-white/10 text-white rounded-[24px] px-5 py-3 shadow-xl' : ''}`}>
                            {msg.role === 'model' && (
                                <div className="flex flex-col gap-4 w-full">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="w-8 h-8 rounded-full bg-lumina-gradient flex items-center justify-center p-0.5 border border-white/20 relative z-10">
                                                    <Sparkles size={16} className="text-white" />
                                                </div>
                                                {/* Sophisticated Thinking Aura for 'Think' mode */}
                                                {msg.isStreaming && thinkingMode === 'think' && (
                                                    <>
                                                        <motion.div 
                                                            animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                                                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                                            className="absolute inset-0 rounded-full bg-blue-500/40 blur-lg z-0"
                                                        />
                                                        <motion.div 
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                                            className="absolute -inset-1 rounded-full border border-blue-500/20 border-t-blue-500/60 z-0"
                                                        />
                                                    </>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">
                                                    {thinkingMode === 'think' ? 'Deep Neural Processing' : 'TANJIA Intelligence'}
                                                </span>
                                                {msg.isStreaming && thinkingMode === 'think' && (
                                                  <motion.span 
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: [0.2, 1, 0.2] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                    className="text-[7px] font-bold text-blue-400 uppercase tracking-[0.2em] mt-0.5"
                                                  >
                                                    Synthesizing complex patterns...
                                                  </motion.span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`${speakingMessageId === msg.id ? 'ring-2 ring-lumina-blue/50 shadow-[0_0_30px_rgba(30,144,255,0.3)] animate-pulse' : ''} glass p-6 md:p-8 rounded-[36px] border-white/10 bg-white/5 shadow-2xl w-full transition-all duration-500`}>
                                        {msg.image && (
                                            <div className="relative group/img mb-6 inline-block overflow-hidden rounded-[24px] border border-white/20 shadow-2xl">
                                                <div 
                                                    onClick={() => setZoomedImage(msg.image || null)}
                                                    className="relative cursor-zoom-in group"
                                                >
                                                    <img 
                                                        src={msg.image} 
                                                        className="max-w-full md:max-w-md transition-transform duration-500 group-hover:scale-105" 
                                                        alt={`AI Generated Visualization for: ${msg.content.substring(0, 50)}...`} 
                                                        referrerPolicy="no-referrer"
                                                    />
                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                                        <div className="p-4 bg-white/20 backdrop-blur-md rounded-full border border-white/30 transform scale-50 group-hover:scale-100 transition-all duration-300">
                                                            <Search size={32} className="text-white" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => {
                                                        const link = document.createElement('a');
                                                        link.href = msg.image!;
                                                        link.download = `tanjia-ai-${Date.now()}.png`;
                                                        link.click();
                                                        triggerHaptic('success');
                                                    }}
                                                    className="absolute top-4 right-4 p-3 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 opacity-0 group-hover/img:opacity-100 transition-all hover:bg-lumina-blue hover:scale-110"
                                                    title="Download Image"
                                                >
                                                    <Download size={16} />
                                                </button>
                                            </div>
                                        )}
                                        {msg.image && msg.prompt && (
                                            <div className="mb-6 -mt-2 px-6 py-4 glass-dark rounded-[24px] border-white/5 bg-white/[0.02]">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Sparkles size={10} className="text-white/20" />
                                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Generation Neural Prompt</span>
                                                </div>
                                                <p className="text-xs font-medium text-white/40 italic leading-relaxed">
                                                    "{msg.prompt}"
                                                </p>
                                            </div>
                                        )}
                                        <div className="text-xl md:text-2xl font-light leading-relaxed text-white/90">
                                            {msg.content}
                                            {msg.isStreaming && <span className="inline-block w-1.5 h-5 bg-lumina-blue ml-2 animate-pulse align-middle" />}
                                        </div>

                                        {!msg.isStreaming && (
                                            <div className="flex items-center gap-2 mt-6 pt-6 border-t border-white/5">
                                                <div className="flex items-center gap-1 glass p-1 rounded-xl">
                                                    <motion.button 
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9, rotate: 10 }}
                                                        onClick={() => handleFeedback(msg.id, 'positive')}
                                                        className={`p-2 rounded-lg transition-all ${msg.feedback === 'positive' ? 'text-green-400 bg-green-400/10' : 'text-white/30 hover:bg-white/10 hover:text-green-400'}`}
                                                        aria-label="Thumbs up"
                                                    >
                                                        <ThumbsUp size={14} fill={msg.feedback === 'positive' ? 'currentColor' : 'none'} />
                                                    </motion.button>
                                                    <motion.button 
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9, rotate: -10 }}
                                                        onClick={() => handleFeedback(msg.id, 'negative')}
                                                        className={`p-2 rounded-lg transition-all ${msg.feedback === 'negative' ? 'text-red-400 bg-red-400/10' : 'text-white/30 hover:bg-white/10 hover:text-red-400'}`}
                                                        aria-label="Thumbs down"
                                                    >
                                                        <ThumbsDown size={14} fill={msg.feedback === 'negative' ? 'currentColor' : 'none'} />
                                                    </motion.button>
                                                </div>
                                                <button onClick={() => speakText(msg.content, msg.id)} className={`p-2.5 rounded-xl transition-all ${speakingMessageId === msg.id ? 'bg-lumina-blue/20 text-lumina-blue ring-2 ring-lumina-blue/30' : 'text-white/30 hover:bg-white/10 hover:text-blue-400'}`} aria-label={speakingMessageId === msg.id ? "Stop listening" : "Listen to response"}>
                                                    {speakingMessageId === msg.id ? <VolumeX size={14} className="animate-bounce" /> : <Volume2 size={14} />}
                                                </button>
                                                <button onClick={() => copyToClipboard(msg.content)} className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-white/30 hover:text-white" aria-label="Copy to clipboard">
                                                    <Copy size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        if (navigator.share) {
                                                            navigator.share({
                                                                title: 'TANJIA AI Response',
                                                                text: msg.content,
                                                                url: window.location.href
                                                            }).catch(() => {});
                                                        } else {
                                                            copyToClipboard(msg.content);
                                                        }
                                                    }}
                                                    className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-white/30 hover:text-white"
                                                    aria-label="Share response"
                                                >
                                                    <Share2 size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => { setRefiningId(refiningId === msg.id ? null : msg.id); setRefinementText(''); }}
                                                    className={`p-2.5 rounded-xl transition-all ${refiningId === msg.id ? 'bg-lumina-blue text-white' : 'text-white/30 hover:bg-white/10 hover:text-lumina-blue'}`}
                                                    title="Refine Response"
                                                    aria-label="Refine response"
                                                    aria-expanded={refiningId === msg.id}
                                                >
                                                    <PenTool size={14} />
                                                </button>
                                                {msg.id.startsWith('search-overview-') && (
                                                    <button 
                                                        onClick={() => {
                                                            setMode('search');
                                                            setActiveTab('search');
                                                            setShowFilters(true);
                                                            triggerHaptic('medium');
                                                        }}
                                                        className="p-2.5 rounded-xl transition-all text-white/30 hover:bg-white/10 hover:text-lumina-blue"
                                                        title="Refine Search"
                                                        aria-label="Refine search filters"
                                                    >
                                                        <Filter size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        
                                        {/* Inline Refinement Input */}
                                        <AnimatePresence>
                                            {refiningId === msg.id && (
                                                <motion.div 
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mt-6 pt-6 border-t border-white/5"
                                                >
                                                    <div className="flex flex-col gap-4">
                                                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                                                            {['Shorter', 'More detail', 'Bullet points', 'Professional', 'Simplify'].map(tag => (
                                                                <button 
                                                                    key={tag}
                                                                    onClick={() => submitRefinement(msg.id, tag)}
                                                                    className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-lumina-blue/20 hover:border-lumina-blue/30 transition-all text-white/40 hover:text-white"
                                                                >
                                                                    {tag}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <div className="relative">
                                                            <input 
                                                                type="text" 
                                                                autoFocus
                                                                placeholder="Contextual refinement..."
                                                                value={refinementText}
                                                                onChange={(e) => setRefinementText(e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') submitRefinement(msg.id);
                                                                    if (e.key === 'Escape') setRefiningId(null);
                                                                }}
                                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-lumina-blue/40 transition-all text-white placeholder:text-white/20 pr-12"
                                                                aria-label="Refinement instruction"
                                                            />
                                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                                                {refinementText && (
                                                                    <button onClick={() => setRefinementText('')} className="p-1.5 hover:bg-white/10 rounded-lg text-white/20 hover:text-white transition-all">
                                                                        <X size={14} />
                                                                    </button>
                                                                )}
                                                                <button 
                                                                    onClick={() => submitRefinement(msg.id)}
                                                                    className="p-1.5 bg-lumina-blue rounded-xl text-white hover:brightness-110 active:scale-95 transition-all"
                                                                    aria-label="Submit refinement"
                                                                >
                                                                    <ArrowRight size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            )}
                            {msg.role === 'user' && (
                                <div className="w-full group">
                                    {msg.image && (
                                        <div 
                                            onClick={() => setZoomedImage(msg.image || null)}
                                            className="relative max-w-xs rounded-2xl mb-4 border border-white/20 shadow-lg overflow-hidden cursor-zoom-in group/uimg"
                                        >
                                            <img src={msg.image} className="w-full h-auto transition-transform duration-500 group-hover/uimg:scale-105" alt="User Upload" />
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/uimg:opacity-100 transition-all flex items-center justify-center">
                                                <Search size={24} className="text-white opacity-60" />
                                            </div>
                                        </div>
                                    )}
                                    <div className="relative flex items-start justify-between gap-4">
                                        {editingId === msg.id ? (
                                            <div className="w-full space-y-3">
                                                <textarea 
                                                    autoFocus
                                                    value={editText}
                                                    onChange={(e) => setEditText(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                                            submitEdit(msg.id);
                                                        } else if (e.key === 'Escape') {
                                                            setEditingId(null);
                                                        }
                                                    }}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-base font-medium outline-none focus:border-lumina-pink/40 h-32 scrollbar-none transition-all"
                                                    placeholder="Edit your prompt..."
                                                />
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest px-1">Ctrl+Enter to save</span>
                                                    <div className="flex items-center gap-2">
                                                        <button 
                                                            onClick={() => setEditingId(null)} 
                                                            className="px-4 py-2 glass rounded-xl text-xs font-bold hover:bg-white/5 transition-all text-white/40"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button 
                                                            onClick={() => submitEdit(msg.id)} 
                                                            className="px-4 py-2 bg-white text-black rounded-xl text-xs font-bold hover:bg-white/90 transition-all flex items-center gap-2"
                                                        >
                                                            <span>Save & Re-prompt</span>
                                                            <ArrowRight size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="text-sm font-medium leading-relaxed">{msg.content}</div>
                                                <button 
                                                    onClick={() => { setEditingId(msg.id); setEditText(msg.content); triggerHaptic('light'); }}
                                                    className="opacity-0 group-hover:opacity-100 p-2.5 glass rounded-xl text-white/20 hover:text-white hover:bg-white/10 transition-all transform translate-x-2 shrink-0 self-start"
                                                    title="Edit Message"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                  ))}
                  </>
                )}
                {isTyping && (
                    <div className="flex justify-start gap-4 mb-8" role="status" aria-live="polite">
                        <NeuralProcessingIndicator />
                    </div>
                )}
                {/* CRITICAL SCROLL PADDING */}
                <div ref={bottomRef} className="h-64 invisible" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Bottom Navigation / Input - INTEGRATED VIEW */}
      <footer className="relative z-50 px-4 pb-4 pt-2 flex flex-col items-center bg-black/95 backdrop-blur-3xl border-t border-white/5">
        
        <div className="w-full max-w-xl flex flex-col gap-3">
            {/* Integrated Header Controls */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-1 p-1 glass rounded-full border-white/10 scale-90 -ml-2">
                    <button 
                        onClick={() => { setMode('ai'); triggerHaptic('light'); }}
                        className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all duration-300 ${mode === 'ai' ? 'bg-lumina-gradient text-white shadow-xl' : 'text-white/20 hover:text-white/40'}`}
                        aria-pressed={mode === 'ai'}
                    >
                        AI Neural
                    </button>
                    <button 
                        onClick={() => { setMode('search'); triggerHaptic('light'); }}
                        className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all duration-300 ${mode === 'search' ? 'bg-white/10 text-white shadow-xl' : 'text-white/20 hover:text-white/40'}`}
                        aria-pressed={mode === 'search'}
                    >
                        Search
                    </button>
                </div>

                <div className="flex items-center gap-1 p-1 glass rounded-full border-white/10 scale-90 -mr-2">
                    <button 
                      onClick={() => setThinkingMode('fast')}
                      className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${thinkingMode === 'fast' ? 'bg-white/10 text-white shadow-xl' : 'text-white/20 hover:text-white/40'}`}
                      aria-label="Switch to Fast thinking mode"
                      aria-pressed={thinkingMode === 'fast'}
                    >
                      Fast
                    </button>
                    <button 
                      onClick={() => setThinkingMode('pro')}
                      className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${thinkingMode === 'pro' ? 'bg-lumina-blue text-white shadow-xl' : 'text-white/20 hover:text-white/40'}`}
                      aria-label="Switch to Pro thinking mode"
                      aria-pressed={thinkingMode === 'pro'}
                    >
                      Pro
                    </button>
                    <button 
                      onClick={() => setThinkingMode('think')}
                      className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${thinkingMode === 'think' ? 'bg-pink-500/20 text-pink-300 shadow-xl border border-pink-500/30' : 'text-white/20 hover:text-white/40'}`}
                      aria-label="Switch to Deep Think mode"
                      aria-pressed={thinkingMode === 'think'}
                    >
                      Think
                    </button>
                </div>

                <div className="flex items-center gap-1 p-1 glass rounded-full border-white/10 scale-90 -mr-2">
                    <button 
                      onClick={() => { setIsAutoSpeak(!isAutoSpeak); triggerHaptic('light'); }}
                      className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${isAutoSpeak ? 'bg-blue-500/20 text-blue-300 shadow-xl border border-blue-500/30' : 'text-white/20 hover:text-white/40'}`}
                      aria-label={isAutoSpeak ? "Disable auto speak" : "Enable auto speak"}
                      aria-pressed={isAutoSpeak}
                    >
                      <Volume2 size={10} />
                      {isAutoSpeak ? 'Voice On' : 'Voice Off'}
                    </button>
                    <button 
                      onClick={() => { isListening ? stopListening() : startListening(); triggerHaptic('light'); }}
                      className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${isListening ? 'bg-pink-500/20 text-pink-300 shadow-xl border border-pink-500/30' : 'text-white/20 hover:text-white/40'}`}
                      aria-label={isListening ? "Stop microphone" : "Start microphone"}
                      aria-pressed={isListening}
                    >
                      <Mic size={10} />
                      {isListening ? 'Mic On' : 'Mic Off'}
                    </button>
                </div>
            </div>

            {/* Input Area */}
            <div className="relative group w-full">
                <AnimatePresence mode="popLayout">
                    {selectedImage && (
                        <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute -top-12 left-0 right-0 glass px-3 py-1.5 rounded-xl h-10 flex items-center gap-2 border-white/20 mx-2"
                        >
                            <div className="w-6 h-6 rounded-md overflow-hidden border border-white/10">
                                <img src={selectedImage.data} className="w-full h-full object-cover" alt="Thumb" />
                            </div>
                            <span className="text-[8px] font-black opacity-60 uppercase tracking-[0.2em] text-lumina-blue">
                                {mode === 'search' ? 'Visual Search Active' : 'Neural Component Linked'}
                            </span>
                            <button onClick={() => setSelectedImage(null)} className="p-1 hover:bg-white/10 rounded-full ml-auto">
                                <X size={12} />
                            </button>
                        </motion.div>
                    )}

                    {mode === 'ai' && showGenSettings && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute bottom-full mb-4 left-0 right-0 glass-dark p-4 rounded-3xl border-white/10 shadow-2xl backdrop-blur-3xl mx-2 z-50"
                        >
                            <div className="flex items-center justify-between mb-4 px-1">
                                <div className="flex items-center gap-2">
                                    <Sparkles size={14} className="text-lumina-blue" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Generation Engine Tuning</span>
                                </div>
                                <button onClick={() => setShowGenSettings(false)} className="p-1 hover:bg-white/10 rounded-full">
                                    <X size={14} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 mb-2 block">Aspect Ratio</span>
                                    <div className="flex gap-2">
                                        {(['1:1', '16:9', '9:16'] as const).map(ratio => (
                                            <button 
                                                key={ratio}
                                                onClick={() => { setFilters(prev => ({ ...prev, aspectRatio: ratio })); triggerHaptic('light'); }}
                                                className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all border ${filters.aspectRatio === ratio ? 'bg-lumina-blue/20 text-white border-lumina-blue/40' : 'bg-white/5 text-white/40 border-transparent hover:border-white/10'}`}
                                            >
                                                {ratio}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 mb-2 block">Visual Style</span>
                                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                                        {(['none', 'photorealistic', 'sketch', 'oil-painting', 'abstract', 'cartoon', 'pixel-art', '3d-render', 'cyberpunk', 'steampunk'] as const).map(style => (
                                            <button 
                                                key={style}
                                                onClick={() => { setFilters(prev => ({ ...prev, artStyle: style })); triggerHaptic('light'); }}
                                                className={`py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all border ${filters.artStyle === style ? 'bg-lumina-blue/20 text-white border-lumina-blue/40 shadow-[0_0_10px_rgba(30,144,255,0.3)]' : 'bg-white/5 text-white/40 border-transparent hover:border-white/10'}`}
                                            >
                                                {style.split('-').join(' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 mb-2 block">Neural Features</span>
                                    <button 
                                        onClick={() => { setIsAutoSpeak(!isAutoSpeak); triggerHaptic('light'); }}
                                        className={`w-full py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${isAutoSpeak ? 'bg-lumina-pink/20 text-white border-lumina-pink/40' : 'bg-white/5 text-white/40 border-transparent hover:border-white/10'}`}
                                    >
                                        {isAutoSpeak ? <Volume2 size={12} className="animate-pulse" /> : <VolumeX size={12} />}
                                        {isAutoSpeak ? 'Auto-Speech Active' : 'Auto-Speech Muted'}
                                    </button>
                                </div>

                                {imagePromptHistory.length > 0 && (
                                    <div className="pt-4 border-t border-white/5">
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 mb-3 block">Past Prompts</span>
                                        <div className="flex flex-col gap-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                                            {imagePromptHistory.map((prompt, idx) => (
                                                <button 
                                                    key={idx}
                                                    onClick={() => { setQuery(prompt); triggerHaptic('light'); }}
                                                    className="text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all group/pitem border border-transparent hover:border-white/10"
                                                >
                                                    <p className="text-[10px] text-white/60 group-hover/pitem:text-white line-clamp-2 leading-relaxed italic">
                                                        "{prompt}"
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-white/5">
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 mb-3 block">Inspiration Presets</span>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { label: "Neon Samurai", prompt: "/image a futuristic samurai in a neon-drenched cyberpunk alleyway, 8k, cinematic lighting" },
                                            { label: "Floating Isles", prompt: "/image ethereal floating islands with waterfalls cascading into clouds, dreamlike fantasy art" },
                                            { label: "Glass Tech", prompt: "/image minimalist architectural design of a glass laboratory in a snowy forest, sharp focus" },
                                            { label: "Organic Core", prompt: "/image abstract macro photography of iridescent bioluminescent organisms, glowing details" }
                                        ].map((preset, idx) => (
                                            <button 
                                                key={idx}
                                                onClick={() => { setQuery(preset.prompt); triggerHaptic('medium'); }}
                                                className="flex flex-col gap-1 p-2 rounded-xl bg-lumina-blue/5 hover:bg-lumina-blue/10 border border-white/5 hover:border-lumina-blue/20 transition-all text-left"
                                            >
                                                <span className="text-[10px] font-bold text-white/80">{preset.label}</span>
                                                <span className="text-[8px] text-white/20 line-clamp-1 italic">Preset Config</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {mode === 'search' && suggestions.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-full mb-3 left-0 right-0 glass-dark p-2 rounded-2xl border-white/10 shadow-2xl backdrop-blur-3xl mx-2 z-50 flex flex-wrap gap-1.5"
                    >
                        <div className="w-full flex items-center justify-between mb-1.5 px-2">
                             <div className="flex items-center gap-1.5">
                                <Sparkles size={10} className="text-lumina-blue" />
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40 leading-none">AI Suggestions</span>
                             </div>
                             <button onClick={() => setSuggestions([])} className="p-0.5 hover:bg-white/10 rounded-full">
                                <X size={10} className="text-white/20" />
                             </button>
                        </div>
                        {suggestions.map((suggestion, idx) => (
                            <button 
                                key={idx}
                                onClick={() => { setQuery(suggestion); setSuggestions([]); handleSend(); triggerHaptic('light'); }}
                                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all text-xs text-white/70 hover:text-white flex items-center gap-2 group/sug animate-in fade-in slide-in-from-bottom-1 duration-300 fill-mode-both"
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                <span className="flex-1 text-left">{suggestion}</span>
                                <ArrowRight size={10} className="opacity-0 group-hover/sug:opacity-100 transition-opacity text-lumina-blue" />
                            </button>
                        ))}
                    </motion.div>
                )}

                {mode === 'ai' && (query.toLowerCase().startsWith('/image') || query.toLowerCase().includes('generate an image') || query.toLowerCase().includes('create an image')) && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-full mb-3 left-0 right-0 glass-dark p-3 rounded-2xl border-white/10 shadow-2xl backdrop-blur-3xl mx-2 z-50 flex flex-col gap-3"
                    >
                        <div className="space-y-2">
                             <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-1.5">
                                    <Layout size={10} className="text-lumina-blue" />
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40 leading-none">Aspect Ratio</span>
                                </div>
                                <span className="text-[10px] font-bold text-lumina-blue/80">{filters.aspectRatio}</span>
                            </div>
                            <div className="flex gap-1.5 p-1 bg-white/5 rounded-xl">
                                {(['1:1', '16:9', '9:16'] as const).map(ratio => (
                                    <button 
                                        key={ratio}
                                        onClick={() => { setFilters(prev => ({ ...prev, aspectRatio: ratio })); triggerHaptic('light'); }}
                                        className={`flex-1 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all border ${filters.aspectRatio === ratio ? 'bg-lumina-blue/20 text-white border-lumina-blue/40 shadow-[0_0_15px_rgba(30,144,255,0.2)]' : 'text-white/30 border-transparent hover:bg-white/5 hover:text-white/60'}`}
                                    >
                                        {ratio}
                                    </button>
                                ))}
                            </div>
                        </div>

                         <div className="space-y-2">
                             <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-1.5">
                                    <PenTool size={10} className="text-lumina-pink" />
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40 leading-none">Art Style</span>
                                </div>
                                <span className="text-[10px] font-bold text-lumina-pink/80 uppercase">{filters.artStyle}</span>
                            </div>
                            <div className="grid grid-cols-5 gap-1.5 p-1 bg-white/5 rounded-xl">
                                {(['none', 'photorealistic', 'sketch', 'oil-painting', 'abstract', 'cartoon', 'pixel-art', '3d-render', 'cyberpunk', 'steampunk'] as const).map(style => (
                                    <button 
                                        key={style}
                                        onClick={() => { setFilters(prev => ({ ...prev, artStyle: style })); triggerHaptic('light'); }}
                                        className={`py-2 rounded-lg text-[8px] font-black tracking-tighter transition-all border uppercase ${filters.artStyle === style ? 'bg-lumina-pink/20 text-white border-lumina-pink/40 shadow-[0_0_15px_rgba(255,105,180,0.2)]' : 'text-white/30 border-transparent hover:bg-white/5 hover:text-white/60'}`}
                                        title={style}
                                    >
                                        {style === 'none' ? 'Def' : 
                                         style === 'photorealistic' ? 'Real' : 
                                         style === 'sketch' ? 'Skch' :
                                         style === 'oil-painting' ? 'Oil' :
                                         style === 'abstract' ? 'Abs' : 
                                         style === 'cartoon' ? 'Toon' : 
                                         style === 'pixel-art' ? 'Pix' :
                                         style === '3d-render' ? '3D' :
                                         style === 'cyberpunk' ? 'Cyber' : 'Steam'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                <div className="relative glass-dark rounded-[24px] border-white/10 flex items-center px-2 py-1.5 min-h-[54px] shadow-2xl backdrop-blur-3xl group-focus-within:border-white/20 transition-all">
                    <button 
                        onClick={() => { fileInputRef.current?.click(); triggerHaptic('light'); }} 
                        className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-white/30 hover:text-white group/upload"
                        title="Upload Image"
                        aria-label="Upload an image to TANJIA AI"
                    >
                        <ImageIcon size={ 18 } className="group-hover/upload:scale-110 transition-transform" />
                    </button>

                    {mode === 'ai' && (
                        <button 
                            onClick={() => { setShowGenSettings(!showGenSettings); triggerHaptic('light'); }} 
                            className={`p-2.5 rounded-xl transition-all ${showGenSettings ? 'text-lumina-blue bg-lumina-blue/10' : 'text-white/30 hover:text-white hover:bg-white/10'} group/tune`}
                            title="Generation Settings"
                        >
                            {(query.toLowerCase().startsWith('/image') || query.toLowerCase().includes('generate an image') || query.toLowerCase().includes('create an image')) ? (
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                                    <ImageIcon size={ 18 } className="text-lumina-blue" />
                                </motion.div>
                            ) : (
                                <SlidersHorizontal size={ 18 } className="group-hover/tune:rotate-90 transition-transform duration-500" />
                            )}
                        </button>
                    )}
                    
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={mode === 'search' ? "Explore anything..." : "Message TANJIA AI..."}
                        className="flex-1 bg-transparent border-none outline-none text-sm px-3 font-medium text-white placeholder:text-white/10 w-0"
                        aria-label={mode === 'search' ? "Search anything" : "AI message input"}
                    />

                    <div className="flex items-center gap-1 pr-1">
                        <button 
                            onClick={startListening}
                            className={`p-2.5 rounded-xl transition-all ${isListening ? 'text-pink-400 bg-pink-400/10 animate-pulse' : 'text-white/20 hover:bg-white/10'}`}
                        >
                            <Mic size={20} />
                        </button>
                        <button 
                            onClick={() => handleSend()} 
                            className="p-3 bg-lumina-gradient text-white rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-lg flex-shrink-0"
                            aria-label={mode === 'search' ? "Search" : "Send message"}
                        >
                            {mode === 'search' ? <Search size={18} strokeWidth={3} /> : <ArrowRight size={18} strokeWidth={3} />}
                        </button>
                    </div>
                </div>

                {mode === 'ai' && messages.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-wrap items-center justify-center gap-2 mt-4"
                    >
                        {[
                            'Cyberpunk city in 2077',
                            'Astronaut in a library',
                            'Surrealist clock melting',
                            'Isometric 3D icon set'
                        ].map((suggestion) => (
                            <button
                                key={suggestion}
                                onClick={() => { setQuery(suggestion); triggerHaptic('light'); }}
                                className="px-3 py-1.5 glass rounded-full text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all border border-white/5 active:scale-95"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </motion.div>
                )}

                {mode === 'ai' && messages.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-8 flex justify-center"
                    >
                        <button 
                            onClick={() => triggerConfirmSearch('Generate an image of a futuristic cityscape')}
                            className="group relative px-8 py-4 glass rounded-[32px] border-lumina-blue/30 bg-lumina-blue/5 flex items-center gap-4 hover:bg-lumina-blue/10 hover:border-lumina-blue/50 transition-all shadow-[0_0_40px_rgba(30,144,255,0.1)] active:scale-95"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-lumina-blue/20 flex items-center justify-center text-lumina-blue group-hover:scale-110 transition-transform">
                                <Sparkles size={24} />
                            </div>
                            <div className="text-left">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-lumina-blue/60 block mb-1">Featured Generation</span>
                                <span className="text-sm font-bold text-white group-hover:text-lumina-blue transition-colors">Futuristic Cityscape</span>
                            </div>
                            <ArrowRight size={18} className="ml-4 text-lumina-blue/40 group-hover:text-lumina-blue transform group-hover:translate-x-2 transition-all" />
                        </button>
                    </motion.div>
                )}
            </div>
        </div>

        {/* Global Bottom Navigation Bar - COMPACT */}
        <nav className="w-full max-w-[300px] h-10 glass rounded-full flex items-center justify-around px-2 border-white/5 shadow-2xl relative overflow-hidden mt-4 mb-2">
            {[
                { id: 'search', icon: Home, label: 'Home' },
                { id: 'ai', icon: Zap, label: 'Neural' },
                { id: 'history', icon: History, label: 'Threads' },
                { id: 'analytics', icon: Monitor, label: 'Insights' }
            ].map(tab => (
                <button 
                    key={tab.id}
                    onClick={() => { 
                      if (tab.id === 'history' || tab.id === 'analytics') {
                        setActiveTab(tab.id as any);
                        setShowGenSettings(false);
                      } else {
                        setActiveTab('home');
                        setMode(tab.id as any);
                        if (tab.id !== 'ai') setShowGenSettings(false);
                      }
                      triggerHaptic('light'); 
                    }}
                    aria-label={`Navigate to ${tab.label}`}
                    aria-current={(tab.id === activeTab) || (tab.id === 'search' && activeTab === 'home' && mode === 'search') || (tab.id === 'ai' && activeTab === 'home' && mode === 'ai') ? 'page' : undefined}
                    className={`flex items-center gap-1.5 transition-all duration-300 px-3 py-1.5 rounded-full ${ (tab.id === activeTab) || (tab.id === 'search' && activeTab === 'home' && mode === 'search') || (tab.id === 'ai' && activeTab === 'home' && mode === 'ai') ? 'text-white bg-white/5' : 'text-white/20 hover:text-white/40'}`}
                >
                    <tab.icon size={14} strokeWidth={2.5} />
                    <span className="text-[7px] font-black uppercase tracking-widest">{tab.label}</span>
                </button>
            ))}
        </nav>
      </footer>

      {/* History Modal Overlay */}
      <AnimatePresence>
        {showHistory && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-xl p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black tracking-tighter">Thread History</h3>
              <button onClick={() => setShowHistory(false)} className="p-3 glass rounded-2xl"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              <button 
                onClick={() => { startNewChat(); setShowHistory(false); }}
                className="w-full p-6 glass border-pink-500/20 bg-pink-500/5 rounded-[32px] flex items-center gap-4 hover:bg-pink-500/10 transition-all border-dashed border-2"
              >
                <Plus size={20} className="text-pink-400" />
                <span className="font-bold text-pink-400 uppercase tracking-widest text-xs text-left">Start Fresh Thread</span>
              </button>
              {chatHistory.map(chat => (
                <div key={chat.id} className="p-6 glass border-white/5 rounded-[32px] hover:border-white/20 transition-all group flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">{chat.date.toLocaleDateString()}</span>
                    <span className="font-bold text-white/80 line-clamp-1">{chat.title}</span>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-all"><X size={16}/></button>
                </div>
              ))}
              {chatHistory.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 opacity-20">
                  <History size={40} className="mb-4" />
                  <p className="text-xs font-bold uppercase tracking-widest">No previous threads</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden Inputs and Overlays */}
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
      
      <AnimatePresence>
        {activeUrl && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-0 z-[100] flex flex-col bg-black/60 backdrop-blur-3xl p-2 md:p-6">
            <div className="flex-1 glass rounded-[44px] border-white/20 overflow-hidden flex flex-col shadow-2xl">
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/40">
                <button onClick={() => setActiveUrl(null)} className="p-3 hover:bg-white/10 rounded-2xl flex items-center gap-2">
                    <X size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Close Browser</span>
                </button>
                <div className="flex items-center gap-3 px-6 py-2 bg-white/5 rounded-full border border-white/10 max-w-sm">
                    <Globe size={14} className="text-lumina-blue animate-pulse" />
                    <span className="text-[10px] font-bold text-white/60 truncate uppercase tracking-widest">{activeUrl}</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center opacity-20">
                    <RefreshCcw size={16} />
                </div>
              </div>
              <iframe src={activeUrl} className="flex-1 w-full border-none bg-white/90" title="TANJIA Secure WebView" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Image Zoom Modal */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomedImage(null)}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
          >
            <motion.button 
              className="absolute top-8 right-8 p-3 glass rounded-full text-white/40 hover:text-white transition-colors"
            >
              <X size={24} />
            </motion.button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              src={zoomedImage}
              className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain"
              alt="Zoomed AI Visualization"
              referrerPolicy="no-referrer"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
