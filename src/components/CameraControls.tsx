
import React from 'react';
import { Camera, Focus, Zap, Palette, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface CameraControlsProps {
  resolution: string;
  fps: number;
  onResolutionChange: (resolution: string) => void;
  onFpsChange: (fps: number) => void;
  autoFocus: boolean;
  onAutoFocusChange: (enabled: boolean) => void;
  flashEnabled: boolean;
  onFlashChange: (enabled: boolean) => void;
  exposure: number;
  onExposureChange: (exposure: number) => void;
}

const CameraControls = ({
  resolution,
  fps,
  onResolutionChange,
  onFpsChange,
  autoFocus,
  onAutoFocusChange,
  flashEnabled,
  onFlashChange,
  exposure,
  onExposureChange
}: CameraControlsProps) => {
  
  const resolutions = [
    { value: '1920x1080', label: '1080p (1920×1080)' },
    { value: '1280x720', label: '720p (1280×720)' },
    { value: '640x480', label: '480p (640×480)' },
    { value: '3840x2160', label: '4K (3840×2160)' }
  ];

  const frameRates = [
    { value: 30, label: '30 FPS' },
    { value: 60, label: '60 FPS' },
    { value: 24, label: '24 FPS (Cinematic)' },
    { value: 120, label: '120 FPS (Slow Motion)' }
  ];

  return (
    <Card className="bg-gray-900 border-gray-700 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Camera className="w-5 h-5" />
          Camera Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-gray-300">Resolution</Label>
          <Select value={resolution} onValueChange={onResolutionChange}>
            <SelectTrigger className="bg-gray-800 border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {resolutions.map((res) => (
                <SelectItem key={res.value} value={res.value} className="text-white focus:bg-gray-700">
                  {res.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-300">Frame Rate</Label>
          <Select value={fps.toString()} onValueChange={(value) => onFpsChange(Number(value))}>
            <SelectTrigger className="bg-gray-800 border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {frameRates.map((rate) => (
                <SelectItem key={rate.value} value={rate.value.toString()} className="text-white focus:bg-gray-700">
                  {rate.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Focus className="w-4 h-4" />
              <Label className="text-gray-300">Auto Focus</Label>
            </div>
            <Switch
              checked={autoFocus}
              onCheckedChange={onAutoFocusChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <Label className="text-gray-300">Flash</Label>
            </div>
            <Switch
              checked={flashEnabled}
              onCheckedChange={onFlashChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <Label className="text-gray-300">Exposure</Label>
            <span className="text-sm text-gray-400 ml-auto">{exposure}%</span>
          </div>
          <Slider
            value={[exposure]}
            onValueChange={(value) => onExposureChange(value[0])}
            max={100}
            min={0}
            step={1}
            className="w-full"
          />
        </div>

        <Button
          variant="outline"
          className="w-full bg-gray-800 border-gray-600 hover:bg-gray-700"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset to Defaults
        </Button>
      </CardContent>
    </Card>
  );
};

export default CameraControls;
