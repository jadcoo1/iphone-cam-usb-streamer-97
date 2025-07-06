
import React, { useState, useEffect } from 'react';
import { Smartphone, Search, RefreshCw, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Device {
  id: string;
  name: string;
  model: string;
  connected: boolean;
  batteryLevel?: number;
}

interface DeviceDetectionProps {
  onDeviceSelect: (device: Device) => void;
  selectedDevice?: Device;
}

const DeviceDetection = ({ onDeviceSelect, selectedDevice }: DeviceDetectionProps) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  // Add debug logging
  const addDebugLog = (message: string) => {
    console.log(`DeviceDetection: ${message}`);
    setDebugInfo(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Check for USB device access
  const checkUSBSupport = async () => {
    addDebugLog('Checking USB support...');
    
    if (!navigator.usb) {
      setError('USB API not supported in this browser. Please use Chrome, Edge, or Opera.');
      addDebugLog('USB API not supported');
      return false;
    }
    
    addDebugLog('USB API is available');
    return true;
  };

  // Scan for actual USB devices
  const scanForRealDevices = async () => {
    setError('');
    setIsScanning(true);
    addDebugLog('Starting real device scan...');
    
    try {
      if (!(await checkUSBSupport())) {
        setIsScanning(false);
        return;
      }

      // Request permission and get connected USB devices
      let usbDevices = [];
      
      try {
        // Get already authorized devices
        usbDevices = await navigator.usb.getDevices();
        addDebugLog(`Found ${usbDevices.length} authorized USB devices`);
        
        // Log device details for debugging
        usbDevices.forEach((device, index) => {
          addDebugLog(`Device ${index}: VID:${device.vendorId?.toString(16)} PID:${device.productId?.toString(16)}`);
        });
        
      } catch (err) {
        addDebugLog(`Error getting USB devices: ${err}`);
      }

      // Filter for Apple devices (Apple's USB Vendor ID is 0x05AC)
      const appleDevices = usbDevices.filter(device => 
        device.vendorId === 0x05AC || device.vendorId === 1452
      );
      
      addDebugLog(`Found ${appleDevices.length} Apple devices`);

      // Convert USB devices to our device format
      const detectedDevices: Device[] = appleDevices.map((device, index) => ({
        id: `usb-${device.vendorId}-${device.productId}-${index}`,
        name: `iPhone (USB)`,
        model: 'iPhone',
        connected: true,
        batteryLevel: undefined
      }));

      // If no real devices found, show mock devices for testing
      if (detectedDevices.length === 0) {
        addDebugLog('No Apple devices found, showing test devices');
        const mockDevices: Device[] = [
          {
            id: 'mock-1',
            name: "Test iPhone",
            model: 'iPhone (Not detected)',
            connected: false,
            batteryLevel: undefined
          }
        ];
        setDevices(mockDevices);
      } else {
        setDevices(detectedDevices);
      }

    } catch (err) {
      const errorMsg = `Failed to scan for devices: ${err}`;
      setError(errorMsg);
      addDebugLog(errorMsg);
    }
    
    setIsScanning(false);
  };

  // Request device access
  const requestDeviceAccess = async () => {
    addDebugLog('Requesting device access...');
    
    try {
      if (!navigator.usb) {
        setError('USB API not supported');
        return;
      }

      // Request access to Apple devices
      const device = await navigator.usb.requestDevice({
        filters: [{ vendorId: 0x05AC }] // Apple's vendor ID
      });
      
      addDebugLog(`Access granted to device: VID:${device.vendorId?.toString(16)} PID:${device.productId?.toString(16)}`);
      
      // Rescan after getting permission
      await scanForRealDevices();
      
    } catch (err) {
      if (err.name === 'NotFoundError') {
        addDebugLog('No device selected by user');
      } else {
        const errorMsg = `Failed to request device access: ${err}`;
        setError(errorMsg);
        addDebugLog(errorMsg);
      }
    }
  };

  useEffect(() => {
    addDebugLog('Component mounted, starting initial scan');
    scanForRealDevices();
  }, []);

  return (
    <Card className="bg-gray-900 border-gray-700 text-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="w-5 h-5" />
            Device Detection
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={requestDeviceAccess}
              variant="ghost"
              size="sm"
              className="text-blue-400 hover:text-blue-300"
            >
              Grant Access
            </Button>
            <Button
              onClick={scanForRealDevices}
              variant="ghost"
              size="sm"
              disabled={isScanning}
              className="text-gray-400 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <p className="text-red-400 text-sm font-medium">Error</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {debugInfo.length > 0 && (
          <div className="p-3 bg-gray-800 rounded-lg">
            <p className="text-gray-400 text-xs mb-2">Debug Log:</p>
            {debugInfo.map((log, index) => (
              <p key={index} className="text-gray-300 text-xs font-mono">{log}</p>
            ))}
          </div>
        )}

        {isScanning ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Scanning for USB devices...</p>
          </div>
        ) : devices.length === 0 ? (
          <div className="text-center py-8">
            <Smartphone className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No devices detected</p>
            <div className="text-sm text-gray-500 mt-4 space-y-2">
              <p><strong>Troubleshooting:</strong></p>
              <p>1. Connect iPhone via USB cable</p>
              <p>2. Click "Grant Access" button</p>
              <p>3. Select your iPhone when prompted</p>
              <p>4. Trust this computer on iPhone</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {devices.map((device) => (
              <div
                key={device.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedDevice?.id === device.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 hover:border-gray-500 bg-gray-800'
                }`}
                onClick={() => onDeviceSelect(device)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-700 rounded-lg">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">{device.name}</h3>
                      <p className="text-sm text-gray-400">{device.model}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {device.batteryLevel && (
                      <span className="text-sm text-gray-400">
                        {device.batteryLevel}%
                      </span>
                    )}
                    <Badge 
                      variant={device.connected ? "default" : "secondary"}
                      className={device.connected ? "bg-green-600" : "bg-gray-600"}
                    >
                      {device.connected ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeviceDetection;
