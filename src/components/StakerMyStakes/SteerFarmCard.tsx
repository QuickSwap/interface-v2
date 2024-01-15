import React, { useState } from 'react';
import { Box, useTheme, useMediaQuery, CircularProgress } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { DoubleCurrencyLogo } from 'components';
import Link from 'next/link';
import { formatNumber } from 'utils';
import { ChevronDown, ChevronUp } from 'react-feather';
import SteerFarmCardDetails from './SteerFarmCardDetails';
import TotalAPRTooltip from 'components/TotalAPRToolTip';

const SteerFarmCard: React.FC<{
  data: any;
}> = ({ data }) => {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));

  const rewardA = data.dailyEmissionRewardA
    ? Number(data.dailyEmissionRewardA)
    : 0;
  const rewardB = data.dailyEmissionRewardB
    ? Number(data.dailyEmissionRewardB)
    : 0;

  return (
    <Box
      width='100%'
      borderRadius='16px'
      className={`bg-secondary1${showDetails ? ' border-primary' : ''}`}
    >
      <Box padding={1.5} className='flex items-center'>
        <Box width='90%' className='flex items-center'>
          <Box
            width={isMobile ? (showDetails ? '100%' : '70%') : '30%'}
            className='flex items-center'
          >
            {data.token0 && data.token1 && (
              <>
                <DoubleCurrencyLogo
                  currency0={data.token0}
                  currency1={data.token1}
                  size={30}
                />
                <Box ml='6px'>
                  <Box className='flex items-center flex-wrap' gap='2px'>
                    <small className='weight-600'>{`${data.token0.symbol}/${data.token1.symbol}`}</small>
                    <Box
                      paddingY='1px'
                      paddingX='5px'
                      borderRadius={6}
                      className='text-primaryText bg-gray30'
                    >
                      {formatNumber(Number(data.feeTier) / 10000)}% (F)
                    </Box>
                  </Box>
                  <Box className='cursor-pointer'>
                    <Link
                      href={`/pools?currency0=${data.token0.address}&currency1=${data.token1.address}&feeTier=${data.feeTier}`}
                      target='_blank'
                      className='no-decoration'
                    >
                      <small className='text-primary'>{t('getLP')}↗</small>
                    </Link>
                  </Box>
                </Box>
              </>
            )}
          </Box>
          {!isMobile && (
            <>
              <Box width='20%' className='flex justify-between'>
                {data.loading ? (
                  <CircularProgress size='16px' />
                ) : (
                  <small className='weight-600'>
                    ${formatNumber(data.tvl)}
                  </small>
                )}
              </Box>
              <Box width='30%'>
                {rewardA > 0 && data.rewardTokenADetail && (
                  <div>
                    <small className='small weight-600'>
                      {formatNumber(rewardA)} {data.rewardTokenADetail.symbol} /{' '}
                      {t('day')}
                    </small>
                  </div>
                )}
                {rewardB > 0 && data.rewardTokenBDetail && (
                  <div>
                    <small className='small weight-600'>
                      {formatNumber(rewardB)} {data.rewardTokenBDetail.symbol} /{' '}
                      {t('day')}
                    </small>
                  </div>
                )}
              </Box>
            </>
          )}

          {(!isMobile || !showDetails) && (
            <Box width={isMobile ? '30%' : '20%'} className='flex items-center'>
              {data.loading ? (
                <CircularProgress size='16px' />
              ) : (
                <>
                  <small className='text-success'>
                    {formatNumber(data.farmAPR + data.feeAPR)}%
                  </small>
                  <Box ml={0.5} height={16}>
                    <TotalAPRTooltip
                      farmAPR={data.farmAPR}
                      poolAPR={data.feeAPR}
                      poolAPRText={t('vaultAPR') ?? ''}
                    >
                      <picture>
                        <img
                          src='/assets/images/circleinfo.svg'
                          alt={'arrow up'}
                        />
                      </picture>
                    </TotalAPRTooltip>
                  </Box>
                </>
              )}
            </Box>
          )}
        </Box>

        <Box width='10%' className='flex justify-center'>
          <Box
            className='flex items-center justify-center cursor-pointer text-primary'
            width={20}
            height={20}
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? <ChevronUp /> : <ChevronDown />}
          </Box>
        </Box>
      </Box>
      {showDetails && <SteerFarmCardDetails data={data} />}
    </Box>
  );
};

export default SteerFarmCard;
