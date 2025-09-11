'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface CameraState {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  fov: number;
  target?: { x: number; y: number; z: number };
}

interface CameraStateContextType {
  getCurrentCameraState: (() => CameraState | null) | null;
  setGetCurrentCameraState: (getState: (() => CameraState | null) | null) => void;
}

const CameraStateContext = createContext<CameraStateContextType | undefined>(undefined);

export function CameraStateProvider({ children }: { children: ReactNode }) {
  const [getCurrentCameraState, setGetCurrentCameraState] = useState<(() => CameraState | null) | null>(null);

  const handleSetGetCurrentCameraState = useCallback((getState: (() => CameraState | null) | null) => {
    setGetCurrentCameraState(() => getState);
  }, []);

  return (
    <CameraStateContext.Provider
      value={{
        getCurrentCameraState,
        setGetCurrentCameraState: handleSetGetCurrentCameraState,
      }}
    >
      {children}
    </CameraStateContext.Provider>
  );
}

export function useCameraState() {
  const context = useContext(CameraStateContext);
  if (context === undefined) {
    throw new Error('useCameraState must be used within a CameraStateProvider');
  }
  return context;
}
