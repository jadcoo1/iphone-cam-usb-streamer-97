
import React from 'react';
import { Smartphone, Usb, Wifi, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ConnectionStatusProps {
  isConnected: boolean;
  deviceName: string;
  connectionType: 'usb' | 'wifi' | 'disconnected';
  batteryLevel?: number;
}

const ConnectionStatus = ({ isConnected, deviceName, connectionType, batteryLevel }: ConnectionStatusProps) => {
  const getStatusIcon = () => {
    if (isConnected) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getConnectionIcon = () => {
    switch (connectionType) {
      case 'usb':
        return <Usb className="w-5 h-5 text-blue-500" />;
      case 'wifi':
        return <Wifi className="w-5 h-5 text-green-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    if (isConnected) return 'bg-green-500';
    return 'bg-red-500';
  };

  return (
    <Card className="bg-gray-900 border-gray-700 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Smartphone className="w-5 h-5" />
          Device Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`}></div>
        </div>
        
        {isConnected && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Device:</span>
              <span className="font-medium">{deviceName}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Connection:</span>
              <div className="flex items-center gap-1">
                {getConnectionIcon()}
                <Badge variant="secondary" className="capitalize">
                  {connectionType}
                </Badge>
              </div>
            </div>
            
            {batteryLevel && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Battery:</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        batteryLevel > 20 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${batteryLevel}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{batteryLevel}%</span>
                </div>
              </div>
            )}
          </>
        )}
        
        {!isConnected && (
          <div className="text-gray-400 text-sm">
            Connect your iPhone via USB cable to get started
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectionStatus;
