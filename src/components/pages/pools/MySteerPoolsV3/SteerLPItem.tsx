import React, { useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { DoubleCurrencyLogo } from 'components';
import styles from 'styles/pages/pools/AutomaticLPItem.module.scss';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import SteerLPItemDetails from './SteerLPItemDetails';
import { useActiveWeb3React } from 'hooks';
import { ArrowRight } from 'react-feather';
import { useRouter } from 'next/router';
import { calculatePositionWidth, percentageToMultiplier } from 'utils';
import { SteerVault, useSteerStakedPools } from 'hooks/v3/useSteerData';

const SteerLPItem: React.FC<{ position: SteerVault }> = ({ position }) => {
  const { t } = useTranslation();
  const { chainId, account } = useActiveWeb3React();
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const farmingLink = `/farm/v3?tab=my-farms`;

  const minTick = Number(position.lowerTick ?? 0);
  const maxTick = Number(position.upperTick ?? 0);
  const currentTick = Number(position.tick ?? 0);
  const positionWidthPercent = calculatePositionWidth(
    currentTick,
    minTick,
    maxTick,
  );
  const strategy =
    position &&
    position.strategy &&
    position.strategy.strategyConfigData &&
    position.strategy.strategyConfigData.name &&
    position.strategy.strategyConfigData.name.toLowerCase().includes('stable')
      ? 'Stable'
      : percentageToMultiplier(positionWidthPercent) > 1.2
      ? 'Wide'
      : 'Narrow';

  const { data: steerFarms } = useSteerStakedPools(chainId, account);
  const farm = useMemo(() => {
    if (!steerFarms) return;
    const farm = steerFarms.find(
      (farm: any) =>
        farm.stakingToken.toLowerCase() === position.address.toLowerCase(),
    );
    return farm;
  }, [position.address, steerFarms]);

  return (
    <Box className={styles.liquidityItem}>
      <Box className='flex items-center justify-between'>
        <Box className='flex items-center'>
          <Box className='flex' mr='8px'>
            <DoubleCurrencyLogo
              currency0={position.token0}
              currency1={position.token1}
              size={24}
            />
          </Box>
          <p className='weight-600'>
            {position.token0?.symbol}/{position.token1?.symbol}
          </p>
          <Box ml={1.5} className={styles.liquidityRange}>
            <small>{strategy}</small>
          </Box>
          {farm && farm.stakedAmount > 0 && (
            <Box
              className='flex items-center bg-primary cursor-pointer'
              padding='0 5px'
              height='22px'
              borderRadius='11px'
              ml={1}
              my={0.5}
              color='white'
              onClick={() => router.push(farmingLink)}
            >
              <p className='span'>{t('farming')}</p>
              <Box className='flex' ml='3px'>
                <ArrowRight size={12} />
              </Box>
            </Box>
          )}
        </Box>

        <Box
          className={`${styles.liquidityItemExpand} ${
            expanded ? 'text-primary' : ''
          }`}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </Box>
      </Box>
      {expanded && position && (
        <Box mt={2}>
          <SteerLPItemDetails position={position} />
        </Box>
      )}
    </Box>
  );
};

export default SteerLPItem;
