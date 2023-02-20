import { Box, useMediaQuery, useTheme } from '@material-ui/core';
import CustomTabSwitch from 'components/v3/CustomTabSwitch';
import { ContestPairs } from 'constants/index';
import 'pages/styles/contest.scss';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import Loader from '../../components/Loader';
import ContestCard from 'components/ContestCard';
import { ContestLeaderBoard, SwapDataV3 } from 'models/interfaces/contest';
import { getSwapTransactionsV3 } from 'utils/v3/contest';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';
dayjs.extend(utc);
dayjs.extend(weekOfYear);

const testData = [
  {
    sender: '0xf5b509bb0909a69b1c207e495f687a596c168e12',
    amountUSD: 30732858.090035167,
    txCount: 17945,
  },
];

const ContestPage: React.FC = () => {
  const { t } = useTranslation();
  const helpURL = process.env.REACT_APP_HELP_URL;

  const [loading, setLoading] = useState(false);
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('sm'));
  const [contestLeaderBoard, setContestLeaderBoard] = useState<
    ContestLeaderBoard[]
  >([]);

  const contestFilters = ContestPairs.map((farm) => ({
    text: farm.name,
    id: farm.address,
  }));
  const [contestFilter, setContestFilter] = useState(contestFilters[0]);

  const getTradingDataOfDay = async (fromTime: number, toTime: number) => {
    setLoading(true);
    let arr: SwapDataV3[] = [];
    for (let index = 0; index <= 5; index++) {
      console.log('loop no', index);
      const pageData = await getSwapTransactionsV3(
        contestFilter.id,
        fromTime,
        toTime,
        index * 1000,
      );
      arr = arr.concat(pageData);

      if (pageData.length < 1000) {
        break;
      }
    }
    return arr;
  };

  const getTradingDataBetweenDates = async (
    fromDate: number,
    toDate: number,
  ) => {
    const diffDays = dayjs(toDate).diff(dayjs(fromDate), 'day');
    let arr: SwapDataV3[] = [];

    for (let i = 0; i < diffDays; i++) {
      const fromTime = dayjs(fromDate)
        .add(i, 'day')
        .unix();
      const toTime = dayjs(fromDate)
        .add(i + 1, 'day')
        .unix();
      const swapData = await getTradingDataOfDay(fromTime, toTime);
      arr = arr.concat(swapData);
      console.log('swapData', swapData.length);
    }
    return arr;
  };

  const getFormattedLeaderBoardData = useCallback((swapData: SwapDataV3[]) => {
    const formattedLeaderBoardData = swapData.reduce(
      (p: ContestLeaderBoard[], c) => {
        const i = p.findIndex((e: ContestLeaderBoard) => e.sender === c.sender);

        if (i === -1) {
          p.push({
            sender: c.sender,
            amountUSD: +c.amountUSD,
            txCount: 1,
          });
        } else {
          p[i].amountUSD += +c.amountUSD;
          p[i].txCount += 1;
        }
        return p;
      },
      [],
    );
    formattedLeaderBoardData.sort((a, b) => b.amountUSD - a.amountUSD);
    return formattedLeaderBoardData;
  }, []);

  useEffect(() => {
    console.log('farmFilter', contestFilter);
    (async () => {
      if (contestFilter) {
        setLoading(true);
        const today = dayjs()
          .utc()
          .unix();

        const sevenDayAgo = dayjs
          .utc()
          .subtract(7, 'day')
          .unix();

        const swapData: SwapDataV3[] = await getTradingDataBetweenDates(
          sevenDayAgo * 1000,
          today * 1000,
        );
        // const swapData: SwapDataV3[] = [];
        console.log('swapData', swapData.length);
        if (swapData) {
          const formattedLeaderBoardData = getFormattedLeaderBoardData(
            swapData,
          );
          setContestLeaderBoard(formattedLeaderBoardData);
          // setContestLeaderBoard(testData);
        }
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contestFilter]);

  const desktopTableColumns = [
    { text: t('rank'), width: 0.1, justify: 'flex-start' },
    { text: t('address'), width: 0.4, justify: 'center' },
    { text: t('tradesTitleCase'), width: 0.2, justify: 'center' },
    {
      text: t('volumeUSDC'),
      width: 0.3,
      justify: 'flex-end',
    },
  ];
  const mobileTableColumns = [
    { text: 'Rank', width: 0.1, justify: 'flex-start' },
    { text: 'Address', width: 0.5, justify: 'center' },
    {
      text: 'Volume USDC',
      width: 0.4,
      justify: 'flex-end',
    },
  ];

  return (
    <Box width='100%' mb={3} id='contest-page'>
      <Box className='pageHeading'>
        <Box className='flex row items-center'>
          <h4>{t('contest')}</h4>
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

      <Box className='bg-palette' borderRadius={10}>
        <>
          <Box mt={2} pl='12px' className='bg-secondary1 rounded-top-10px'>
            <CustomTabSwitch
              items={contestFilters}
              selectedItem={contestFilter}
              handleTabChange={setContestFilter}
              height={50}
            />
          </Box>

          <Box padding={'12px'}>
            <Box mt={1} className='contestWrapper'>
              <Box className='flex items-center'>
                {(isMobile ? mobileTableColumns : desktopTableColumns).map(
                  (e, i) => {
                    return (
                      <Box
                        key={i}
                        width={e.width}
                        className='flex items-center cursor-pointer'
                        justifyContent={e.justify}
                      >
                        <small className={'text-secondary'}>{e.text}</small>
                      </Box>
                    );
                  },
                )}
              </Box>
            </Box>

            {loading ? (
              <Box py={5} className='flex justify-center'>
                <Loader stroke={'white'} size={'1.5rem'} />
              </Box>
            ) : (
              <Box className='contestWrapper'>
                {contestLeaderBoard.map((contestantData, index) => {
                  return (
                    <>
                      <ContestCard
                        contestantData={contestantData}
                        index={index}
                      />
                    </>
                  );
                })}
              </Box>
            )}
          </Box>
        </>
      </Box>
    </Box>
  );
};

export default ContestPage;
