import React, { useState, useEffect } from 'react';
import CameraPreview from '@/components/CameraPreview';
import ConnectionStatus from '@/components/ConnectionStatus';
import CameraControls from '@/components/CameraControls';
import DeviceDetection from '@/components/DeviceDetection';
import VirtualDeviceManager from '@/components/VirtualDeviceManager';
import DesktopUSBManager from '@/components/DesktopUSBManager';
import { Camera, Monitor, Smartphone } from 'lucide-react';
import { detectPlatform, getPlatformCapabilities } from '@/utils/platformDetection';

interface Device {
  id: string;
  name: string;
  model: string;
  connected: boolean;
  batteryLevel?: number;
}

const Index = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | undefined>();
  const [virtualWebcam, setVirtualWebcam] = useState<MediaStream | null>(null);
  const [platform, setPlatform] = useState(detectPlatform());
  const [capabilities, setCapabilities] = useState(getPlatformCapabilities());
  const [cameraSettings, setCameraSettings] = useState({
    resolution: '1920x1080',
    fps: 30,
    autoFocus: true,
    flashEnabled: false,
    exposure: 50
  });

  useEffect(() => {
    const detectedPlatform = detectPlatform();
    const detectedCapabilities = getPlatformCapabilities();
    setPlatform(detectedPlatform);
    setCapabilities(detectedCapabilities);
    
    console.log('Platform detected:', detectedPlatform);
    console.log('Capabilities:', detectedCapabilities);
  }, []);

  const handleDeviceSelect = (device: Device) => {
    setSelectedDevice(device);
    console.log('Selected device:', device);
  };

  const toggleStream = () => {
    setIsStreaming(!isStreaming);
    console.log('Stream toggled:', !isStreaming);
  };

  const handleVirtualWebcamChange = (stream: MediaStream | null) => {
    setVirtualWebcam(stream);
  };

  const handleDeviceNameChange = (deviceId: string, newName: string) => {
    console.log(`Device ${deviceId} renamed to: ${newName}`);
  };

  const getPlatformTitle = () => {
    if (platform.isIOS) return '📱 iPhone Camera Streamer';
    if (platform.isElectron) return '💻 Desktop Camera Hub';
    if (platform.isDesktop) return '🖥️ PC Camera Bridge';
    return '📱➡️💻 Cross-Device Camera';
  };

  const getPlatformDescription = () => {
    if (platform.isIOS) return 'Stream your iPhone camera wirelessly';
    if (platform.isElectron) return 'Full desktop camera management suite';
    if (platform.isDesktop) return 'Connect mobile cameras to your PC';
    return 'Stream your phone camera to your PC';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                {platform.isIOS ? <Smartphone className="w-6 h-6" /> : <Camera className="w-6 h-6" />}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{getPlatformTitle()}</h1>
                <p className="text-gray-400 text-sm">{getPlatformDescription()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Monitor className="w-4 h-4" />
              <span className="capitalize">{capabilities.platform}</span>
              {virtualWebcam && <span className="text-green-400">• 🎥 Active</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Camera Preview */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <CameraPreview
                isStreaming={isStreaming}
                onToggleStream={toggleStream}
                resolution={cameraSettings.resolution}
                fps={cameraSettings.fps}
                selectedDevice={selectedDevice}
                onVirtualWebcamChange={handleVirtualWebcamChange}
              />
              
              {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-400">{cameraSettings.resolution}</div>
                  <div className="text-sm text-gray-400">Resolution</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-400">{cameraSettings.fps}</div>
                  <div className="text-sm text-gray-400">FPS</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {isStreaming ? 'ON' : 'OFF'}
                  </div>
                  <div className="text-sm text-gray-400">Streaming</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {capabilities.platform.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-400">Platform</div>
                </div>
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            <ConnectionStatus
              isConnected={selectedDevice?.connected || false}
              deviceName={selectedDevice?.name || 'No Device'}
              connectionType={selectedDevice?.connected ? 'usb' : 'disconnected'}
              batteryLevel={selectedDevice?.batteryLevel}
            />

            {/* Conditional Device Management */}
            {capabilities.hasUSBAccess ? (
              <DesktopUSBManager />
            ) : (
              <DeviceDetection
                onDeviceSelect={handleDeviceSelect}
                selectedDevice={selectedDevice}
              />
            )}

            <VirtualDeviceManager
              virtualWebcam={virtualWebcam}
              onDeviceNameChange={handleDeviceNameChange}
            />

            <CameraControls
              resolution={cameraSettings.resolution}
              fps={cameraSettings.fps}
              onResolutionChange={(resolution) =>
                setCameraSettings(prev => ({ ...prev, resolution }))
              }
              onFpsChange={(fps) =>
                setCameraSettings(prev => ({ ...prev, fps }))
              }
              autoFocus={cameraSettings.autoFocus}
              onAutoFocusChange={(autoFocus) =>
                setCameraSettings(prev => ({ ...prev, autoFocus }))
              }
              flashEnabled={cameraSettings.flashEnabled}
              onFlashChange={(flashEnabled) =>
                setCameraSettings(prev => ({ ...prev, flashEnabled }))
              }
              exposure={cameraSettings.exposure}
              onExposureChange={(exposure) =>
                setCameraSettings(prev => ({ ...prev, exposure }))
              }
            />
          </div>
        </div>

        {/* Platform-specific Instructions */}
        <div className="mt-12 bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            {platform.isIOS ? '📱 iOS Camera Setup' : platform.isElectron ? '💻 Desktop App Guide' : '🌐 Cross-Platform Setup'}
          </h3>
          
          {platform.isIOS ? (
            <div className="space-y-4">
              <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                <h4 className="text-blue-300 font-medium mb-2">📱 iPhone Setup:</h4>
                <ul className="text-blue-200 text-sm space-y-1">
                  <li>• Allow camera permissions when prompted</li>
                  <li>• Choose between front (selfie) and back (main) camera</li>
                  <li>• Tap "Stream to PC" to start broadcasting</li>
                  <li>• Keep Safari open while using video apps on your PC</li>
                  <li>• Your camera will appear as a virtual webcam on connected devices</li>
                </ul>
              </div>
            </div>
          ) : platform.isElectron ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
                <h4 className="text-green-300 font-medium mb-2">💻 Desktop Features:</h4>
                <ul className="text-green-200 text-sm space-y-1">
                  <li>• Full USB device management and detection</li>
                  <li>• Direct iPhone/Android camera integration</li>
                  <li>• Advanced virtual webcam creation</li>
                  <li>• Works with all video conferencing apps</li>
                  <li>• No browser limitations or restrictions</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-4 gap-6 text-sm">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <span className="font-medium">Open on Phone</span>
                </div>
                <p className="text-gray-400 ml-8">Open this webpage on your iPhone/Android using Safari/Chrome browser</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <span className="font-medium">Choose Camera</span>
                </div>
                <p className="text-gray-400 ml-8">Select front/back camera and allow camera permissions when prompted</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <span className="font-medium">Start Streaming</span>
                </div>
                <p className="text-gray-400 ml-8">Tap "Stream to PC" to create a virtual webcam that appears on your computer</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">4</div>
                  <span className="font-medium">Use on PC</span>
                </div>
                <p className="text-gray-400 ml-8">Your phone camera will appear as a webcam option in Zoom, Teams, Discord, etc.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
