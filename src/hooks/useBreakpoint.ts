import { useState, useEffect } from 'react';

const getBreakpoint = (width: number): 'sm' | 'md' | 'lg' => {
  if (width < 768) return 'sm';
  if (width < 992) return 'md';
  return 'lg';
};

export const useBreakpoint = (): 'sm' | 'md' | 'lg' => {
  const [breakpoint, setBreakpoint] = useState<'sm' | 'md' | 'lg'>('lg');

  useEffect(() => {
    const handleResize = () => {
      setBreakpoint(getBreakpoint(window.innerWidth));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
};
