import React from 'react';
import { Box } from '@material-ui/core';
import {
  widget,
  ChartingLibraryWidgetOptions,
  LanguageCode,
  IChartingLibraryWidget,
  ResolutionString,
} from 'charting_library/charting_library';
import { getRateData, isAddress } from 'utils';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { useBlockNumber } from 'state/application/hooks';

dayjs.extend(utc);
dayjs.extend(weekOfYear);

export interface ChartContainerProps {
  symbol: ChartingLibraryWidgetOptions['symbol'];
  interval: ChartingLibraryWidgetOptions['interval'];
  // BEWARE: no trailing slash is expected in feed URL
  datafeedUrl: string;
  libraryPath: ChartingLibraryWidgetOptions['library_path'];
  chartsStorageUrl: ChartingLibraryWidgetOptions['charts_storage_url'];
  chartsStorageApiVersion: ChartingLibraryWidgetOptions['charts_storage_api_version'];
  clientId: ChartingLibraryWidgetOptions['client_id'];
  userId: ChartingLibraryWidgetOptions['user_id'];
  fullscreen: ChartingLibraryWidgetOptions['fullscreen'];
  autosize: ChartingLibraryWidgetOptions['autosize'];
  studiesOverrides: ChartingLibraryWidgetOptions['studies_overrides'];
  containerId: string;
  height: number | string;
  pairAddress: string;
  pairName: string;
  pairTokenReversed: boolean;
}

const ChartContainerProps = {
  symbol: 'AAPL',
  interval: 'H' as ResolutionString,
  containerId: 'quickswap_chart_container',
  datafeedUrl: 'https://demo_feed.tradingview.com',
  libraryPath: '/charting_library/',
  chartsStorageUrl: 'https://saveload.tradingview.com',
  chartsStorageApiVersion: '1.0',
  clientId: 'tradingview.com',
  userId: 'public_user_id',
  fullscreen: false,
  autosize: true,
  studiesOverrides: {},
  height: 600,
};

function getLanguageFromURL(): LanguageCode | null {
  const regex = new RegExp('[\\?&]lang=([^&#]*)');
  const results = regex.exec(location.search);
  return results === null
    ? null
    : (decodeURIComponent(results[1].replace(/\+/g, ' ')) as LanguageCode);
}

const TradingViewChart: React.FC<Partial<ChartContainerProps>> = (props) => {
  const checksumAddress = isAddress(props.pairAddress);
  const latestBlock = useBlockNumber();

  const fetchPriceData = async (resolution: any) => {
    if (checksumAddress) {
      let interval = 3600; // one hour per seconds
      let duration = 1;
      let durationType = 'week';

      if (resolution === '1') {
        interval = 60;
        duration = 6;
        durationType = 'hour';
      } else if (resolution === '5') {
        interval = 300;
        duration = 12;
        durationType = 'hour';
      } else if (resolution === '10') {
        interval = 600;
        duration = 1;
        durationType = 'day';
      } else if (resolution === '15') {
        interval = 900;
        duration = 2;
        durationType = 'day';
      } else if (resolution === '30') {
        interval = 1800;
        duration = 3;
        durationType = 'day';
      } else if (resolution === '1H') {
        interval = 3600;
        duration = 6;
        durationType = 'month';
      } else if (resolution === '1D') {
        interval = 86400;
        duration = 6;
        durationType = 'month';
      } else if (resolution === '1W') {
        interval = 604800;
        duration = 6;
        durationType = 'year';
      } else if (resolution === '1M') {
        interval = 18144000;
        duration = 12;
        durationType = 'year';
      }

      const utcCurrentTime = dayjs();
      const startTimestamp =
        utcCurrentTime.subtract(duration, durationType).unix() - 1;

      const tokenPrices = await getRateData(
        checksumAddress.toLocaleLowerCase(),
        latestBlock ?? 0,
        interval,
        startTimestamp,
        props.pairTokenReversed ?? false,
      );

      return tokenPrices.map((item, ind) => {
        const nextInd = ind === tokenPrices.length - 1 ? ind : ind + 1;
        return {
          time: Number(item.timestamp),
          open: item.rate,
          close: tokenPrices[nextInd].rate,
          high: tokenPrices[nextInd].rate,
          low: item.rate,
        };
      });
    }
    return [];
  };

  // const lastBarsCache = new Map()

  const configurationData = {
    supported_resolutions: ['1', '5', '10', '15', '30', '1H', '1D', '1W', '1M'],
  };
  const feed = {
    onReady: (callback: any) => {
      // console.log('[onReady]: Method call');
      setTimeout(() => callback(configurationData), 0);
    },
    resolveSymbol: async (
      symbolName: any,
      onSymbolResolvedCallback: any,
      onResolveErrorCallback: any,
    ) => {
      const symbolInfo = {
        ticker: props.pairName,
        name: props.pairName,
        description: props.pairName,
        type: 'crypto',
        session: '24x7',
        timezone: 'Etc/UTC',
        exchange: 'Quickswap',
        minmov: 1,
        pricescale: 100,
        has_intraday: true,
        has_no_volume: false,
        has_weekly_and_monthly: false,
        supported_resolutions: configurationData.supported_resolutions,
        volume_precision: 3,
        data_status: 'streaming',
      };
      // eslint-disable-next-line no-console
      // console.log('[resolveSymbol]: Symbol resolved', symbolName);
      onSymbolResolvedCallback(symbolInfo);
    },
    getBars: async (
      symbolInfo: any,
      resolution: any,
      periodParams: any,
      onHistoryCallback: any,
      onErrorCallback: any,
    ) => {
      try {
        const { from, to, firstDataRequest } = periodParams;
        if (checksumAddress) {
          // setLoader(true);
          if (!firstDataRequest) {
            // "noData" should be set if there is no data in the requested period.
            onHistoryCallback([], {
              noData: true,
            });
            return;
          }
        }

        const data = await fetchPriceData(resolution);

        let bars: any = [];
        // if(data.data.data){
        data.map((bar: any, i: any) => {
          const obj = {
            time: bar.time * 1000,
            low: bar.low,
            high: bar.high,
            open: bar.open,
            close: bar.close,
            isBarClosed: true,
            isLastBar: false,
          };
          if (i === data.length - 1) {
            obj.isLastBar = true;
            obj.isBarClosed = false;
          }
          bars = [...bars, obj];
          return {};
        });

        onHistoryCallback(bars, {
          noData: false,
        });
      } catch (error) {
        // console.log('[getBars]: Get error', error.message);
        onErrorCallback(error);
      }
    },
  };
  // const tvWidget = null;
  //   React.useEffect(()=>{
  const getWidget = async () => {
    let tvWidget: IChartingLibraryWidget | null = null;
    const widgetOptions: ChartingLibraryWidgetOptions = {
      // symbol: this.props.symbol as string,
      symbol: props.pairName,
      // BEWARE: no trailing slash is expected in feed URL
      // tslint:disable-next-line:no-any
      //   datafeed: new (window as any).Datafeeds.UDFCompatibleDatafeed(props.datafeedUrl),
      datafeed: feed,
      interval: ChartContainerProps.interval as ChartingLibraryWidgetOptions['interval'],
      library_path: ChartContainerProps.libraryPath as string,
      container: ChartContainerProps.containerId as string,
      locale: getLanguageFromURL() || 'en',
      theme: 'Dark',
      disabled_features: ['use_localstorage_for_settings'],
      enabled_features: ['study_templates'],
      charts_storage_url: ChartContainerProps.chartsStorageUrl,
      //   charts_storage_api_version: ChartContainerProps.chartsStorageApiVersion,
      client_id: ChartContainerProps.clientId,
      user_id: ChartContainerProps.userId,
      fullscreen: ChartContainerProps.fullscreen,
      autosize: ChartContainerProps.autosize,
      studies_overrides: ChartContainerProps.studiesOverrides,
    };

    tvWidget = await new widget(widgetOptions);
  };

  React.useEffect(() => {
    getWidget();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.pairAddress, props.pairTokenReversed]);

  return (
    <Box height={props.height}>
      <div
        id={ChartContainerProps.containerId}
        style={{ height: '100%', paddingBottom: '10px' }}
      />
    </Box>
  );
};

export default TradingViewChart;
