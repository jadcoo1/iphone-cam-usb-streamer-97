
import React, { useState, useEffect } from 'react';
import { Usb, Monitor, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getPlatformCapabilities } from '@/utils/platformDetection';

const DesktopUSBManager = () => {
  const [usbDevices, setUsbDevices] = useState<USBDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();
  const capabilities = getPlatformCapabilities();

  const scanForUSBDevices = async () => {
    if (!capabilities.hasUSBAccess) {
      setError('USB access not available on this platform');
      return;
    }

    setIsScanning(true);
    setError('');

    try {
      const devices = await navigator.usb!.getDevices();
      setUsbDevices(devices);
      
      toast({
        title: "USB Scan Complete",
        description: `Found ${devices.length} USB devices`,
      });
    } catch (err) {
      const errorMsg = `USB scan failed: ${err}`;
      setError(errorMsg);
      console.error(errorMsg);
    } finally {
      setIsScanning(false);
    }
  };

  const requestUSBDevice = async () => {
    if (!capabilities.hasUSBAccess) return;

    try {
      const device = await navigator.usb!.requestDevice({
        filters: [
          { vendorId: 0x05AC }, // Apple
          { vendorId: 0x04E8 }, // Samsung
          { vendorId: 0x18D1 }, // Google
        ]
      });

      await scanForUSBDevices();
      
      toast({
        title: "USB Device Connected",
        description: `Connected to ${device.manufacturerName || 'Unknown'} ${device.productName || 'Device'}`,
      });
    } catch (err: any) {
      if (err.name !== 'NotFoundError') {
        setError(`Failed to connect USB device: ${err}`);
      }
    }
  };

  useEffect(() => {
    if (capabilities.hasUSBAccess) {
      scanForUSBDevices();
    }
  }, []);

  if (!capabilities.hasUSBAccess) {
    return (
      <Card className="bg-gray-900 border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Usb className="w-5 h-5" />
            USB Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-400">USB access not available on this platform</p>
            <p className="text-sm text-gray-500 mt-2">
              Use the desktop app for full USB device support
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-700 text-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Usb className="w-5 h-5" />
            Desktop USB Manager
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={requestUSBDevice}
              variant="ghost"
              size="sm"
              className="text-blue-400 hover:text-blue-300"
            >
              Connect Device
            </Button>
            <Button
              onClick={scanForUSBDevices}
              variant="ghost"
              size="sm"
              disabled={isScanning}
              className="text-gray-400 hover:text-white"
            >
              {isScanning ? 'Scanning...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {usbDevices.length === 0 ? (
          <div className="text-center py-8">
            <Monitor className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No USB devices connected</p>
            <p className="text-sm text-gray-500 mt-2">
              Connect your phone via USB and click "Connect Device"
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {usbDevices.map((device, index) => (
              <div
                key={`${device.vendorId}-${device.productId}-${index}`}
                className="p-4 rounded-lg border border-gray-600 bg-gray-800"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-700 rounded-lg">
                      <Usb className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {device.manufacturerName || 'Unknown'} {device.productName || 'Device'}
                      </h3>
                      <p className="text-sm text-gray-400">
                        VID: {device.vendorId?.toString(16).toUpperCase()} 
                        PID: {device.productId?.toString(16).toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-600">Connected</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DesktopUSBManager;
