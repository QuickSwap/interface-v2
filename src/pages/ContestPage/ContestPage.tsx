import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@material-ui/core';
import { ContestPairs, LeaderBoardAnalytics } from 'constants/index';
import 'pages/styles/contest.scss';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import { ContestLeaderBoard, SwapDataV3 } from 'models/interfaces/contest';
import { ReactComponent as SearchIcon } from 'assets/images/SearchIcon.svg';
import { isAddress } from 'utils';
import 'components/styles/SearchWidget.scss';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { Skeleton } from '@material-ui/lab';
import ContestTable from 'components/ContestTable/ContestTable';
import { ChartType } from 'components';
import useDebouncedChangeHandler from 'utils/useDebouncedChangeHandler';
import { formatNumber } from 'utils';
import {
  getTradingDataBetweenDates,
  getFormattedLeaderBoardData,
} from 'lib/src/leaderboard';
dayjs.extend(utc);
dayjs.extend(weekOfYear);

const ContestPage: React.FC = () => {
  const { t } = useTranslation();
  const helpURL = process.env.REACT_APP_HELP_URL;
  const [durationIndex, setDurationIndex] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contestLeaderBoard, setContestLeaderBoard] = useState<
    ContestLeaderBoard[]
  >([]);
  const [searchResult, setSearchResult] = useState<ContestLeaderBoard>();
  const [searchVal, setSearchVal] = useState('');
  const [searchValInput, setSearchValInput] = useDebouncedChangeHandler(
    searchVal,
    setSearchVal,
    500,
  );

  const [contestFilter, setContestFilter] = useState(ContestPairs[0]);

  const getTradingDataForPool = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.REACT_APP_LEADERBOARD_APP_URL}/leaderboard?pool=${contestFilter.address}&days=${durationIndex}`,
      );
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          errorText || res.statusText || `Failed to get leaderboard`,
        );
      }

      const data = await res.json();
      setContestLeaderBoard(data.leaderboardData);
      setLoading(false);
      setError(null);
    } catch (error) {
      setLoading(false);
      console.error(error, 'message', error.message);
      setError(error.message);
    }
  };

  useEffect(() => {
    (async () => {
      if (contestFilter) {
        getTradingDataForPool();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contestFilter, durationIndex]);

  const getTradingDataForAddress = async () => {
    try {
      setSearchLoading(true);
      const today = dayjs()
        .utc()
        .unix();

      const firstTradeDay = dayjs
        .utc()
        .subtract(durationIndex, 'day')
        .unix();

      let pools_in: string[] = [];
      if (contestFilter.address === 'all') {
        pools_in = ContestPairs.filter((e) => e.address !== 'all').map(
          (e) => e.address,
        );
      } else {
        pools_in = [contestFilter.address];
      }
      console.log('pools_in', pools_in);

      const swapData: SwapDataV3[] = await getTradingDataBetweenDates(
        pools_in,
        firstTradeDay * 1000,
        today * 1000,
        searchVal,
      );

      if (swapData) {
        const formattedLeaderBoardData = getFormattedLeaderBoardData(swapData);
        if (!formattedLeaderBoardData[0]) {
          formattedLeaderBoardData[0] = {
            origin: searchVal,
            amountUSD: 0,
            txCount: 0,
            rank: '>300',
          };
        }
        setSearchResult(formattedLeaderBoardData[0]);
      }

      setSearchLoading(false);
    } catch (error) {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    if (isAddress(searchVal) && contestLeaderBoard.length) {
      const searchResponse = contestLeaderBoard.find(
        (e) => e.origin.toLowerCase() === searchVal.toLowerCase(),
      );

      if (searchResponse) {
        setSearchResult(searchResponse);
      } else {
        getTradingDataForAddress();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchVal, contestLeaderBoard]);

  return (
    <Box width='100%' mb={3} id='contest-page'>
      <Box className='pageHeading'>
        <Box className='flex row items-center'>
          <h4>{t('leaderBoard')}</h4>
        </Box>

        {helpURL && (
          <Box
            className='helpWrapper'
            onClick={() => window.open(helpURL, '_blank')}
          >
            <small>{t('help')}</small>
            <HelpIcon />
          </Box>
        )}
      </Box>

      <Box width='100%' mb={3}>
        <Box className='flex items-center justify-between'>
          <Box my={4} px={0} className='flex flex-wrap items-center'>
            {ContestPairs.map((pair) => {
              return (
                <Box
                  key={pair.address}
                  className={`topTab ${contestFilter.address === pair.address &&
                    'selectedTab'}`}
                  onClick={() => setContestFilter(pair)}
                >
                  <p className='weight-600'>{pair.name}</p>
                </Box>
              );
            })}
          </Box>

          <Box className='searchWidgetWrapper'>
            <Box className='searchWidgetInput'>
              <input
                placeholder={t('searchAddress')}
                value={searchValInput}
                onChange={(evt) => setSearchValInput(evt.target.value)}
              />
              <Box display='flex'>
                <SearchIcon />
              </Box>
            </Box>
          </Box>
        </Box>

        {searchVal && (
          <>
            <Box className='bg-palette topMoversWrapper' my={4}>
              <p className='weight-600 text-secondary'>{t('searchResult')}</p>
              {!searchLoading && searchResult ? (
                <>
                  <Box className='topMoversContent'>
                    <Box className='flex items-center'>
                      <Box width={0.1} textAlign='start'>
                        <small>{searchResult.rank}</small>
                      </Box>

                      <Box width={0.4} textAlign='center'>
                        <small>{searchResult['origin']}</small>
                      </Box>
                      <Box width={0.2} textAlign='center'>
                        <small>{searchResult['txCount']}</small>
                      </Box>

                      <Box width={0.3} textAlign='end' className='text-success'>
                        <small>{formatNumber(searchResult['amountUSD'])}</small>
                      </Box>
                    </Box>
                  </Box>
                </>
              ) : (
                <Box my={2} textAlign={'center'} width={1}>
                  <Skeleton variant='rect' width='100%' height={40} />
                </Box>
              )}
            </Box>
          </>
        )}

        <Box className='panel'>
          <Box className='flex justify-end' mb={2}>
            <ChartType
              typeTexts={LeaderBoardAnalytics.CHART_DURATION_TEXTS}
              chartTypes={LeaderBoardAnalytics.CHART_DURATIONS}
              chartType={durationIndex}
              setChartType={setDurationIndex}
            />
          </Box>

          {!loading ? (
            <>
              {error ? (
                <p className='weight-600 text-center'>{error}</p>
              ) : (
                <ContestTable data={contestLeaderBoard} />
              )}
            </>
          ) : (
            <Skeleton variant='rect' width='100%' height={150} />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ContestPage;
