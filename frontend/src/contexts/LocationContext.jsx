'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LocationContext = createContext();

export { LocationContext };

const STORAGE_KEY = 'hl_user_location';

async function reverseGeocode(lat, lon) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
    { headers: { Accept: 'application/json' } }
  );
  if (!res.ok) throw new Error('Failed to resolve address');
  const data = await res.json();
  const addr = data.address || {};
  return {
    city: addr.city || addr.town || addr.village || addr.suburb || addr.county || '',
    state: addr.state || '',
    pincode: addr.postcode || '',
    address: data.display_name || '',
    lat,
    lon,
  };
}

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(null);
  // idle | locating | resolved | denied | error
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  // Restore a previously detected location so we don't re-prompt every visit
  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        setLocation(JSON.parse(cached));
        setStatus('resolved');
      }
    } catch {
      // ignore corrupt cache
    }
  }, []);

  const detectLocation = useCallback(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setStatus('error');
      setError('Location is not supported in this browser');
      return;
    }
    setStatus('locating');
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const result = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          setLocation(result);
          setStatus('resolved');
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(result)); } catch { /* ignore */ }
        } catch {
          setStatus('error');
          setError('Could not determine your address from your location');
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus('denied');
          setError('Location permission denied');
        } else {
          setStatus('error');
          setError('Could not get your current location');
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 10 * 60 * 1000 }
    );
  }, []);

  // If the browser already granted permission on a previous visit, detect silently
  // without showing the pill in a "click to detect" state. Never auto-prompts.
  useEffect(() => {
    if (location || typeof navigator === 'undefined' || !navigator.permissions?.query) return;
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((result) => {
        if (result.state === 'granted') detectLocation();
      })
      .catch(() => { /* Permissions API not supported — leave to manual detect */ });
  }, [location, detectLocation]);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setStatus('idle');
    setError(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  return (
    <LocationContext.Provider value={{ location, status, error, detectLocation, clearLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useUserLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useUserLocation must be used within a LocationProvider');
  }
  return context;
}
