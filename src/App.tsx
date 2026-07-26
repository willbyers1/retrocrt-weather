/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Plasma from './components/Plasma/Plasma';
import { CrtOverlay } from './components/CrtOverlay';
import { WeatherTerminal } from './components/WeatherTerminal';
import SpecularButton from './components/SpecularButton/SpecularButton';

const THEMES = [
  { name: 'GREEN', color: '#33ff33' },
  { name: 'AMBER', color: '#ffb000' },
  { name: 'BLUE', color: '#a0d8ff' }
];

export default function App() {
  const [themeIndex, setThemeIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const theme = THEMES[themeIndex];

  useEffect(() => {
    // Update CSS variables for CRT glow and fg/bg
    const root = document.documentElement;
    root.style.setProperty('--crt-fg', `var(--crt-fg-${theme.name.toLowerCase()})`);
    root.style.setProperty('--crt-bg', `var(--crt-bg-${theme.name.toLowerCase()})`);
    root.style.setProperty('--crt-glow', `var(--crt-fg-${theme.name.toLowerCase()})`);
  }, [theme]);

  const cycleTheme = () => {
    setThemeIndex((prev) => (prev + 1) % THEMES.length);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-[var(--crt-fg)] font-mono selection:bg-[var(--crt-fg)] selection:text-[var(--crt-bg)]">
      
      {/* Plasma Background */}
      <div className="absolute inset-0 z-0">
        <Plasma 
          color={theme.color}
          speed={prefersReducedMotion ? 0 : 0.4}
          direction="forward"
          scale={1.2}
          opacity={0.25}
          mouseInteractive={!prefersReducedMotion}
        />
      </div>

      {/* Main Terminal Frame */}
      <div className="absolute inset-4 sm:inset-8 z-10 border-4 sm:border-8 border-[#111] rounded-[2rem] sm:rounded-[3rem] overflow-hidden bg-black bg-opacity-40 shadow-[0_0_0_4px_rgba(25,25,25,1),inset_0_0_30px_rgba(0,0,0,1)]">
        
        {/* Terminal Content */}
        <div className={`relative z-20 w-full h-full p-2 ${prefersReducedMotion ? '' : 'crt-flicker boot-sequence'}`}>
          <WeatherTerminal themeColor={theme.color} />
        </div>

        {/* CRT Overlay Effects */}
        <CrtOverlay />
      </div>

      {/* Theme Toggle Button (outside the CRT screen, like a hardware button) */}
      <div className="absolute bottom-1 sm:bottom-2 right-4 sm:right-12 z-50">
        <SpecularButton
          size="sm"
          radius={2}
          tintOpacity={0}
          textColor="#666"
          lineColor="#aaa"
          baseColor="#111"
          onClick={cycleTheme}
          className="scale-75 origin-bottom-right"
        >
          {`THEME_SW: ${theme.name}`}
        </SpecularButton>
      </div>

    </div>
  );
}
