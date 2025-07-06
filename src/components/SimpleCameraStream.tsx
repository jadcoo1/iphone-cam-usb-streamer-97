
import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, SwitchCamera, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const SimpleCameraStream = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      setError('');
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      streamRef.current = stream;
      setIsStreaming(true);
      
      toast({
        title: "Camera Started",
        description: `Using ${facingMode === 'user' ? 'front' : 'back'} camera`,
      });

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Camera access failed';
      setError(errorMsg);
      console.error('Camera error:', err);
      
      toast({
        title: "Camera Error",
        description: "Please allow camera access and try again",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsStreaming(false);
    setError('');
    
    toast({
      title: "Camera Stopped",
      description: "Camera stream has been stopped",
    });
  };

  const switchCamera = async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    
    if (isStreaming) {
      await startCamera();
    }
  };

  const toggleStream = () => {
    if (isStreaming) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-black rounded-lg overflow-hidden shadow-2xl relative">
        <video
          ref={videoRef}
          className="w-full h-auto aspect-video object-cover"
          autoPlay
          muted
          playsInline
        />
        
        {error && (
          <div className="absolute top-4 left-4 right-4 bg-red-900/90 border border-red-700 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-400 font-medium">Camera Error</p>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {!isStreaming && (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-10 h-10" />
              </div>
              <p className="text-lg font-semibold mb-2">📱 Simple Camera Stream</p>
              <p className="text-gray-400">Click start to begin streaming</p>
            </div>
          </div>
        )}
        
        <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4">
          <Button
            onClick={toggleStream}
            variant={isStreaming ? "destructive" : "default"}
            size="lg"
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
          >
            {isStreaming ? (
              <>
                <Pause className="w-5 h-5 mr-2" />
                Stop Camera
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Start Camera
              </>
            )}
          </Button>
          
          <Button
            onClick={switchCamera}
            variant="ghost"
            size="lg"
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white"
          >
            <SwitchCamera className="w-5 h-5 mr-2" />
            {facingMode === 'user' ? 'Back' : 'Front'}
          </Button>
        </div>
        
        {isStreaming && (
          <div className="absolute top-4 right-4">
            <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              LIVE
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleCameraStream;
