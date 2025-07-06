
import React, { useState, useEffect } from 'react';
import { Settings, Edit2, Save, X, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface VirtualDevice {
  id: string;
  name: string;
  originalName: string;
  active: boolean;
  stream?: MediaStream;
}

interface VirtualDeviceManagerProps {
  virtualWebcam: MediaStream | null;
  onDeviceNameChange: (deviceId: string, newName: string) => void;
}

const VirtualDeviceManager = ({ virtualWebcam, onDeviceNameChange }: VirtualDeviceManagerProps) => {
  const [virtualDevices, setVirtualDevices] = useState<VirtualDevice[]>([]);
  const [editingDevice, setEditingDevice] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (virtualWebcam) {
      // Create or update virtual device when webcam stream is available
      const deviceId = 'virtual-iphone-cam';
      const existingDevice = virtualDevices.find(d => d.id === deviceId);
      
      if (!existingDevice) {
        const newDevice: VirtualDevice = {
          id: deviceId,
          name: 'iPhone Virtual Webcam',
          originalName: 'iPhone Camera',
          active: true,
          stream: virtualWebcam
        };
        
        setVirtualDevices(prev => [...prev, newDevice]);
        
        toast({
          title: "Virtual Device Created",
          description: "iPhone Virtual Webcam is now available",
        });
      } else {
        // Update existing device
        setVirtualDevices(prev => 
          prev.map(device => 
            device.id === deviceId 
              ? { ...device, active: true, stream: virtualWebcam }
              : device
          )
        );
      }
    } else {
      // Deactivate virtual devices when no stream
      setVirtualDevices(prev => 
        prev.map(device => ({ ...device, active: false, stream: undefined }))
      );
    }
  }, [virtualWebcam]);

  const startEditing = (device: VirtualDevice) => {
    setEditingDevice(device.id);
    setEditName(device.name);
  };

  const saveDeviceName = (deviceId: string) => {
    if (editName.trim()) {
      setVirtualDevices(prev => 
        prev.map(device => 
          device.id === deviceId 
            ? { ...device, name: editName.trim() }
            : device
        )
      );
      
      onDeviceNameChange(deviceId, editName.trim());
      
      toast({
        title: "Device Renamed",
        description: `Virtual device renamed to "${editName.trim()}"`,
      });
    }
    
    setEditingDevice(null);
    setEditName('');
  };

  const cancelEditing = () => {
    setEditingDevice(null);
    setEditName('');
  };

  const createNewVirtualDevice = () => {
    const newId = `virtual-device-${Date.now()}`;
    const newDevice: VirtualDevice = {
      id: newId,
      name: `Virtual Webcam ${virtualDevices.length + 1}`,
      originalName: 'Custom Virtual Device',
      active: false
    };
    
    setVirtualDevices(prev => [...prev, newDevice]);
    startEditing(newDevice);
  };

  const removeDevice = (deviceId: string) => {
    setVirtualDevices(prev => prev.filter(device => device.id !== deviceId));
    toast({
      title: "Device Removed",
      description: "Virtual device has been removed",
    });
  };

  return (
    <Card className="bg-gray-900 border-gray-700 text-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="w-5 h-5" />
            Virtual Devices
          </CardTitle>
          <Button
            onClick={createNewVirtualDevice}
            variant="ghost"
            size="sm"
            className="text-blue-400 hover:text-blue-300"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Device
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {virtualDevices.length === 0 ? (
          <div className="text-center py-4 text-gray-400">
            <p>No virtual devices created yet</p>
            <p className="text-sm mt-1">Start streaming to create your first virtual webcam</p>
          </div>
        ) : (
          virtualDevices.map((device) => (
            <div
              key={device.id}
              className="p-3 rounded-lg border border-gray-600 bg-gray-800"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-gray-700 rounded-lg">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    {editingDevice === device.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="Enter device name"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              saveDeviceName(device.id);
                            } else if (e.key === 'Escape') {
                              cancelEditing();
                            }
                          }}
                          autoFocus
                        />
                        <Button
                          onClick={() => saveDeviceName(device.id)}
                          variant="ghost"
                          size="sm"
                          className="text-green-400 hover:text-green-300"
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={cancelEditing}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <h3 className="font-medium">{device.name}</h3>
                        <p className="text-sm text-gray-400">{device.originalName}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={device.active ? "default" : "secondary"}
                    className={device.active ? "bg-green-600" : "bg-gray-600"}
                  >
                    {device.active ? 'Active' : 'Inactive'}
                  </Badge>
                  {editingDevice !== device.id && (
                    <>
                      <Button
                        onClick={() => startEditing(device)}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => removeDevice(device.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        
        {virtualDevices.some(d => d.active) && (
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
            <h4 className="text-sm font-medium text-blue-300 mb-2">Usage Instructions:</h4>
            <ul className="text-xs text-blue-200 space-y-1">
              <li>• Your virtual webcam is now available in video conferencing apps</li>
              <li>• Look for "{virtualDevices.find(d => d.active)?.name}" in your app's camera settings</li>
              <li>• Works with Zoom, Teams, Discord, OBS, and other applications</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VirtualDeviceManager;
