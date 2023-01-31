import React from 'react';
import { Box, Divider } from '@material-ui/core';
import { Link, useParams } from 'react-router-dom';
import { ChainId, Token } from '@uniswap/sdk';
import { getAddress } from '@ethersproject/address';
import { DoubleCurrencyLogo, CustomTable } from 'components';
import { GlobalConst } from 'constants/index';
import { useBookmarkPairs } from 'state/application/hooks';
import { ReactComponent as StarChecked } from 'assets/images/StarChecked.svg';
import { ReactComponent as StarUnchecked } from 'assets/images/StarUnchecked.svg';
import { useTranslation } from 'react-i18next';
import { formatNumber, getTokenFromAddress } from 'utils';
import { useSelectedTokenList } from 'state/lists/hooks';
import 'components/styles/AnalyticsTable.scss';

interface PairsTableProps {
  data: any[];
  showPagination?: boolean;
}

const PairTable: React.FC<PairsTableProps> = ({
  data,
  showPagination = true,
}) => {
  const { t } = useTranslation();
  const params: any = useParams();
  const version = params && params.version ? params.version : 'total';
  const liquidityHeadCellIndex = version === 'total' ? 2 : 1;

  const v2SpecificCells = [
    {
      id: 'pairdayFee',
      numeric: false,
      label: '24h Fees',
      align: 'right',
      sortKey: (pair: any) =>
        pair.oneWeekVolumeUSD && !isNaN(pair.oneWeekVolumeUSD)
          ? pair.oneWeekVolumeUSD
          : pair.oneWeekVolumeUntracked && !isNaN(pair.oneWeekVolumeUntracked)
          ? pair.oneWeekVolumeUntracked
          : 0,
    },
  ];

  const v3SpecificCells = [
    {
      id: 'pairApr',
      numeric: false,
      label: 'APR',
      align: 'right',
      sortKey: (pair: any) => Number(pair.apr),
    },
    {
      id: 'pairFarmingApr',
      numeric: false,
      label: 'Farming APR',
      align: 'right',
      sortKey: (pair: any) => Number(pair.farmingApr),
    },
  ];

  const totalSpecificCell: any[] = [
    {
      id: 'version',
      numeric: false,
      label: '#',
      sortDisabled: true,
    },
  ];

  const headCells = (version === 'total' ? totalSpecificCell : [])
    .concat([
      {
        id: 'pairName',
        numeric: false,
        label: 'Name',
        sortKey: (pair: any) => pair.token0.symbol + ' ' + pair.token1.symbol,
      },
      {
        id: 'pairLiquidity',
        numeric: false,
        label: 'Liquidity',
        sortKey: (pair: any) =>
          pair.trackedReserveUSD
            ? pair.trackedReserveUSD
            : pair.reserveUSD ?? 0,
      },
      {
        id: 'pairdayVolume',
        numeric: false,
        label: '24h Volume',
        sortKey: (pair: any) =>
          pair.oneDayVolumeUSD && !isNaN(pair.oneDayVolumeUSD)
            ? pair.oneDayVolumeUSD
            : pair.oneDayVolumeUntracked && !isNaN(pair.oneDayVolumeUntracked)
            ? pair.oneDayVolumeUntracked
            : 0,
      },
      {
        id: 'pairweekVolume',
        numeric: false,
        label: '7d Volume',
        sortKey: (pair: any) =>
          pair.oneWeekVolumeUSD && !isNaN(pair.oneWeekVolumeUSD)
            ? pair.oneWeekVolumeUSD
            : pair.oneWeekVolumeUntracked && !isNaN(pair.oneWeekVolumeUntracked)
            ? pair.oneWeekVolumeUntracked
            : 0,
      },
    ])
    .concat(version === 'v2' ? v2SpecificCells : v3SpecificCells);

  const {
    bookmarkPairs,
    addBookmarkPair,
    removeBookmarkPair,
  } = useBookmarkPairs();
  const tokenMap = useSelectedTokenList();
  const mobileHTML = (pair: any, index: number) => {
    const token0 = getTokenFromAddress(
      pair.token0.id,
      ChainId.MATIC,
      tokenMap,
      [
        new Token(
          ChainId.MATIC,
          getAddress(pair.token0.id),
          Number(pair.token0.decimals),
          pair.token0.symbol,
        ),
      ],
    );
    const token1 = getTokenFromAddress(
      pair.token1.id,
      ChainId.MATIC,
      tokenMap,
      [
        new Token(
          ChainId.MATIC,
          getAddress(pair.token1.id),
          Number(pair.token1.decimals),
          pair.token1.symbol,
        ),
      ],
    );
    const liquidity = pair.trackedReserveUSD
      ? pair.trackedReserveUSD
      : pair.reserveUSD ?? 0;
    const oneDayVolume =
      pair.oneDayVolumeUSD && !isNaN(pair.oneDayVolumeUSD)
        ? pair.oneDayVolumeUSD
        : pair.oneDayVolumeUntracked && !isNaN(pair.oneDayVolumeUntracked)
        ? pair.oneDayVolumeUntracked
        : 0;
    const oneWeekVolume =
      pair.oneWeekVolumeUSD && !isNaN(pair.oneWeekVolumeUSD)
        ? pair.oneWeekVolumeUSD
        : pair.oneWeekVolumeUntracked && !isNaN(pair.oneWeekVolumeUntracked)
        ? pair.oneWeekVolumeUntracked
        : 0;
    const oneDayFee = formatNumber(
      Number(oneDayVolume) * GlobalConst.utils.FEEPERCENT,
    );
    const apr = pair.apr;
    const farmingApr = pair.farmingApr;
    return (
      <Box mt={index === 0 ? 0 : 3}>
        <Box className='flex items-center justify-between' mb={1}>
          <Box className='flex items-center'>
            <Box
              display='flex'
              onClick={() => {
                const pairIndex = bookmarkPairs.indexOf(pair.id);
                if (pairIndex === -1) {
                  addBookmarkPair(pair.id);
                } else {
                  removeBookmarkPair(pair.id);
                }
              }}
            >
              {bookmarkPairs.indexOf(pair.id) > -1 ? (
                <StarChecked />
              ) : (
                <StarUnchecked />
              )}
            </Box>
            <Link
              className='no-decoration'
              to={`/analytics/${version}/pair/${pair.id}`}
            >
              <Box className='flex items-center'>
                <DoubleCurrencyLogo
                  currency0={token0}
                  currency1={token1}
                  size={24}
                />
                <Box ml='5px'>
                  <p className='small text-gray25'>
                    {token0.symbol} / {token1.symbol}
                  </p>
                </Box>
              </Box>
            </Link>
          </Box>
          <Box className='flex items-center'>
            {version !== 'v2' && (
              <Box
                paddingY={0.5}
                paddingX={1}
                borderRadius={6}
                className='text-primaryText bg-gray30'
              >
                {pair.fee / 10000}% Fee
              </Box>
            )}
            {version === 'total' && (
              <Box ml={0.5} className='analyticsPairVersion'>
                {pair.isV3 ? 'V3' : 'V2'}
              </Box>
            )}
          </Box>
        </Box>
        <Divider />
        <Box className='mobileRow'>
          <p>{t('liquidity')}</p>
          <p>${formatNumber(liquidity)}</p>
        </Box>
        <Box className='mobileRow'>
          <p>{t('24hVol')}</p>
          <p>${formatNumber(oneDayVolume)}</p>
        </Box>
        <Box className='mobileRow'>
          <p>{t('7dVol')}</p>
          <p>${formatNumber(oneWeekVolume)}</p>
        </Box>
        {version !== 'v2' ? (
          <>
            <Box className={`mobileRow ${apr ? 'text-success' : ''}`}>
              <p>{t('apr')}</p>
              <p>{apr ? `${apr}%` : '-'}</p>
            </Box>
            <Box className={`mobileRow ${farmingApr ? 'text-success' : ''}`}>
              <p>{t('farmingApr')}</p>
              <p>{farmingApr ? `${farmingApr}%` : '-'}</p>
            </Box>
          </>
        ) : (
          <>
            <Box className='mobileRow'>
              <p>{t('24hFees')}</p>
              <p>${oneDayFee}</p>
            </Box>
          </>
        )}
      </Box>
    );
  };

  const desktopHTML = (pair: any) => {
    const token0 = getTokenFromAddress(
      pair.token0.id,
      ChainId.MATIC,
      tokenMap,
      [
        new Token(
          ChainId.MATIC,
          getAddress(pair.token0.id),
          Number(pair.token0.decimals),
          pair.token0.symbol,
        ),
      ],
    );
    const token1 = getTokenFromAddress(
      pair.token1.id,
      ChainId.MATIC,
      tokenMap,
      [
        new Token(
          ChainId.MATIC,
          getAddress(pair.token1.id),
          Number(pair.token1.decimals),
          pair.token1.symbol,
        ),
      ],
    );
    const liquidity = pair.trackedReserveUSD
      ? pair.trackedReserveUSD
      : pair.reserveUSD ?? 0;
    const oneDayVolume =
      pair.oneDayVolumeUSD && !isNaN(pair.oneDayVolumeUSD)
        ? pair.oneDayVolumeUSD
        : pair.oneDayVolumeUntracked && !isNaN(pair.oneDayVolumeUntracked)
        ? pair.oneDayVolumeUntracked
        : 0;
    const oneWeekVolume =
      pair.oneWeekVolumeUSD && !isNaN(pair.oneWeekVolumeUSD)
        ? pair.oneWeekVolumeUSD
        : pair.oneWeekVolumeUntracked && !isNaN(pair.oneWeekVolumeUntracked)
        ? pair.oneWeekVolumeUntracked
        : 0;
    const oneDayFee = formatNumber(
      Number(oneDayVolume) * GlobalConst.utils.FEEPERCENT,
    );
    const apr = pair.apr;
    const farmingApr = pair.farmingApr;

    const v2SpecificRows = [
      {
        html: <p>${oneDayFee}</p>,
      },
    ];

    const v3SpecificRows = [
      {
        html: (
          <p className={`${apr ? 'text-success' : ''}`}>
            {apr ? `${apr}%` : '-'}
          </p>
        ),
      },
      {
        html: (
          <p className={`${farmingApr ? 'text-success' : ''}`}>
            {farmingApr ? `${farmingApr}%` : '-'}
          </p>
        ),
      },
    ];

    const totalSpecificRows = [
      {
        html: (
          <Box className='analyticsPairVersion'>{pair.isV3 ? 'V3' : 'V2'}</Box>
        ),
      },
    ];

    return (version === 'total' ? totalSpecificRows : [])
      .concat([
        {
          html: (
            <Box className='flex items-center'>
              <Box
                display='flex'
                mr={1}
                onClick={() => {
                  const pairIndex = bookmarkPairs.indexOf(pair.id);
                  if (pairIndex === -1) {
                    addBookmarkPair(pair.id);
                  } else {
                    removeBookmarkPair(pair.id);
                  }
                }}
              >
                {bookmarkPairs.indexOf(pair.id) > -1 ? (
                  <StarChecked />
                ) : (
                  <StarUnchecked />
                )}
              </Box>
              <Link
                className='no-decoration'
                to={`/analytics/${pair.isV3 ? 'v3' : 'v2'}/pair/${pair.id}`}
              >
                <Box className='flex items-center'>
                  <DoubleCurrencyLogo
                    currency0={token0}
                    currency1={token1}
                    size={28}
                  />
                  <Box ml={1}>
                    <p className='text-gray25'>
                      {token0.symbol} / {token1.symbol}
                    </p>
                  </Box>
                </Box>
              </Link>
              {version !== 'v2' && pair.isV3 && (
                <Box
                  ml={2}
                  paddingY={0.5}
                  paddingX={1}
                  borderRadius={6}
                  className='text-primaryText bg-gray30'
                >
                  {pair.fee / 10000}% Fee
                </Box>
              )}
            </Box>
          ),
        },
        {
          html: <p>${formatNumber(liquidity)}</p>,
        },
        {
          html: <p>${formatNumber(oneDayVolume)}</p>,
        },
        {
          html: <p>${formatNumber(oneWeekVolume)}</p>,
        },
      ])
      .concat(version === 'v2' ? v2SpecificRows : v3SpecificRows);
  };

  return (
    <CustomTable
      defaultOrderBy={headCells[liquidityHeadCellIndex]}
      defaultOrder='desc'
      showPagination={showPagination}
      headCells={headCells}
      rowsPerPage={GlobalConst.utils.ROWSPERPAGE}
      data={data}
      mobileHTML={mobileHTML}
      desktopHTML={desktopHTML}
    />
  );
};

export default PairTable;
