import React, { useState } from 'react';
import { stringToColour } from 'utils/stringToColour';
import { StyledLogo } from './styled';

const BAD_SRCS: { [tokenAddress: string]: true } = {};

export interface LogoProps {
  srcs: string[];
  alt?: string;
  size?: string;
}

const Logo: React.FC<LogoProps> = ({ srcs, alt, size = '24px' }) => {
  const [, refresh] = useState<number>(0);

  const src: string | undefined = srcs.find((src) => !BAD_SRCS[src]);

  if (src) {
    return (
      <img
        alt={alt}
        src={src}
        style={{ width: size, height: size }}
        onError={() => {
          if (src) BAD_SRCS[src] = true;
          refresh((i) => i + 1);
        }}
      />
    );
  }
  return (
    <StyledLogo
      size={size}
      style={{
        background: stringToColour(alt ?? '').background,
        color: stringToColour(alt ?? '').text,
        border: stringToColour(alt ?? '').border,

        fontSize: size === '18px' ? '8px' : size === '24px' ? '12px' : '10px',
      }}
    >
      {alt?.slice(0, 3).trimEnd()}
    </StyledLogo>
  );
};

export default Logo;
