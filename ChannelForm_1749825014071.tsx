import React, { useState } from 'react';
import { Search, Tv } from 'lucide-react';

interface ChannelFormProps {
  onChannelChange: (channel: string) => void;
  defaultChannel: string;
  isLoading?: boolean;
}

const ChannelForm: React.FC<ChannelFormProps> = ({ 
  onChannelChange, 
  defaultChannel,
  isLoading = false
}) => {
  const [inputChannel, setInputChannel] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputChannel.trim() && !isLoading) {
      onChannelChange(inputChannel.trim().toLowerCase());
      setInputChannel('');
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-violet-500/10 rounded-lg">
          <Tv className="w-5 h-5 text-violet-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">
          Watch Any Stream
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder={`Enter Twitch channel (e.g., ${defaultChannel})`}
            value={inputChannel}
            onChange={(e) => setInputChannel(e.target.value)}
            disabled={isLoading}
            className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
          />
        </div>
        
        <button
          type="submit"
          disabled={!inputChannel.trim() || isLoading}
          className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Loading...
            </div>
          ) : (
            'Watch'
          )}
        </button>
      </form>
      
      <p className="text-slate-400 text-sm mt-3">
        Enter any Twitch streamer's username to start watching and interacting on-chain
      </p>
    </div>
  );
};

export default ChannelForm;