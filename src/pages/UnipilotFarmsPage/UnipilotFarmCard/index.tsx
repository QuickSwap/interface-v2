import React, { useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Token } from '@uniswap/sdk';
import { DoubleCurrencyLogo } from 'components';
import { Link } from 'react-router-dom';
import { formatNumber } from 'utils';
import { ChevronDown, ChevronUp } from 'react-feather';
import UnipilotFarmCardDetails from '../UnipilotFarmCardDetails';
import CircleInfoIcon from 'assets/images/circleinfo.svg';
import TotalAPRTooltip from 'components/TotalAPRToolTip';
import { formatUnits } from 'ethers/lib/utils';

const UnipilotFarmCard: React.FC<{
  data: any;
  token0: Token | null;
  token1: Token | null;
}> = ({ data, token0, token1 }) => {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));

  const rewardA = Number(
    formatUnits(data.totalRewardPaidA, data.rewardTokenA.decimals),
  );
  const rewardB = Number(
    formatUnits(data.totalRewardPaidB, data.rewardTokenB.decimals),
  );

  return (
    <Box
      width='100%'
      borderRadius={16}
      className={`bg-secondary1${showDetails ? ' border-primary' : ''}`}
    >
      <Box padding={1.5} className='flex items-center'>
        <Box width='90%' className='flex items-center'>
          <Box
            width={isMobile ? (showDetails ? '100%' : '70%') : '30%'}
            className='flex items-center'
          >
            {token0 && token1 && (
              <>
                <DoubleCurrencyLogo
                  currency0={token0}
                  currency1={token1}
                  size={30}
                />
                <Box ml='6px'>
                  {/* <small className='weight-600'>{`${token0.symbol}/${token1.symbol} (${pairData.title})`}</small> */}
                  <Box className='cursor-pointer'>
                    <Link
                      to={`/pools?currency0=${token0.address}&currency1=${token1.address}`}
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
                {/* {rewardData && (
                  <small className='weight-600'>
                    ${formatNumber(rewardData['stakedAmountUSD'])}
                  </small>
                )} */}
              </Box>
              <Box width='30%'>
                {rewardA > 0 && (
                  <div>
                    <small className='small weight-600'>
                      {formatNumber(rewardA * 3600 * 24)}{' '}
                      {data.rewardTokenA.symbol} / {t('day')}
                    </small>
                  </div>
                )}
                {rewardB > 0 && (
                  <div>
                    <small className='small weight-600'>
                      {formatNumber(rewardB * 3600 * 24)}{' '}
                      {data.rewardTokenB.symbol} / {t('day')}
                    </small>
                  </div>
                )}
              </Box>
            </>
          )}

          {/* {(!isMobile || !showDetails) && (
            <Box width={isMobile ? '30%' : '20%'} className='flex items-center'>
              <small className='text-success'>
                {formatNumber((poolAPR + farmAPR) * 100)}%
              </small>
              <Box ml={0.5} height={16}>
                <TotalAPRTooltip
                  farmAPR={farmAPR * 100}
                  poolAPR={poolAPR * 100}
                >
                  <img src={CircleInfoIcon} alt={'arrow up'} />
                </TotalAPRTooltip>
              </Box>
            </Box>
          )} */}
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
      {showDetails && <UnipilotFarmCardDetails data={data} />}
    </Box>
  );
};

export default UnipilotFarmCard;
