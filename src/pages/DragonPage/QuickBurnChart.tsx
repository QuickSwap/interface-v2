import React, { useState, useMemo } from 'react';
import { Box } from '@material-ui/core';
import 'pages/styles/dragon.scss';
import { GlobalConst, GlobalData } from 'constants/index';
import { useActiveWeb3React } from 'hooks';
import { useQuery } from '@tanstack/react-query';
import Skeleton from '@material-ui/lab/Skeleton';
import AreaTimelineChart from 'components/AreaTimelineChart';
import { appendedZeroChartData, formatNumber } from 'utils';
import { useUSDCPriceFromAddress } from 'utils/useUSDCPrice';
import { DLQUICK } from 'constants/v3/addresses';

const QuickBurnChart: React.FC = () => {
  const { chainId } = useActiveWeb3React();
  const quickToken = DLQUICK[chainId];
  const { price: quickPrice } = useUSDCPriceFromAddress(quickToken?.address);
  const [durationIndex, setDurationIndex] = useState(
    GlobalConst.quickBurnChart.ONE_DAY_CHART,
  );

  const fetchQuickBurnChartData = async () => {
    const res = await fetch(
      `${process.env.REACT_APP_LEADERBOARD_APP_URL}/utils/quick-burn/${durationIndex}?chainId=${chainId}`,
    );
    if (!res.ok) {
      return { chartData: [], globals: null };
    }
    const pairsData = await res.json();
    const chartData =
      pairsData && pairsData.data && pairsData.data.chartData.length > 0
        ? pairsData.data.chartData
        : [];
    const appendZeroChartData = appendedZeroChartData(chartData, durationIndex);
    const globals =
      pairsData && pairsData.data && pairsData.data.globals
        ? pairsData.data.globals
        : null;
    return { chartData: appendZeroChartData, globals };
  };

  const { isLoading, data: chartData } = useQuery({
    queryKey: ['fetchQuickBurnChartData', durationIndex, chainId],
    queryFn: fetchQuickBurnChartData,
    refetchInterval: 60000,
  });

  const yAxisValues = useMemo(() => {
    if (chartData && chartData.chartData) {
      const amounts: number[] = chartData.chartData.map((value: any) =>
        Number(value[1]),
      );

      const minVolume = Math.floor(Math.min(...amounts));
      const maxVolume = Math.ceil(Math.max(...amounts));

      const values: any[] = [];
      // show 10 values in the y axis of the graph
      const step = (maxVolume - minVolume) / 10;
      if (step > 0) {
        for (let i = maxVolume; i >= minVolume; i -= step) {
          values.push(Math.floor(i));
        }
      } else {
        values.push(minVolume);
      }
      return values;
    } else {
      return undefined;
    }
  }, [chartData]);

  return (
    <Box className='dragonLairBg'>
      <Box className='dragonQuickBurnChart'>
        <Box className='sub-title'>
          <h5>QUICK Burn Data</h5>
          <small>
            Total Burned:{' '}
            {chartData && chartData.globals
              ? formatNumber(chartData.globals.totalBurned)
              : '0'}{' '}
            QUICK • $
            {formatNumber(
              Number(
                chartData && chartData.globals
                  ? chartData.globals.totalBurned
                  : 0,
              ) * quickPrice,
            )}
          </small>
        </Box>
        <Box className='chart-type'>
          {GlobalData.quickBurns.CHART_DURATIONS.map((value, index) => (
            <Box
              key={`chart-type-${index}`}
              className={`chart-type-button ${
                value === durationIndex ? 'selected' : 'unselected'
              } `}
              onClick={() => setDurationIndex(value)}
            >
              {GlobalData.quickBurns.CHART_DURATION_TEXTS[index]}
            </Box>
          ))}
        </Box>
        <Box>
          {isLoading ? (
            <Skeleton variant='rect' width='100%' height={223} />
          ) : chartData && chartData.chartData ? (
            <AreaTimelineChart
              width='100%'
              height={250}
              strokeColor={'#3e92fe'}
              gradientColor={'#448aff'}
              data={chartData.chartData}
              yAxisValues={yAxisValues}
            />
          ) : (
            <></>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default QuickBurnChart;
