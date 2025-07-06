
export const detectPlatform = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /ipad|iphone|ipod/.test(userAgent);
  const isMacOS = /macintosh|mac os x/.test(userAgent);
  const isWindows = /windows/.test(userAgent);
  const isElectron = /electron/.test(userAgent);
  const isDesktop = isElectron || (!isIOS && (isMacOS || isWindows));
  
  return {
    isIOS,
    isMacOS,
    isWindows,
    isElectron,
    isDesktop,
    isMobile: isIOS,
    platform: isIOS ? 'ios' : isElectron ? 'desktop' : isDesktop ? 'web-desktop' : 'web'
  };
};

export const getPlatformCapabilities = () => {
  const platform = detectPlatform();
  
  return {
    hasUSBAccess: platform.isDesktop && 'usb' in navigator,
    hasCamera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
    canCreateVirtualWebcam: platform.isDesktop,
    supportsFileSystem: platform.isElectron,
    platform: platform.platform
  };
};
