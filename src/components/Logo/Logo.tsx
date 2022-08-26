import React, { useState } from 'react';
import { stringToColour } from 'utils/stringToColour';
import { StyledLogo } from './styled';

const BAD_SRCS: { [tokenAddress: string]: true } = {};

export interface LogoProps {
  srcs: string[];
  alt?: string;
  symbol?: string;
  size?: string;
}

const Logo: React.FC<LogoProps> = ({
  srcs,
  alt,
  symbol = '??',
  size = '24px',
}) => {
  const [, refresh] = useState<number>(0);
  const fontSize = parseInt(size, 10) >= 24 ? '12px' : '8px';
  const src: string | undefined = srcs.find((src) => !BAD_SRCS[src]);

  symbol = symbol.trim();
  const displaySymbol = symbol.slice(0, 1) + symbol.slice(-1);
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
        fontSize: fontSize,
      }}
    >
      {displaySymbol}
    </StyledLogo>
  );
};

export default Logo;
