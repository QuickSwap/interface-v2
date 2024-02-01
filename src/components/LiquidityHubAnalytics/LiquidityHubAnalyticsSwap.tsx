import React from 'react';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import CustomTable from 'components/CustomTable';
import { formatNumber, getEtherscanLink, shortenTx } from 'utils';
import { useActiveWeb3React } from 'hooks';
import { formatUnits } from 'ethers/lib/utils';

const LiquidityHubAnalyticsSwap: React.FC<{
  data: any[] | undefined;
}> = ({ data }) => {
  const { t } = useTranslation();
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
        Number(formatUnits(item.srcAmount, item.srcToken.decimals)),
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
        Number(formatUnits(item.dexAmountOut, item.dstToken.decimals)),
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
              Number(formatUnits(item.srcAmount, item.srcToken.decimals)),
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
              Number(formatUnits(item.dexAmountOut, item.dstToken.decimals)),
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
    ];
  };

  return data && data.length > 0 ? (
    <CustomTable
      showPagination={data.length > 10}
      headCells={headCells}
      defaultOrderBy={headCells[0]}
      rowsPerPage={10}
      data={data}
      mobileHTML={mobileHTML}
      desktopHTML={desktopHTML}
    />
  ) : (
    <Box width='100%' height={400} className='flex items-center justify-center'>
      <p>{t('lhNoData')}</p>
    </Box>
  );
};

export default LiquidityHubAnalyticsSwap;
