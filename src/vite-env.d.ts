
/// <reference types="vite/client" />

// Web USB API type declarations
interface USBDevice {
  vendorId?: number;
  productId?: number;
  deviceClass: number;
  deviceSubclass: number;
  deviceProtocol: number;
  productName?: string;
  manufacturerName?: string;
  serialNumber?: string;
}

interface USBDeviceFilter {
  vendorId?: number;
  productId?: number;
  classCode?: number;
  subclassCode?: number;
  protocolCode?: number;
  serialNumber?: string;
}

interface USBDeviceRequestOptions {
  filters: USBDeviceFilter[];
}

interface USB extends EventTarget {
  getDevices(): Promise<USBDevice[]>;
  requestDevice(options?: USBDeviceRequestOptions): Promise<USBDevice>;
}

interface Navigator {
  usb?: USB;
}
