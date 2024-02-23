import React, { useMemo, useState } from 'react';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import CustomTable from 'components/CustomTable';
import { formatNumber, getEtherscanLink, shortenTx } from 'utils';
import { useActiveWeb3React } from 'hooks';
import { formatUnits } from 'ethers/lib/utils';
import { useLHAnalytics } from 'hooks/useLHAnalytics';
import { Skeleton } from '@material-ui/lab';
import dayjs from 'dayjs';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

const LiquidityHubAnalyticsSwap: React.FC = () => {
  const { t } = useTranslation();
  const [pageIndex, setPageIndex] = useState(0);
  const lhStartTime = dayjs('2023-12-05T14:44:30.000Z').unix();
  const startTime = dayjs
    .utc(
      dayjs()
        .subtract(3 * (pageIndex + 1) - 1, 'days')
        .utc()
        .format('YYYY-MM-DD'),
    )
    .unix();
  const endTime = dayjs
    .utc(
      dayjs()
        .subtract(3 * pageIndex - 1, 'days')
        .utc()
        .format('YYYY-MM-DD'),
    )
    .unix();
  const { isLoading, data: lhData } = useLHAnalytics(startTime, endTime);
  const data: any[] = useMemo(() => {
    if (!lhData) return [];
    return lhData;
  }, [lhData]);
  const headCells = [
    {
      id: 'txHash',
      numeric: false,
      label: t('txHash'),
      sortKey: (item: any) => item.txHash,
    },
    {
      id: 'inAmount',
      numeric: false,
      label: t('inAmount'),
      sortKey: (item: any) =>
        Number(formatUnits(item.srcAmount, item.srcToken?.decimals)),
    },
    {
      id: 'tokenSymbol',
      numeric: false,
      label: t('tokenSymbol'),
      sortKey: (item: any) => item.srcTokenSymbol,
    },
    {
      id: 'inValueUSD',
      numeric: false,
      label: t('inValueUSD'),
      sortKey: (item: any) => item.dexAmountUSD,
    },
    {
      id: 'outAmount',
      numeric: false,
      label: t('outAmount'),
      sortKey: (item: any) =>
        Number(formatUnits(item.dexAmountOut, item.dstToken?.decimals)),
    },
    {
      id: 'outSymbol',
      numeric: false,
      label: t('outSymbol'),
      sortKey: (item: any) => item.dstTokenSymbol,
    },
    {
      id: 'outValueUSD',
      numeric: false,
      label: t('outValueUSD'),
      sortKey: (item: any) => -1 * item.dexAmountUSD,
    },
    {
      id: 'timestamp',
      numeric: false,
      label: t('time'),
      sortKey: (item: any) => dayjs(item.timestamp).unix() * -1,
    },
  ];

  const { chainId } = useActiveWeb3React();
  const mobileHTML = (item: any, index: number) => {
    return (
      <Box mt={index === 0 ? 0 : 3} key={index}>
        <Box className='mobileRow'>
          <p>{t('txHash')}</p>
          {chainId ? (
            <a
              href={getEtherscanLink(chainId, item.txHash, 'transaction')}
              target='_blank'
              rel='noopener noreferrer'
              className='no-decoration'
            >
              <p className='text-primary'>{shortenTx(item.txHash)}</p>
            </a>
          ) : (
            <p className='text-primary'>{shortenTx(item.txHash)}</p>
          )}
        </Box>
        <Box className='mobileRow'>
          <p>{t('inAmount')}</p>
          <p>
            {formatNumber(
              Number(formatUnits(item.srcAmount, item.srcToken?.decimals)),
            )}
          </p>
        </Box>
        <Box className='mobileRow'>
          <p>{t('tokenSymbol')}</p>
          <p>{item.srcTokenSymbol}</p>
        </Box>
        <Box className='mobileRow'>
          <p>{t('inValueUSD')}</p>
          <p>{formatNumber(item.dexAmountUSD)}</p>
        </Box>
        <Box className='mobileRow'>
          <p>{t('outAmount')}</p>
          <p>
            {formatNumber(
              Number(formatUnits(item.dexAmountOut, item.dstToken?.decimals)),
            )}
          </p>
        </Box>
        <Box className='mobileRow'>
          <p>{t('outSymbol')}</p>
          <p>{item.dstTokenSymbol}</p>
        </Box>
        <Box className='mobileRow'>
          <p>{t('outValueUSD')}</p>
          <p>-{formatNumber(item.dexAmountUSD)}</p>
        </Box>
        <Box className='mobileRow'>
          <p>{t('time')}</p>
          <p>-{formatNumber(item.dexAmountUSD)}</p>
        </Box>
      </Box>
    );
  };

  const desktopHTML = (item: any) => {
    return [
      {
        html: chainId ? (
          <a
            href={getEtherscanLink(chainId, item.txHash, 'transaction')}
            target='_blank'
            rel='noopener noreferrer'
            className='no-decoration'
          >
            <p className='text-primary'>{shortenTx(item.txHash)}</p>
          </a>
        ) : (
          <p className='text-primary'>{shortenTx(item.txHash)}</p>
        ),
      },
      {
        html: (
          <p>
            {formatNumber(
              Number(formatUnits(item.srcAmount, item.srcToken?.decimals)),
            )}
          </p>
        ),
      },
      {
        html: <p>{item.srcTokenSymbol}</p>,
      },
      {
        html: <p>{formatNumber(item.dexAmountUSD)}</p>,
      },
      {
        html: (
          <p>
            {formatNumber(
              Number(formatUnits(item.dexAmountOut, item.dstToken?.decimals)),
            )}
          </p>
        ),
      },
      {
        html: <p>{item.dstTokenSymbol}</p>,
      },
      {
        html: <p>-{formatNumber(item.dexAmountUSD)}</p>,
      },
      {
        html: <p>{dayjs(item.timestamp).fromNow()}</p>,
      },
    ];
  };

  return (
    <>
      <Box
        mb={2}
        className='flex justify-between items-center flex-wrap'
        gridGap={8}
      >
        <p>{t('lhSwaps')}</p>
        <Box className='flex'>
          <Box
            width='40px'
            height='40px'
            className={`${
              startTime < lhStartTime ? 'text-secondary' : 'cursor-pointer'
            } flex items-center justify-center`}
            onClick={() => {
              if (startTime >= lhStartTime) {
                setPageIndex(pageIndex + 1);
              }
            }}
          >
            <KeyboardArrowLeft />
          </Box>
          <Box
            width='40px'
            height='40px'
            className={`${
              pageIndex === 0 ? 'text-secondary' : 'cursor-pointer'
            } flex items-center justify-center`}
            onClick={() => {
              if (pageIndex > 0) {
                setPageIndex(pageIndex - 1);
              }
            }}
          >
            <KeyboardArrowRight />
          </Box>
        </Box>
      </Box>
      {isLoading ? (
        <Skeleton width='100%' height={400} />
      ) : data && data.length > 0 ? (
        <CustomTable
          showPagination={data.length > 10}
          headCells={headCells}
          defaultOrderBy={headCells[headCells.length - 1]}
          rowsPerPage={10}
          data={data}
          mobileHTML={mobileHTML}
          desktopHTML={desktopHTML}
        />
      ) : (
        <Box
          width='100%'
          height={400}
          className='flex items-center justify-center'
        >
          <p>{t('lhNoData')}</p>
        </Box>
      )}
    </>
  );
};

export default LiquidityHubAnalyticsSwap;
