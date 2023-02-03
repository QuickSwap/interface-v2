import { Box } from '@material-ui/core';
import React, { useEffect, useRef } from 'react';

const SwapNewsWidget: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const script = document.createElement('script');
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
    script.async = true;
    script.innerHTML =
      '{"feedMode":"market", "market":"crypto", "colorTheme": "dark", "isTransparent": "true", "displayMode": "regular", "locale": "en"}';
    ref.current?.appendChild(script);

    // let's do the memory clean up on destruction of component.
    return () => {
      // document.removeChild(script);
    };
  }, []);
  return (
    // <Box className='wrapper' style={{ minHeight: '480px', background: '' }}>
    <div
      className='tradingview-widget-container wrapper'
      ref={ref}
      style={{ height: '400px' }}
    >
      <div className='tradingview-widget-container__widget'></div>
    </div>
    // </Box>
  );
};

export default SwapNewsWidget;
