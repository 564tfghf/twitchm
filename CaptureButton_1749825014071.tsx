import React, { useState } from 'react';
import { Camera, Download } from 'lucide-react';
import html2canvas from 'html2canvas';

interface CaptureButtonProps {
  onCapture: (imageData: string) => Promise<void>;
  streamRef: React.RefObject<HTMLDivElement>;
}

const CaptureButton: React.FC<CaptureButtonProps> = ({ onCapture, streamRef }) => {
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = async () => {
    if (!streamRef.current || isCapturing) return;
    
    setIsCapturing(true);
    
    try {
      // Capture the stream area
      const canvas = await html2canvas(streamRef.current, {
        scale: 0.8,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#1e293b'
      });
      
      const imageData = canvas.toDataURL('image/png');
      
      // Send to blockchain for minting
      await onCapture(imageData);
      
    } catch (error) {
      console.error('Failed to capture moment:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="absolute top-4 right-4 z-10">
      <button
        onClick={handleCapture}
        disabled={isCapturing}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
      >
        {isCapturing ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Minting NFT...
          </>
        ) : (
          <>
            <Camera className="w-4 h-4" />
            Capture Moment
          </>
        )}
      </button>
    </div>
  );
};

export default CaptureButton;