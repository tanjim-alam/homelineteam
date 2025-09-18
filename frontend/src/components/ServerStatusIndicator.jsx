'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import serverStatus from '../utils/serverStatus';

const ServerStatusIndicator = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      setIsChecking(true);
      const status = await serverStatus.getStatus();
      setIsOnline(status);
      setIsChecking(false);
    };

    checkStatus();

    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  if (isChecking) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-100 text-gray-600 px-3 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2 z-50">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        Checking server...
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 px-3 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2 z-50 ${
      isOnline 
        ? 'bg-green-100 text-green-700' 
        : 'bg-red-100 text-red-700'
    }`}>
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4" />
          Backend Online
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          Backend Offline
        </>
      )}
    </div>
  );
};

export default ServerStatusIndicator;
