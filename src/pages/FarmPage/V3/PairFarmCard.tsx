import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { DoubleCurrencyLogo } from 'components';
import { formatNumber, getTokenFromAddress } from 'utils';
import APRHover from 'assets/images/aprHover.png';
import { useTranslation } from 'react-i18next';
import TotalAPRTooltip from 'components/TotalAPRToolTip';
import { useActiveWeb3React } from 'hooks';
import { useSelectedTokenList } from 'state/lists/hooks';
import { V3PairFarmCardDetails } from './PairFarmCardDetails';
import { toV3Token } from 'constants/v3/addresses';

interface Props {
  farm: any;
}

export const V3PairFarmCard: React.FC<Props> = ({ farm }) => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const farmType = farm.label.split(' ')[0];

  const tokenMap = useSelectedTokenList();
  const token0 = getTokenFromAddress(farm.token0, chainId, tokenMap, []);
  const token1 = getTokenFromAddress(farm.token1, chainId, tokenMap, []);

  const [expanded, setExpanded] = useState(false);

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
        <Box className='flex items-center' width='38%' gridGap={8}>
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
              <Box className='farmAPRTitleWrapper bg-textSecondary'>
                <span className='text-gray32'>{farmType.toUpperCase()}</span>
              </Box>
            </Box>
          </Box>
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
            <TotalAPRTooltip
              farmAPR={farm.almAPR ?? 0}
              poolAPR={farm.poolAPR ?? 0}
            >
              <img src={APRHover} alt='farm APR' height={16} />
            </TotalAPRTooltip>
          </Box>
        </Box>
      </Box>
      {expanded && (
        <V3PairFarmCardDetails
          farm={{
            ...farm,
            token0: token0 ? toV3Token(token0) : undefined,
            token1: token1 ? toV3Token(token1) : undefined,
          }}
        />
      )}
    </Box>
  );
};

export default V3PairFarmCard;
