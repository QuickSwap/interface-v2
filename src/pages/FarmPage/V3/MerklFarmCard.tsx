import React from 'react';
import { Box, Button, useMediaQuery, useTheme } from '@material-ui/core';
import { DoubleCurrencyLogo } from 'components';
import { formatNumber, getTokenFromAddress } from 'utils';
import APRHover from 'assets/images/aprHover.png';
import { useTranslation } from 'react-i18next';
import { MerklFarmAPRTooltip } from './MerklFarmAPRTooltip';
import { useHistory } from 'react-router-dom';
import useParsedQueryString from 'hooks/useParsedQueryString';
import { useSelectedTokenList } from 'state/lists/hooks';
import { useActiveWeb3React } from 'hooks';
// import dayjs from 'dayjs';
// import { formatUnits } from 'ethers/lib/utils';

interface Props {
  farm: any;
}

export const MerklFarmCard: React.FC<Props> = ({ farm }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const { chainId } = useActiveWeb3React();
  const parsedQuery = useParsedQueryString();
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('sm'));
  // const currentTime = dayjs().unix();

  const redirectWithPool = (pool: string) => {
    const currentPath = history.location.pathname + history.location.search;
    let redirectPath;
    if (parsedQuery && parsedQuery.pool) {
      redirectPath = currentPath.replace(
        `pool=${parsedQuery.pool}`,
        `pool=${pool}`,
      );
    } else {
      redirectPath = `${currentPath}${
        history.location.search === '' ? '?' : '&'
      }pool=${pool}`;
    }
    history.push(redirectPath);

    window.scrollTo(0, 0);
  };

  const tokenMap = useSelectedTokenList();

  const token0 = getTokenFromAddress(farm.token0, chainId, tokenMap, []);
  const token1 = getTokenFromAddress(farm.token1, chainId, tokenMap, []);

  return (
    <>
      {token0 && token1 && (
        <Box pb={2}>
          <Box width='100%' borderRadius={16} className='bg-secondary1'>
            <Box padding={2} className='flex items-center flex-wrap'>
              <Box
                width={isMobile ? '100%' : '90%'}
                className='flex items-center flex-wrap'
              >
                <Box
                  width={isMobile ? '80%' : '30%'}
                  className='flex items-center'
                  gridGap={12}
                >
                  <DoubleCurrencyLogo
                    currency0={token0}
                    currency1={token1}
                    size={24}
                  />
                  <Box className='flex items-center' gridGap={4}>
                    <p>
                      {token0?.symbol}/{token1?.symbol}
                    </p>
                    {(farm?.ammName ?? '').toLowerCase() === 'quickswapuni' &&
                      !!farm?.poolFee && (
                        <Box className='farmAPRTitleWrapper bg-textSecondary'>
                          <span className='text-gray32'>{farm.poolFee}%</span>
                        </Box>
                      )}
                  </Box>
                </Box>
                <Box
                  my={2}
                  width={isMobile ? '100%' : '20%'}
                  className='flex items-center justify-between'
                >
                  {isMobile && <p>{t('tvl')}</p>}
                  <p>${formatNumber(farm.tvl)}</p>
                </Box>
                <Box
                  width={isMobile ? '100%' : '20%'}
                  className='flex items-center justify-between'
                >
                  {isMobile && <p>{t('apr')}</p>}
                  <Box className={isMobile ? 'flex flex-col items-end' : ''}>
                    <small>{t('upTo')}</small>
                    <Box className='flex'>
                      <MerklFarmAPRTooltip
                        farms={farm.alm}
                        token0={farm.token0}
                        token1={farm.token1}
                      >
                        <Box className='farmCardAPR' gridGap={4}>
                          <p>{formatNumber(farm.apr)}%</p>
                          <img src={APRHover} width={16} />
                        </Box>
                      </MerklFarmAPRTooltip>
                    </Box>
                  </Box>
                </Box>
                <Box
                  width={isMobile ? '100%' : '30%'}
                  my={2}
                  className={
                    isMobile ? 'flex items-center justify-between' : ''
                  }
                >
                  {isMobile && <p>{t('rewards')}</p>}
                  <Box className={isMobile ? 'flex flex-col items-end' : ''}>
                    <p>
                      {formatNumber(farm.dailyAmount)} {farm.symbolRewardToken}{' '}
                      <small className='text-secondary'>{t('daily')}</small>
                    </p>
                  </Box>
                </Box>
              </Box>
              <Box width={isMobile ? '100%' : '10%'} mt={0}>
                <Button
                  className='farmCardButton'
                  disabled={!farm.pool}
                  onClick={() => {
                    if (farm.pool) {
                      redirectWithPool(farm.pool);
                    }
                  }}
                >
                  {t('view')}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

export default MerklFarmCard;
