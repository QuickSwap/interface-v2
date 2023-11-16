import React from 'react';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import CustomTable from 'components/CustomTable';
import { formatNumber, getEtherscanLink, shortenTx } from 'utils';
import { useActiveWeb3React } from 'hooks';

const LiquidityHubAnalyticsSwap: React.FC<{
  data: any[] | undefined;
}> = ({ data }) => {
  const { t } = useTranslation();
  const headCells = [
    {
      id: 'txHash',
      numeric: false,
      label: t('txHash'),
      sortKey: (item: any) => item.evt_tx_hash,
    },
    {
      id: 'inAmount',
      numeric: false,
      label: t('inAmount'),
      sortKey: (item: any) => item.amount_raw,
    },
    {
      id: 'tokenSymbol',
      numeric: false,
      label: t('24hPer'),
      sortKey: (item: any) => item.token_symbol,
    },
    {
      id: 'inValueUSD',
      numeric: false,
      label: t('inValueUSD'),
      sortKey: (item: any) => item.calculated_value,
    },
    {
      id: 'outAmount',
      numeric: false,
      label: t('outAmount'),
      sortKey: (item: any) => item.amount_raw,
    },
    {
      id: 'outSymbol',
      numeric: false,
      label: t('outSymbol'),
      sortKey: (item: any) => item.token_symbol,
    },
    {
      id: 'outValueUSD',
      numeric: false,
      label: t('outValueUSD'),
      sortKey: (item: any) => item.calculated_value,
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
              href={getEtherscanLink(chainId, item.evt_tx_hash, 'transaction')}
              target='_blank'
              rel='noopener noreferrer'
              className='no-decoration'
            >
              <p className='text-primary'>{shortenTx(item.evt_tx_hash)}</p>
            </a>
          ) : (
            <p className='text-primary'>{shortenTx(item.evt_tx_hash)}</p>
          )}
        </Box>
        <Box className='mobileRow'>
          <p>{t('inAmount')}</p>
          <p>{formatNumber(item.amount_raw)}</p>
        </Box>
        <Box className='mobileRow'>
          <p>{t('tokenSymbol')}</p>
          <p>{item.token_symbol}</p>
        </Box>
        <Box className='mobileRow'>
          <p>{t('inValueUSD')}</p>
          <p>{formatNumber(item.calculated_value)}</p>
        </Box>
        <Box className='mobileRow'>
          <p>{t('outAmount')}</p>
          <p>{formatNumber(item.amount_raw)}</p>
        </Box>
        <Box className='mobileRow'>
          <p>{t('outSymbol')}</p>
          <p>{item.token_symbol}</p>
        </Box>
        <Box className='mobileRow'>
          <p>{t('outValueUSD')}</p>
          <p>{formatNumber(item.calculated_value)}</p>
        </Box>
      </Box>
    );
  };

  const desktopHTML = (item: any) => {
    return [
      {
        html: chainId ? (
          <a
            href={getEtherscanLink(chainId, item.evt_tx_hash, 'transaction')}
            target='_blank'
            rel='noopener noreferrer'
            className='no-decoration'
          >
            <p className='text-primary'>{shortenTx(item.evt_tx_hash)}</p>
          </a>
        ) : (
          <p className='text-primary'>{shortenTx(item.evt_tx_hash)}</p>
        ),
      },
      {
        html: <p>{formatNumber(item.amount_raw)}</p>,
      },
      {
        html: <p>{item.token_symbol}</p>,
      },
      {
        html: <p>{formatNumber(item.calculated_value)}</p>,
      },
      {
        html: <p>{formatNumber(item.amount_raw)}</p>,
      },
      {
        html: <p>{item.token_symbol}</p>,
      },
      {
        html: <p>{formatNumber(item.calculated_value)}</p>,
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
    <Box width='100%' height={400}>
      {t('lhNoData')}
    </Box>
  );
};

export default LiquidityHubAnalyticsSwap;
