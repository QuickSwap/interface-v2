import React, { useState } from 'react';
import { stringToColour } from 'utils/stringToColour';

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
  const src: string | undefined = srcs.find((src) => {
    if (src && !BAD_SRCS[src]) {
      return true;
    }
  });

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
    <div
      className='flex items-center justify-center'
      style={{
        width: size,
        height: size,
        borderRadius: size,
        boxShadow: '0 6px 10px rgba(0, 0, 0, 0.075)',
        background: stringToColour(alt ?? '').background,
        color: stringToColour(alt ?? '').text,
        border: stringToColour(alt ?? '').border,
        fontSize: fontSize ?? '12px',
        fontWeight: 600,
      }}
    >
      {displaySymbol}
    </div>
  );
};

export default Logo;
