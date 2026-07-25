import React, { useEffect, useState } from 'react';

export const CrtOverlay: React.FC = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  return (
    <>
      {!prefersReducedMotion && <div className="scanlines" aria-hidden="true"></div>}
      <div className="crt-vignette" aria-hidden="true"></div>
      {!prefersReducedMotion && <div className="crt-noise" aria-hidden="true"></div>}
    </>
  );
};
