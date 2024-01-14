import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { DoubleCurrencyLogo } from 'components';
import { unipilotVaultTypes } from 'constants/index';
import styles from 'styles/pages/pools/AutomaticLPItem.module.scss';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import UnipilotLPItemDetails from './UnipilotLPItemDetails';
import { ArrowRight } from 'react-feather';
import { useRouter } from 'next/router';
import { UnipilotPosition } from 'hooks/v3/useV3Positions';

const UnipilotLPItem: React.FC<{ position: UnipilotPosition }> = ({
  position,
}) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const farmingLink = `/farm/v3?tab=my-farms`;
  const { token0, token1 } = position;

  return (
    <Box className={styles.liquidityItem}>
      <Box className='flex items-center justify-between'>
        <Box className='flex items-center'>
          {token0 && token1 && (
            <>
              <Box className='flex' mr='8px'>
                <DoubleCurrencyLogo
                  currency0={token0}
                  currency1={token1}
                  size={24}
                />
              </Box>
              <p className='weight-600'>
                {token0.symbol}/{token1.symbol}
              </p>
            </>
          )}
          <Box ml={1.5} className={styles.liquidityRange}>
            <small>{unipilotVaultTypes[position.strategyId - 1]}</small>
          </Box>
          {position && position.farming && (
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
          <UnipilotLPItemDetails position={position} />
        </Box>
      )}
    </Box>
  );
};

export default UnipilotLPItem;
