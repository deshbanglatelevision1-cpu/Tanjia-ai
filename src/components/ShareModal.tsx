import React from 'react';
import { X, Copy, Mail, Twitter, Facebook } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export const ShareModal: React.FC<Props> = ({ isOpen, onClose, url, title }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-black/90 border border-white/10 p-6 rounded-[32px] w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-white">Share Video</h3>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/50">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              <button onClick={copyToClipboard} className="flex items-center gap-3 w-full p-4 glass rounded-2xl hover:bg-white/10 transition-all text-white font-bold">
                <Copy size={20} className="text-lumina-blue" /> Copy Link
              </button>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 w-full p-4 glass rounded-2xl hover:bg-white/10 transition-all text-white font-bold">
                <Twitter size={20} className="text-sky-400" /> Share on Twitter
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 w-full p-4 glass rounded-2xl hover:bg-white/10 transition-all text-white font-bold">
                <Facebook size={20} className="text-blue-600" /> Share on Facebook
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
