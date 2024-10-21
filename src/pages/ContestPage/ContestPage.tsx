import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, useMediaQuery } from '@material-ui/core';
import { ContestPairs, LeaderBoardAnalytics } from 'constants/index';
import 'pages/styles/contest.scss';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import { ContestLeaderBoard, SwapDataV3 } from 'models/interfaces/contest';
import { ReactComponent as SearchIcon } from 'assets/images/SearchIcon.svg';
import { isAddress, shortenAddress } from 'utils';
import { useTheme } from '@material-ui/core/styles';
import 'components/styles/SearchWidget.scss';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { Skeleton } from '@material-ui/lab';
import ContestTable from 'components/ContestTable/ContestTable';
import { ChartType } from 'components';
import useDebouncedChangeHandler from 'utils/useDebouncedChangeHandler';
import { formatNumber } from 'utils';
import { getFormattedLeaderBoardData } from 'lib/src/leaderboard';
import { useActiveWeb3React } from 'hooks';
import { getConfig } from 'config/index';
import { useHistory } from 'react-router-dom';
import { ChainId } from '@uniswap/sdk';
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
  const [searchedEnsName, setSearchedEnsName] = useState<string | null>('');
  const [searchValInput, setSearchValInput] = useDebouncedChangeHandler(
    searchVal,
    setSearchVal,
    500,
  );
  const { chainId, account, library } = useActiveWeb3React();
  const [contestFilter, setContestFilter] = useState(
    chainId ? ContestPairs[chainId][0] : ContestPairs[ChainId.MATIC][0],
  );
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('sm'));
  const config = getConfig(chainId);
  const showLeaderBoard = config['leaderboard']['available'];
  const history = useHistory();

  if (!showLeaderBoard) {
    location.href = '/';
  }

  useEffect(() => {
    if (!showLeaderBoard) {
      history.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showLeaderBoard]);

  useEffect(() => {
    if (account) {
      setSearchVal(account);
    }
  }, [account]);

  const getTradingDataForPool = async () => {
    try {
      setLoading(true);
      const showPastWinners = contestFilter.address === 'past-winners';

      let res;
      if (showPastWinners) {
        res = await fetch(
          `${
            process.env.REACT_APP_LEADERBOARD_APP_URL
          }/${'get-snap-shot/by-date'}?pool=${'all'}&days=30&lastdate=2023-05-13&chainId=${chainId}`,
        );
      } else {
        res = await fetch(
          `${process.env.REACT_APP_LEADERBOARD_APP_URL}/leaderboard?pool=${contestFilter.address}&days=${durationIndex}&chainId=${chainId}`,
        );
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            errorText || res.statusText || `Failed to get leaderboard`,
          );
        }
      }

      const data = await res.json();

      const result = showPastWinners
        ? data.lastCompititionData
        : data.leaderboardData;

      let lensArray: any[] = [];
      for (const ind of Array.from(
        { length: Math.ceil(result.length / 150) },
        (_, i) => i,
      )) {
        const lensRes = await fetch(
          `${
            process.env.REACT_APP_LEADERBOARD_APP_URL
          }/utils/lens-profiles?addresses=${result
            .slice(ind * 150, (ind + 1) * 150)
            .map((e: any) => e.origin)
            .join('_')}`,
        );
        if (!lensRes.ok) {
          const errorText = await lensRes.text();
          throw new Error(
            errorText || lensRes.statusText || `Failed to get leaderboard`,
          );
        }
        const lensData = await lensRes.json();
        lensArray = lensArray.concat(lensData.data);
      }

      // Fetch lens handles of all the addresses
      const resultData = result.map((d: ContestLeaderBoard, i: number) => {
        return {
          ...d,
          lensHandle:
            lensArray[i] && lensArray[i].length > 0
              ? lensArray[i][0].handle
              : undefined,
        };
      });

      setContestLeaderBoard(resultData);
      setLoading(false);
      setError(null);
    } catch (error) {
      setLoading(false);
      console.error(error, 'message', error.message);
      setError(error.message);
    }
  };

  useEffect(() => {
    setContestFilter(ContestPairs[chainId][0]);
  }, [chainId]);

  useEffect(() => {
    (async () => {
      if (contestFilter) {
        getTradingDataForPool();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contestFilter, durationIndex]);

  const getTradingDataForAddress = async () => {
    if (!chainId) return;
    try {
      setSearchLoading(true);

      let pools_in: string[] = [];
      if (contestFilter.address === 'all') {
        pools_in = ContestPairs[chainId]
          .filter((e: any) => e.address !== 'all')
          .map((e: any) => e.address);
      } else {
        pools_in = [contestFilter.address];
      }
      console.log('pools_in', pools_in);

      const res = await fetch(
        `${process.env.REACT_APP_LEADERBOARD_APP_URL}/get-snap-shot/by-origin?chainId=${chainId}&days=${durationIndex}&pool=${contestFilter.address}&origin=${searchVal}`,
      );
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          errorText || res.statusText || `Failed to get top token details`,
        );
      }
      const data = await res.json();

      const swapData: SwapDataV3[] =
        data && data.lastCompititionData ? data.lastCompititionData : [];

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

  const lookUpSearchedAddress = async () => {
    if (!library) return;
    try {
      const name = await library.lookupAddress(searchVal);
      setSearchedEnsName(name);
    } catch (error) {
      setSearchedEnsName('');
    }
  };

  useEffect(() => {
    if (isAddress(searchVal) && contestLeaderBoard.length) {
      const searchResponse = contestLeaderBoard.find(
        (e) => e.origin.toLowerCase() === searchVal.toLowerCase(),
      );
      lookUpSearchedAddress();
      if (searchResponse) {
        setSearchResult(searchResponse);
      } else {
        getTradingDataForAddress();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchVal, contestLeaderBoard.length, durationIndex]);

  const searchCardColumns = [
    {
      label: 'Rank',
      align: 'start',
      width: 0.1,
      key: 'rank',
    },
    {
      label: 'Origin',
      align: 'center',
      width: 0.4,
      key: 'origin',
    },
    {
      label: 'Trades',
      align: 'center',
      width: 0.2,
      key: 'txCount',
    },
    {
      label: 'Volume USDC',
      align: 'end',
      width: 0.3,
      key: 'amountUSD',
    },
  ];

  return (
    <Box width='100%' mb={3} id='contest-page'>
      <Box className='pageHeading'>
        <Box className='flex items-center row'>
          <h1 className='h4'>{t('leaderBoard')}</h1>
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
        <Box className='flex items-center justify-between filter-options-wrapper'>
          <Box
            my={4}
            px={0}
            className='flex flex-wrap items-center pair-options'
          >
            {ContestPairs[chainId || ChainId.MATIC].map((pair: any) => {
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
                    <Box className='flex items-center' mt={2}>
                      {searchCardColumns.map((column) => {
                        return (
                          <Box
                            width={column.width}
                            key={column.key}
                            className='flex items-center cursor-pointer'
                            justifyContent={column.align}
                          >
                            <small className={'text-secondary'}>
                              {column.label}
                            </small>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                  <Box className='topMoversContent'>
                    <Box className='flex items-center'>
                      <Box width={0.1} textAlign='start'>
                        <small>{searchResult.rank}</small>
                      </Box>

                      <Box width={0.4} textAlign='center'>
                        <small>
                          {searchedEnsName
                            ? searchedEnsName
                            : isMobile
                            ? shortenAddress(searchResult['origin'])
                            : searchResult['origin']}
                        </small>
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
                  <Skeleton variant='rect' width='100%' height={60} />
                </Box>
              )}
            </Box>
          </>
        )}

        <Box className='panel'>
          {contestFilter.address !== 'past-winners' && (
            <Box className='flex justify-end' mb={2}>
              <ChartType
                typeTexts={LeaderBoardAnalytics.CHART_DURATION_TEXTS}
                chartTypes={LeaderBoardAnalytics.CHART_DURATIONS}
                chartType={durationIndex}
                setChartType={setDurationIndex}
              />
            </Box>
          )}

          {!loading ? (
            <>
              {error ? (
                <p className='text-center weight-600'>{error}</p>
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
