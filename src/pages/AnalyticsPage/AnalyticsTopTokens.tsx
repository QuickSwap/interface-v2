import { Box } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { ArrowForwardIos } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import Skeleton from '@material-ui/lab/Skeleton';
import { useActiveWeb3React, useAnalyticsVersion } from 'hooks';
import { TokensTable } from 'components';
import { useAnalyticsTopTokens } from 'hooks/useFetchAnalyticsData';
import Loader from 'components/Loader';
import { exportToXLSX } from 'utils/exportToXLSX';
import { formatNumber, getFormattedPrice } from 'utils';
import { getConfig } from 'config/index';

const AnalyticsTopTokens: React.FC = () => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const history = useHistory();
  const version = useAnalyticsVersion();
  const {
    isLoading: topTokensLoading,
    data: topTokens,
  } = useAnalyticsTopTokens(version, chainId);
  const [xlsExported, setXLSExported] = useState(false);
  const config = getConfig(chainId);
  const networkName = config['networkName'];

  useEffect(() => {
    if (xlsExported) {
      const exportData = topTokens
        .sort((token1: any, token2: any) => {
          return token1.totalLiquidityUSD > token2.totalLiquidityUSD ? -1 : 1;
        })
        .map((token: any) => {
          return {
            Name: token.name + ' (' + token.symbol + ')',
            Price: `$${formatNumber(token.priceUSD)}`,
            '24H %': `${getFormattedPrice(Number(token.priceChangeUSD))}%`,
            '24H Volume': `$${formatNumber(token.oneDayVolumeUSD)}`,
            Liquidity: `$${formatNumber(token.totalLiquidityUSD)}`,
          };
        });
      exportToXLSX(exportData, `Quickswap-Tokens-${networkName}-${version}`);
      setTimeout(() => {
        setXLSExported(false);
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xlsExported]);

  return (
    <>
      <Box className='flex items-center justify-between'>
        <Box className='headingWrapper'>
          <p className='weight-600'>{t('topTokens')}</p>
        </Box>
        <Box className='flex items-center' gridGap={8}>
          <Box
            className={`bg-secondary1 flex items-center ${
              xlsExported ? '' : 'cursor-pointer'
            }`}
            padding='4px 8px'
            borderRadius={6}
            onClick={() => {
              if (!xlsExported) setXLSExported(true);
            }}
          >
            {xlsExported ? <Loader /> : <small>{t('export')}</small>}
          </Box>
          <Box
            className='cursor-pointer headingWrapper'
            onClick={() => history.push(`/analytics/${version}/tokens`)}
          >
            <p className='weight-600'>{t('seeAll')}</p>
            <ArrowForwardIos />
          </Box>
        </Box>
      </Box>
      <Box mt={3} className='panel'>
        {topTokensLoading ? (
          <Skeleton variant='rect' width='100%' height={150} />
        ) : topTokens ? (
          <TokensTable
            data={topTokens
              .sort((token1: any, token2: any) => {
                return token1.totalLiquidityUSD > token2.totalLiquidityUSD
                  ? -1
                  : 1;
              })
              .slice(0, 10)}
            showPagination={false}
          />
        ) : (
          <></>
        )}
      </Box>
    </>
  );
};

export default AnalyticsTopTokens;
