
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.bd353f4d72dc4283a5b872b159aad26d',
  appName: 'iphone-cam-usb-streamer-69',
  webDir: 'dist',
  server: {
    url: 'https://bd353f4d-72dc-4283-a5b8-72b159aad26d.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
