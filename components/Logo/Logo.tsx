import React, { useState } from 'react';
import { stringToColour } from 'utils/stringToColour';
import Image from 'next/image'

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
  const src: string | undefined = srcs.find((src) => !BAD_SRCS[src]);

  symbol = symbol.trim();
  const displaySymbol = symbol.slice(0, 1) + symbol.slice(-1);
  if (src) {
    return (
      <Image
        alt={alt ?? 'Logo'}
        src={src}
        style={{ width: size, height: size }}
        onError={() => {
          if (src) BAD_SRCS[src] = true;
          refresh((i) => i + 1);
        }}
        width={100}
        height={100}
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
        fontWeight: 600,
      }}
    >
      {displaySymbol}
    </div>
  );
};

export default Logo;
