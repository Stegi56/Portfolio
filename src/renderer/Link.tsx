import React from 'react';
import { usePageContext } from 'vike-react/usePageContext';

export function Link({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const pageContext = usePageContext();
  const isActive = href === pageContext.urlPathname;
  
  const allClassNames = [className, isActive && 'is-active']
    .filter(Boolean)
    .join(' ');

  return (
    <a href={href} className={allClassNames}>
      {children}
    </a>
  );
}