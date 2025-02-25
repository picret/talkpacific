import React from 'react';

export class PlatformState {
  appDesktopReactVersion: string | null = null;
  chromeVersion: string | null = null;
  electronVersion: string | null = null;
  safariVersion: string | null = null;
  appApiBase: string | null = null;

  constructor(
    appDesktopReactVersion: string | null = null,
    chromeVersion: string | null = null,
    electronVersion: string | null = null,
    safariVersion: string | null = null,
    appApiBase: string | null = null,
  ) {
    this.appDesktopReactVersion = appDesktopReactVersion;
    this.chromeVersion = chromeVersion;
    this.electronVersion = electronVersion;
    this.safariVersion = safariVersion;
    this.appApiBase = appApiBase;
  }

  isDesktop(): boolean {
    return this.appDesktopReactVersion != null;
  }
}

export const PlatformContext = React.createContext<PlatformState>(new PlatformState())
