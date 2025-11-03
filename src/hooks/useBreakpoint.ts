import { useState, useEffect } from 'react';

type Breakpoint = 'sm' | 'md' | 'lg';

const DEFAULT_BREAKPOINT: Breakpoint = 'lg';

const getBreakpoint = (): Breakpoint => {
  const width = window.innerWidth;
  if (width < 768) return 'sm';
  if (width < 992) return 'md';
  return 'lg';
};

export const useBreakpoint = (): Breakpoint => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(DEFAULT_BREAKPOINT);

  useEffect(() => {
    setBreakpoint(getBreakpoint());

    const handleResize = () => {
      setBreakpoint(getBreakpoint());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
};