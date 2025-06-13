import React, { useRef, useEffect } from 'react';
import { ExternalLink, User, MessageSquare } from 'lucide-react';

export interface Comment {
  id: string;
  username: string;
  message: string;
  timestamp: number;
  txHash?: string;
  explorerUrl?: string;
}

interface CommentsListProps {
  comments: Comment[];
  isLoading?: boolean;
}

const CommentsList: React.FC<CommentsListProps> = ({ 
  comments,
  isLoading = false
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const formatTime = (timestamp: number): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return 'Invalid time';
    }
  };

  const truncateTxHash = (hash: string): string => {
    if (!hash || hash.length < 10) return hash;
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };

  // Auto-scroll to bottom for new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      const element = chatContainerRef.current;
      element.scrollTop = element.scrollHeight;
    }
  }, [comments]);

  return (
    <div className="fixed top-[140px] right-4 w-[400px] h-[calc(100vh-160px)] flex flex-col bg-slate-800/90 backdrop-blur-md rounded-xl border border-slate-700/50 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-violet-400" />
          <h2 className="text-lg font-semibold text-white">
            Live Chat
          </h2>
          <span className="px-2 py-0.5 text-xs font-medium bg-violet-500/10 text-violet-400 rounded-full">
            {comments.length}
          </span>
        </div>
        
        {isLoading && (
          <div className="w-4 h-4 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin"></div>
        )}
      </div>
      
      {/* Chat messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth"
      >
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
            <MessageSquare className="h-8 w-8 text-slate-500" />
            <p className="text-center">
              Waiting for chat messages...
              <br />
              <span className="text-sm">Comments will appear here and be stored on-chain</span>
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div 
              key={comment.id}
              className="group bg-slate-700/30 rounded-lg p-3 hover:bg-slate-700/50 transition-all duration-200 border border-slate-600/20 hover:border-violet-500/30"
            >
              {/* User info */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-violet-500/10 rounded-md">
                    <User className="h-3 w-3 text-violet-400" />
                  </div>
                  <span className="font-medium text-violet-400 text-sm group-hover:text-violet-300 transition-colors">
                    {comment.username}
                  </span>
                </div>
                <span className="text-slate-400 text-xs">
                  {formatTime(comment.timestamp)}
                </span>
              </div>
              
              {/* Message */}
              <p className="text-slate-200 text-sm mb-2 break-words leading-relaxed">
                {comment.message}
              </p>
              
              {/* Transaction info */}
              {comment.txHash && comment.explorerUrl && (
                <div className="flex items-center justify-between text-xs">
                  <a
                    href={comment.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-violet-400 hover:text-violet-300 transition-colors group-hover:underline"
                  >
                    <span>{truncateTxHash(comment.txHash)}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                    On-chain
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentsList;