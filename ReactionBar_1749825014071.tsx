import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Text, OrbitControls } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/web';
import { REACTION_EMOJIS } from '../config/constants';

interface ReactionBarProps {
  onReaction: (emoji: string) => void;
  isLoading?: boolean;
}

interface FloatingReaction {
  id: string;
  emoji: string;
  x: number;
  y: number;
}

const ReactionBar: React.FC<ReactionBarProps> = ({ onReaction, isLoading = false }) => {
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);

  const handleReactionClick = (emoji: string) => {
    if (isLoading) return;

    // Add floating animation
    const newReaction: FloatingReaction = {
      id: Date.now().toString(),
      emoji,
      x: Math.random() * 300,
      y: Math.random() * 100
    };

    setFloatingReactions(prev => [...prev, newReaction]);

    // Remove after animation
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== newReaction.id));
    }, 3000);

    // Send to blockchain
    onReaction(emoji);
  };

  return (
    <>
      {/* Reaction Bar */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center gap-3 bg-slate-800/90 backdrop-blur-md p-3 rounded-full border border-slate-700/50 shadow-2xl">
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReactionClick(emoji)}
              disabled={isLoading}
              className="relative group p-3 rounded-full bg-slate-700/50 hover:bg-violet-600/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
            >
              <span className="text-2xl filter group-hover:drop-shadow-lg transition-all duration-200">
                {emoji}
              </span>
              
              {/* Hover effect */}
              <div className="absolute inset-0 rounded-full bg-violet-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </button>
          ))}
          
          {isLoading && (
            <div className="flex items-center gap-2 px-3">
              <div className="w-4 h-4 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin"></div>
              <span className="text-violet-400 text-sm">Sending...</span>
            </div>
          )}
        </div>
      </div>

      {/* Floating Reactions */}
      {floatingReactions.map((reaction) => (
        <FloatingReactionComponent
          key={reaction.id}
          reaction={reaction}
        />
      ))}

      {/* 3D Background Canvas */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
          <Text
            position={[0, 0, 0]}
            fontSize={0.5}
            color="#8b5cf6"
            anchorX="center"
            anchorY="middle"
          >
            Live Reactions
          </Text>
        </Canvas>
      </div>
    </>
  );
};

const FloatingReactionComponent: React.FC<{ reaction: FloatingReaction }> = ({ reaction }) => {
  const styles = useSpring({
    from: { 
      opacity: 1, 
      transform: `translate(${reaction.x}px, ${reaction.y}px) scale(1)` 
    },
    to: { 
      opacity: 0, 
      transform: `translate(${reaction.x}px, ${reaction.y - 100}px) scale(1.5)` 
    },
    config: { duration: 3000 }
  });

  return (
    <animated.div
      style={styles}
      className="fixed bottom-20 left-1/2 pointer-events-none z-10 text-4xl"
    >
      {reaction.emoji}
    </animated.div>
  );
};

export default ReactionBar;