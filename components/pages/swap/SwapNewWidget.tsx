import React, { useEffect, useRef } from 'react';
import styles from 'styles/pages/Swap.module.scss';

const SwapNewsWidget: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const refElement = ref.current;
    const script = document.createElement('script');
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
    script.async = true;
    script.innerHTML =
      '{"feedMode":"market", "market":"crypto", "colorTheme": "dark", "isTransparent": "true", "displayMode": "regular", "locale": "en"}';
    if (refElement) {
      refElement.appendChild(script);
    }

    // let's do the memory clean up on destruction of component.
    return () => {
      if (refElement && refElement.contains(script)) {
        refElement.removeChild(script);
      }
    };
  }, []);
  return (
    <div
      className={`tradingview-widget-container wrapper ${styles.tradingviewWidget}`}
      ref={ref}
      style={{ height: '400px' }}
    >
      <div className='tradingview-widget-container__widget'></div>
    </div>
  );
};

export default SwapNewsWidget;
