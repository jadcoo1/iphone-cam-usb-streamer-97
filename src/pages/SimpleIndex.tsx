
import React from 'react';
import SimpleCameraStream from '@/components/SimpleCameraStream';
import { Camera } from 'lucide-react';

const SimpleIndex = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">📱 Simple Camera Stream</h1>
              <p className="text-gray-400 text-sm">Easy camera streaming - no complex setup needed</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <SimpleCameraStream />
        
        <div className="mt-8 bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">📱 How to Use:</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2">1</div>
              <p className="font-medium mb-1">Allow Camera Access</p>
              <p className="text-gray-400">Grant permission when prompted by your browser</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2">2</div>
              <p className="font-medium mb-1">Start Streaming</p>
              <p className="text-gray-400">Click "Start Camera" to begin video stream</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2">3</div>
              <p className="font-medium mb-1">Switch Cameras</p>
              <p className="text-gray-400">Use front/back button to change camera</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleIndex;
