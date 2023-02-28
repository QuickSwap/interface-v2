import React from 'react';
import { Box } from '@material-ui/core';
import { CustomTable } from 'components';
import { GlobalConst } from 'constants/index';
import { formatNumber, shortenAddress } from 'utils';
import 'components/styles/AnalyticsTable.scss';
import { useTranslation } from 'react-i18next';

interface ContestTableProps {
  data: any[];
  showPagination?: boolean;
}

const liquidityHeadCellIndex = 4;

const ContestTable: React.FC<ContestTableProps> = ({
  data,
  showPagination = true,
}) => {
  const { t } = useTranslation();
  const tokenHeadCells = [
    {
      id: 'rank',
      numeric: true,
      label: t('rank'),
      sortKey: (item: any) => item.rank,
    },
    {
      id: 'address',
      numeric: false,
      label: t('address'),
      sortKey: (item: any) => item.origin,
    },
    {
      id: 'tradesTitleCase',
      numeric: false,
      label: t('tradesTitleCase'),
      sortKey: (item: any) => item.txCount,
    },
    {
      id: 'volumeUSDC',
      numeric: true,
      label: t('volumeUSDC'),
      sortKey: (item: any) => item.amountUSD,
    },
  ];

  const mobileHTML = (token: any, index: number) => {
    return (
      <Box mt={index === 0 ? 0 : 3}>
        <Box className='mobileRow'>
          <p>{t('rank')}</p>
          <p>{token.rank}</p>
        </Box>
        <Box className='mobileRow'>
          <p>{t('address')}</p>
          <Box className={``}>
            <small>{shortenAddress(token.origin)}</small>
          </Box>
        </Box>
        <Box className='mobileRow'>
          <p>{t('tradesTitleCase')}</p>
          <p>{token.txCount}</p>
        </Box>
        <Box className='mobileRow'>
          <p>{t('volumeUSDC')}</p>
          <p className={`priceChangeWrapper text-success`}>
            {formatNumber(token.amountUSD)}
          </p>
        </Box>
      </Box>
    );
  };

  const desktopHTML = (token: any, index: number, page: number) => {
    return [
      {
        html: (
          <Box>
            <p>{token.rank}</p>
          </Box>
        ),
      },
      {
        html: (
          <Box className={`priceChangeWrapper`} mr={2}>
            <small>{token.origin}</small>
          </Box>
        ),
      },
      {
        html: (
          <Box className={``} mr={2}>
            <small>{token.txCount}</small>
          </Box>
        ),
      },
      {
        html: (
          <Box className={`priceChangeWrapper text-success`} mr={2}>
            <small>{formatNumber(token.amountUSD)}</small>
          </Box>
        ),
      },
    ];
  };

  return (
    <CustomTable
      defaultOrderBy={tokenHeadCells[liquidityHeadCellIndex]}
      defaultOrder='asc'
      showPagination={showPagination}
      headCells={tokenHeadCells}
      rowsPerPage={GlobalConst.utils.ROWSPERPAGE}
      data={data}
      mobileHTML={mobileHTML}
      desktopHTML={desktopHTML}
    />
  );
};

export default ContestTable;
