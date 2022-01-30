import React from 'react';
import { HelpCircle } from 'react-feather';

export interface LogoProps {
  srcs: string[];
  alt?: string;
  size?: string;
}

const Logo: React.FC<LogoProps> = ({ srcs, alt, size = '24px' }) => {
  const src: string | undefined = srcs.find((src) => !!src);

  if (src) {
    return <img alt={alt} src={src} style={{ width: size, height: size }} />;
  }

  return <HelpCircle />;
};

export default Logo;
