import React, { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@material-ui/core';
import { DoubleCurrencyLogo } from 'components';
import { formatNumber, getTokenFromAddress } from 'utils';
import APRHover from 'assets/images/aprHover.png';
import QuickSwapLogo from 'assets/images/quickLogo.png';
import DefiedgeLogo from 'assets/images/defiedge.png';
import GammaLogo from 'assets/images/gammaLogo.png';
import IchiLogo from 'assets/images/ichi_logo.png';
import SteerLogo from 'assets/images/SteerLogo.png';
import { useTranslation } from 'react-i18next';
import TotalAPRTooltip from 'components/TotalAPRToolTip';
import { useActiveWeb3React } from 'hooks';
import { useSelectedTokenList } from 'state/lists/hooks';
import { MerklPairFarmCardDetails } from './MerklPairFarmCardDetails';
import { KeyboardArrowDown, KeyboardArrowUp } from '@material-ui/icons';

interface Props {
  farm: any;
}

export const MerklPairFarmCard: React.FC<Props> = ({ farm }) => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const farmType = farm.label.split(' ')[0];
  let poolIcon;
  switch (farmType) {
    case 'Gamma':
      poolIcon = (
        <img src={GammaLogo} alt='Gamma Logo' style={{ height: 10 }} />
      );
      break;
    case 'DefiEdge':
      poolIcon = (
        <img
          src={DefiedgeLogo}
          alt='Defiedge Logo'
          style={{ height: 36, marginLeft: '-10px' }}
        />
      );
      break;
    case 'Ichi':
      poolIcon = <img src={IchiLogo} alt='ICHI Logo' style={{ height: 18 }} />;
      break;
    case 'Steer':
      poolIcon = (
        <img src={SteerLogo} alt='SteerProtocal Logo' style={{ height: 15 }} />
      );
      break;
    default:
      poolIcon = (
        <img src={QuickSwapLogo} alt='QuickSwap Logo' style={{ height: 32 }} />
      );
      break;
  }

  const tokenMap = useSelectedTokenList();
  const token0 = getTokenFromAddress(farm.token0, chainId, tokenMap, []);
  const token1 = getTokenFromAddress(farm.token1, chainId, tokenMap, []);

  const [expanded, setExpanded] = useState(false);
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('sm'));

  return (
    <Box
      width='100%'
      borderRadius={16}
      className={`bg-secondary1 ${
        expanded ? 'border-primary' : 'border-secondary1'
      }`}
    >
      <Box
        padding={2}
        className='flex cursor-pointer'
        width='100%'
        onClick={() => setExpanded(!expanded)}
      >
        <Box
          className='flex items-center'
          width={isMobile ? '90%' : '30%'}
          gridGap={8}
        >
          <DoubleCurrencyLogo size={24} currency0={token0} currency1={token1} />
          <Box>
            <Box className='flex items-center' gridGap={5}>
              <small>
                {token0?.symbol}/{token1?.symbol}
              </small>
              {farm.title && (
                <Box
                  className={`farmAPRTitleWrapper ${
                    farm.title.toLowerCase() === 'narrow'
                      ? 'bg-purple8'
                      : farm.title.toLowerCase() === 'wide'
                      ? 'bg-blue12'
                      : farm.title.toLowerCase() === 'stable'
                      ? 'bg-green4'
                      : 'bg-gray32'
                  }`}
                >
                  <span className='text-bgColor'>{farm.title}</span>
                </Box>
              )}
              {!!farm?.poolFee && (
                <Box className='farmAPRTitleWrapper bg-textSecondary'>
                  <span className='text-gray32'>{farm.poolFee}%</span>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
        {!isMobile && (
          <>
            <Box width='20%'>
              <p className='small text-secondary'>{t('poolManager')}</p>
              {poolIcon}
            </Box>
            <Box width='20%'>
              <p className='small text-secondary'>{t('tvl')}</p>
              <p className='small'>${formatNumber(farm.almTVL)}</p>
            </Box>
            <Box width='20%'>
              <p className='small text-secondary'>{t('totalAPR')}</p>
              <Box className='flex items-center' gridGap={4}>
                <p className='small text-success'>
                  {formatNumber(farm.poolAPR + farm.almAPR)}%
                </p>
                <TotalAPRTooltip farmAPR={farm.almAPR} poolAPR={farm.poolAPR}>
                  <img src={APRHover} alt='farm APR' className='farmAprIcon' />
                </TotalAPRTooltip>
              </Box>
            </Box>
          </>
        )}
        <Box width='10%' className='flex items-center justify-end'>
          {expanded ? (
            <KeyboardArrowUp className='text-primary' />
          ) : (
            <KeyboardArrowDown />
          )}
        </Box>
      </Box>
      {expanded && (
        <MerklPairFarmCardDetails
          farm={{
            ...farm,
            token0,
            token1,
          }}
        />
      )}
    </Box>
  );
};

export default MerklPairFarmCard;
