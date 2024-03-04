import React, { useEffect, useRef, memo, FC } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
}

const TradingViewWidget: FC<TradingViewWidgetProps> = ({ symbol }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (container.current === null) return;

    const script = document.createElement('script');
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol, // Use the symbol prop here
      interval: '240',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      enable_publishing: false,
      withdateranges: true,
      save_image: false,
      calendar: false,
      hide_volume: true,
      support_host: 'https://www.tradingview.com',
    });
    container.current.appendChild(script);

    // Cleanup function to remove the script when the component unmounts
    return () => {
      if (container.current) {
        container.current.removeChild(script);
      }
    };
  }, [symbol]); // Add symbol to the dependency array to re-run the effect when the symbol changes

  return (
    <div
      className='tradingview-widget-container'
      ref={container}
      style={{ height: '100%', width: '100%' }}
    >
      <div
        className='tradingview-widget-container__widget'
        style={{ height: 'calc(100% - 32px)', width: '100%' }}
      ></div>
      <div className='tradingview-widget-copyright'>
        <a
          href='https://www.tradingview.com/'
          rel='noopener noreferrer nofollow'
          target='_blank'
        >
          <span className='blue-text'>Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
};

export default memo(TradingViewWidget);
