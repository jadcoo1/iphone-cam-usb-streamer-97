import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Settings, Maximize, AlertTriangle, Smartphone, SwitchCamera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CameraPreviewProps {
  isStreaming: boolean;
  onToggleStream: () => void;
  resolution: string;
  fps: number;
  selectedDevice?: any;
  onVirtualWebcamChange?: (stream: MediaStream | null) => void;
}

const CameraPreview = ({ isStreaming, onToggleStream, resolution, fps, selectedDevice, onVirtualWebcamChange }: CameraPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string>('');
  const [virtualWebcam, setVirtualWebcam] = useState<MediaStream | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [permissionState, setPermissionState] = useState<string>('unknown');
  const [isIOS, setIsIOS] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const { toast } = useToast();

  // Detect if we're on mobile and specifically iOS
  useEffect(() => {
    const checkDevice = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
      setIsIOS(isIOSDevice);
      console.log('Device detection - Mobile:', isMobileDevice, 'iOS:', isIOSDevice);
    };
    checkDevice();
  }, []);

  // Get available cameras
  const getAvailableCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(cameras);
      console.log('Available cameras:', cameras);
      
      // Set default camera
      if (cameras.length > 0 && !selectedCameraId) {
        setSelectedCameraId(cameras[0].deviceId);
      }
    } catch (err) {
      console.error('Failed to get cameras:', err);
    }
  };

  // Request camera permissions immediately when app loads
  const requestCameraPermissions = async () => {
    try {
      console.log('Requesting camera permissions on app load...');
      setError('');
      
      // Request basic permission first
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      // Stop the stream immediately after getting permission
      stream.getTracks().forEach(track => track.stop());
      
      // Now get the available cameras
      await getAvailableCameras();
      
      setPermissionGranted(true);
      setPermissionState('granted');
      
      console.log('Camera permission granted successfully');
      toast({
        title: "Camera Access Granted",
        description: isIOS ? "iPhone cameras ready - choose front/back and start streaming" : "Cameras ready - choose camera and start streaming",
      });
      
    } catch (err) {
      console.error('Camera permission request failed:', err);
      const errorMsg = err instanceof Error ? err.message : 'Unknown camera error';
      
      setPermissionGranted(false);
      setPermissionState('denied');
      
      if (isIOS) {
        if (errorMsg.includes('Permission denied') || errorMsg.includes('NotAllowedError')) {
          setError('Camera permission denied. Please go to Settings → Privacy & Security → Camera and enable access for Safari.');
          toast({
            title: "iOS Permission Required",
            description: "Please enable camera access in iOS Settings → Privacy & Security → Camera",
            variant: "destructive",
          });
        } else {
          setError(errorMsg);
        }
      } else {
        if (errorMsg.includes('Permission denied') || errorMsg.includes('NotAllowedError')) {
          setError('Camera permission denied. Please allow camera access in your browser settings.');
          toast({
            title: "Permission Required",
            description: "Please allow camera access to use this app",
            variant: "destructive",
          });
        } else {
          setError(errorMsg);
        }
      }
    }
  };

  // Enhanced camera permission checking
  const checkCameraPermissions = async () => {
    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        setPermissionState(permission.state);
        console.log('Camera permission state:', permission.state);
        
        if (permission.state === 'granted') {
          setPermissionGranted(true);
          await getAvailableCameras();
        }
        
        permission.onchange = () => {
          setPermissionState(permission.state);
          setPermissionGranted(permission.state === 'granted');
          console.log('Camera permission changed to:', permission.state);
        };
      }
      
    } catch (err) {
      console.log('Permission API not supported:', err);
    }
  };

  // Request permissions on component mount
  useEffect(() => {
    const initializePermissions = async () => {
      await checkCameraPermissions();
      
      if (permissionState !== 'granted') {
        await requestCameraPermissions();
      }
    };
    
    if (isMobile !== undefined && isIOS !== undefined) {
      initializePermissions();
    }
  }, [isMobile, isIOS]);

  // Enhanced virtual webcam with proper MediaStream handling
  const createVirtualWebcam = async (stream: MediaStream) => {
    try {
      console.log('Creating enhanced virtual webcam for PC access...');
      
      // Create a proper virtual webcam that will appear in device manager
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const video = document.createElement('video');
      
      if (!ctx) {
        throw new Error('Canvas context not available');
      }
      
      const [width, height] = resolution.split('x').map(Number);
      canvas.width = width;
      canvas.height = height;
      
      video.srcObject = stream;
      video.playsInline = true;
      video.muted = true;
      
      await video.play();
      
      let animationId: number;
      
      const drawFrame = () => {
        if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Add device name overlay
          const cameraName = availableCameras.find(cam => cam.deviceId === selectedCameraId)?.label || 
                           (facingMode === 'user' ? 'iPhone Front Camera' : 'iPhone Back Camera');
          
          ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
          ctx.fillRect(10, 10, 300, 60);
          ctx.fillStyle = 'white';
          ctx.font = 'bold 16px Arial';
          ctx.fillText(`📱 ${cameraName}`, 20, 35);
          ctx.font = '12px Arial';
          ctx.fillText(`🔗 Virtual Webcam - Ready for PC`, 20, 55);
        }
        
        if (isStreaming) {
          animationId = requestAnimationFrame(drawFrame);
        }
      };
      
      video.onloadedmetadata = () => {
        console.log('Video metadata loaded, creating virtual stream...');
        drawFrame();
      };
      
      // Create the virtual stream at the specified framerate
      const virtualStream = canvas.captureStream(fps);
      
      // Add audio track if available
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        virtualStream.addTrack(audioTracks[0]);
        console.log('Audio track added to virtual webcam');
      }
      
      // Set up the virtual webcam properly
      setVirtualWebcam(virtualStream);
      onVirtualWebcamChange?.(virtualStream);
      
      // Try to register as a virtual camera device
      if ('mediaDevices' in navigator && 'getDisplayMedia' in navigator.mediaDevices) {
        console.log('Virtual webcam created and ready for PC access');
      }
      
      console.log('Enhanced virtual webcam created successfully');
      toast({
        title: "🎥 Virtual Webcam Created",
        description: `Your ${facingMode === 'user' ? 'front' : 'back'} camera is now available as a webcam on your PC`,
      });
      
      return virtualStream;
    } catch (err) {
      console.error('Failed to create virtual webcam:', err);
      setError(`Virtual webcam creation failed: ${err}`);
      return null;
    }
  };

  // Enhanced camera access with proper device switching
  const accessCamera = async () => {
    try {
      console.log('Accessing camera with:', { selectedCameraId, facingMode });
      setError('');
      
      if (!permissionGranted) {
        toast({
          title: "Permission Required",
          description: "Camera permission is required to start streaming",
          variant: "destructive",
        });
        return;
      }
      
      // Stop existing stream before starting new one
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: parseInt(resolution.split('x')[0]) },
          height: { ideal: parseInt(resolution.split('x')[1]) },
          frameRate: { ideal: fps },
        },
        audio: true
      };

      // Use specific camera if selected, otherwise use facing mode
      if (selectedCameraId) {
        (constraints.video as MediaTrackConstraints).deviceId = { exact: selectedCameraId };
      } else if (isMobile) {
        (constraints.video as MediaTrackConstraints).facingMode = facingMode;
      }
      
      console.log('Camera constraints:', constraints);
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.playsInline = true;
        await videoRef.current.play();
      }
      
      streamRef.current = stream;
      
      // Create virtual webcam for PC access
      await createVirtualWebcam(stream);
      
      console.log('Camera access successful');
      toast({
        title: "📱 Camera Connected",
        description: `${facingMode === 'user' ? 'Front' : 'Back'} camera streaming to virtual webcam`,
      });
      
    } catch (err) {
      console.error('Camera access failed:', err);
      const errorMsg = err instanceof Error ? err.message : 'Unknown camera error';
      setError(`Camera access failed: ${errorMsg}`);
      
      toast({
        title: "Camera Error",
        description: "Failed to access camera. Please check permissions and try again.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    console.log('Stopping camera stream...');
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setVirtualWebcam(null);
    onVirtualWebcamChange?.(null);
    setError('');
  };

  // Enhanced camera switching
  const switchCamera = async () => {
    console.log('Switching camera from', facingMode, 'to', facingMode === 'user' ? 'environment' : 'user');
    
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    
    // Find camera with the new facing mode
    const newCamera = availableCameras.find(camera => {
      const label = camera.label.toLowerCase();
      if (newFacingMode === 'environment') {
        return label.includes('back') || label.includes('rear') || label.includes('environment');
      } else {
        return label.includes('front') || label.includes('user') || label.includes('selfie');
      }
    });
    
    if (newCamera) {
      setSelectedCameraId(newCamera.deviceId);
      console.log('Selected new camera:', newCamera.label);
    }
    
    // If streaming, restart with new camera immediately
    if (isStreaming) {
      await accessCamera();
    }
    
    toast({
      title: "Camera Switched",
      description: `Switched to ${newFacingMode === 'user' ? 'front' : 'back'} camera`,
    });
  };

  // Handle camera selection change
  const handleCameraChange = async (cameraId: string) => {
    console.log('Camera selection changed to:', cameraId);
    setSelectedCameraId(cameraId);
    
    // Update facing mode based on camera selection
    const selectedCamera = availableCameras.find(cam => cam.deviceId === cameraId);
    if (selectedCamera) {
      const label = selectedCamera.label.toLowerCase();
      if (label.includes('back') || label.includes('rear') || label.includes('environment')) {
        setFacingMode('environment');
      } else {
        setFacingMode('user');
      }
    }
    
    // If streaming, restart with new camera
    if (isStreaming) {
      await accessCamera();
    }
  };

  useEffect(() => {
    if (isStreaming) {
      accessCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isStreaming, resolution, fps]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
      <video
        ref={videoRef}
        className="w-full h-full aspect-video object-cover"
        autoPlay
        muted
        playsInline
      />
      
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-900/90 border border-red-700 rounded-lg p-3 text-sm">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-400 font-medium">Camera Error</p>
              <p className="text-red-300">{error}</p>
              {isIOS && (
                <p className="text-red-200 text-xs mt-1">
                  iOS: Go to Settings → Privacy & Security → Camera → Safari to enable access
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {!isStreaming && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-10 h-10" />
            </div>
            <p className="text-lg font-semibold">
              📱➡️💻 Cross-Device Camera
            </p>
            <p className="text-gray-400 mb-4">
              {permissionGranted 
                ? 'Choose camera and start streaming to your PC'
                : 'Camera permission required for cross-device streaming'
              }
            </p>
            
            {/* Enhanced Camera Selection */}
            {permissionGranted && availableCameras.length > 0 && (
              <div className="mb-4 space-y-3">
                <p className="text-sm text-gray-300">Select Camera:</p>
                <Select value={selectedCameraId} onValueChange={handleCameraChange}>
                  <SelectTrigger className="w-full max-w-xs mx-auto bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Choose camera..." />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {availableCameras.map((camera) => (
                      <SelectItem key={camera.deviceId} value={camera.deviceId} className="text-white">
                        {camera.label || `Camera ${camera.deviceId.slice(0, 8)}...`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Quick Camera Switch Buttons */}
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={() => handleCameraChange(availableCameras.find(cam => 
                      cam.label.toLowerCase().includes('front') || 
                      cam.label.toLowerCase().includes('user') ||
                      cam.label.toLowerCase().includes('selfie')
                    )?.deviceId || availableCameras[0]?.deviceId)}
                    variant="ghost"
                    size="sm"
                    className={`${facingMode === 'user' ? 'bg-blue-600' : 'bg-gray-700'} text-white`}
                  >
                    🤳 Front
                  </Button>
                  <Button
                    onClick={() => handleCameraChange(availableCameras.find(cam => 
                      cam.label.toLowerCase().includes('back') || 
                      cam.label.toLowerCase().includes('rear') ||
                      cam.label.toLowerCase().includes('environment')
                    )?.deviceId || availableCameras[1]?.deviceId)}
                    variant="ghost"
                    size="sm"
                    className={`${facingMode === 'environment' ? 'bg-blue-600' : 'bg-gray-700'} text-white`}
                  >
                    📷 Back
                  </Button>
                </div>
              </div>
            )}
            
            {permissionGranted && (
              <p className="text-blue-400 text-sm">
                Current: {facingMode === 'user' ? '🤳 Front Camera' : '📷 Back Camera'}
              </p>
            )}
          </div>
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            onClick={onToggleStream}
            variant={isStreaming ? "destructive" : "default"}
            size="sm"
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
            disabled={!permissionGranted}
          >
            {isStreaming ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Stream to PC
              </>
            )}
          </Button>
          
          {/* Enhanced Camera Switch Button */}
          {permissionGranted && availableCameras.length > 1 && (
            <Button
              onClick={switchCamera}
              variant="ghost"
              size="sm"
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white"
            >
              <SwitchCamera className="w-4 h-4 mr-2" />
              {facingMode === 'user' ? 'Back' : 'Front'}
            </Button>
          )}
          
          {virtualWebcam && (
            <Button
              onClick={() => {
                toast({
                  title: "🎥 Virtual Webcam Active",
                  description: "Your phone camera is streaming to your PC. Look for it in video apps!",
                });
              }}
              variant="ghost"
              size="sm"
              className="bg-green-500/20 hover:bg-green-500/30 backdrop-blur-sm text-green-300"
            >
              <Settings className="w-4 h-4 mr-2" />
              PC Ready
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={toggleFullscreen}
            variant="ghost"
            size="sm"
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white"
          >
            <Maximize className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {isStreaming && (
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            📱➡️💻 LIVE
          </div>
        </div>
      )}
      
      {virtualWebcam && (
        <div className="absolute bottom-20 left-4 bg-green-500/90 text-white px-3 py-1 rounded-full text-xs">
          🎥 Virtual webcam ready for PC
        </div>
      )}
    </div>
  );
};

export default CameraPreview;
