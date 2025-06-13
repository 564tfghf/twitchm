import React from 'react';

interface TwitchPlayerProps {
  channel: string;
}

const TwitchPlayer: React.FC<TwitchPlayerProps> = ({ channel }) => {
  const parentDomain = window.location.hostname;
  
  return (
    <div className="relative w-full bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://player.twitch.tv/?channel=${channel}&parent=${parentDomain}&muted=false`}
          frameBorder="0"
          allowFullScreen
          title={`${channel}'s stream`}
        />
      </div>
      
      {/* Stream info overlay */}
      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-white font-medium text-sm">
            Watching: {channel}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TwitchPlayer;