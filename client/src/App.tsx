import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Toaster, toast } from 'react-hot-toast';
import { DEFAULT_TWITCH_CHANNEL } from './config/constants';
import { useTransaction } from './hooks/useTransaction';
import { initTwitchClient, changeChannel, setMessageHandler, TwitchMessage } from './services/twitch';

// Components
import TwitchPlayer from './components/TwitchPlayer';
import ChannelForm from './components/ChannelForm';
import CommentsList, { Comment } from './components/CommentsList';
import ReactionBar from './components/ReactionBar';
import CaptureButton from './components/CaptureButton';
import WalletStatus from './components/WalletStatus';

function App() {
  const [channel, setChannel] = useState(DEFAULT_TWITCH_CHANNEL);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isChannelLoading, setIsChannelLoading] = useState(false);
  const streamRef = useRef<HTMLDivElement>(null);
  
  const { ready, authenticated } = usePrivy();
  const { 
    sendComment, 
    sendReaction, 
    mintMoment, 
    isLoading: isTransactionLoading
  } = useTransaction();

  // Initialize Twitch client
  useEffect(() => {
    const init = async () => {
      const success = await initTwitchClient(channel);
      if (!success) {
        toast.error('Failed to connect to Twitch chat');
      }
    };
    
    init();
  }, []);

  // Set up message handler for Twitch comments
  useEffect(() => {
    if (ready && authenticated) {
      setMessageHandler(async (message: TwitchMessage) => {
        // Optimistic UI update
        const newComment: Comment = {
          id: message.id,
          username: message.username,
          message: message.message,
          timestamp: message.timestamp
        };
        
        setComments(prev => [...prev, newComment]);
        
        try {
          // Send to blockchain
          const result = await sendComment(message.username, message.message);
          
          if (result) {
            // Update with transaction info
            setComments(prev => 
              prev.map(comment => 
                comment.id === message.id 
                  ? { ...comment, txHash: result.hash, explorerUrl: result.explorerUrl }
                  : comment
              )
            );
          }
        } catch (error) {
          console.error('Failed to send comment to blockchain:', error);
          // Remove failed comment from UI
          setComments(prev => prev.filter(comment => comment.id !== message.id));
        }
      });
    }
  }, [ready, authenticated, sendComment]);

  // Handle channel change
  const handleChannelChange = useCallback(async (newChannel: string) => {
    setIsChannelLoading(true);
    
    try {
      const success = await changeChannel(newChannel);
      
      if (success) {
        setChannel(newChannel);
        setComments([]); // Clear comments for new channel
        toast.success(`Switched to channel: ${newChannel}`);
      } else {
        toast.error(`Failed to switch to channel: ${newChannel}`);
      }
    } catch (error) {
      toast.error('Error switching channel');
    } finally {
      setIsChannelLoading(false);
    }
  }, []);

  // Handle reactions
  const handleReaction = useCallback(async (emoji: string) => {
    if (!authenticated) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      const result = await sendReaction(emoji);
      
      if (result) {
        toast.success(
          <div>
            <p>Reaction sent! {emoji}</p>
            <a 
              href={result.explorerUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 underline"
            >
              View on Explorer
            </a>
          </div>
        );
      }
    } catch (error) {
      console.error('Failed to send reaction:', error);
    }
  }, [authenticated, sendReaction]);

  // Handle moment capture and NFT minting
  const handleCaptureMoment = useCallback(async (imageData: string) => {
    if (!authenticated) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      const result = await mintMoment(imageData);
      
      if (result) {
        toast.success(
          <div>
            <p>Stream moment minted as NFT!</p>
            <a 
              href={result.explorerUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 underline"
            >
              View on Explorer
            </a>
          </div>
        );
      }
    } catch (error) {
      console.error('Failed to mint moment:', error);
    }
  }, [authenticated, mintMoment]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #475569'
          }
        }}
      />
      
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TS</span>
              </div>
              <h1 className="text-2xl font-bold text-white">
                Twitch<span className="text-violet-400">Stream</span>
              </h1>
              <span className="px-2 py-1 bg-violet-500/10 text-violet-400 text-xs font-medium rounded-full">
                On-Chain
              </span>
            </div>
            
            <WalletStatus />
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="lg:pr-[420px]">
          <div className="space-y-6">
            {/* Channel Form */}
            <ChannelForm
              onChannelChange={handleChannelChange}
              defaultChannel={DEFAULT_TWITCH_CHANNEL}
              isLoading={isChannelLoading}
            />
            
            {/* Stream Player */}
            <div ref={streamRef} className="relative">
              <TwitchPlayer channel={channel} />
              
              {/* Capture Button */}
              {authenticated && (
                <CaptureButton
                  onCapture={handleCaptureMoment}
                  streamRef={streamRef}
                />
              )}
            </div>
            
            {/* Info Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-3">
                How it works
              </h3>
              <div className="space-y-2 text-slate-300">
                <p>
                  <span className="font-medium text-violet-400">💬 Comments:</span> Every Twitch chat message is stored on the Monad blockchain in real-time
                </p>
                <p>
                  <span className="font-medium text-violet-400">🎭 Reactions:</span> Click reaction emojis to send 3D animated reactions on-chain
                </p>
                <p>
                  <span className="font-medium text-violet-400">📸 Moments:</span> Capture and mint special stream moments as NFTs instantly
                </p>
                <p className="text-sm text-slate-400 mt-3">
                  Powered by Privy embedded wallets and Monad's lightning-fast blockchain
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Comments Sidebar */}
      <CommentsList 
        comments={comments}
        isLoading={isTransactionLoading}
      />
      
      {/* Reaction Bar */}
      {authenticated && (
        <ReactionBar 
          onReaction={handleReaction}
          isLoading={isTransactionLoading}
        />
      )}
    </div>
  );
}

export default App;