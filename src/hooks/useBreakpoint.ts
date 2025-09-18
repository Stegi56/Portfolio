import { useState, useEffect } from 'react';

const getBreakpoint = (width: number): 'sm' | 'md' | 'lg' => {
  if (width < 768) return 'sm';
  if (width < 992) return 'md';
  return 'lg';
};

export const useBreakpoint = (): 'sm' | 'md' | 'lg' => {
  const [breakpoint, setBreakpoint] = useState(() => getBreakpoint(window.innerWidth));

  useEffect(() => {
    const handleResize = () => {
      setBreakpoint(getBreakpoint(window.innerWidth));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
};
