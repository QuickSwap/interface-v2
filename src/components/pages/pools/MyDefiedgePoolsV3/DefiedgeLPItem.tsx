import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { DoubleCurrencyLogo } from 'components';
import styles from 'styles/pages/pools/AutomaticLPItem.module.scss';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import DefiedgeLPItemDetails from './DefiedgeLPItemDetails';
import { ArrowRight } from 'react-feather';
import { useRouter } from 'next/router';

const DefiedgeLPItem: React.FC<{ defiedgePosition: any }> = ({
  defiedgePosition,
}) => {
  const { t } = useTranslation();

  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const farmingLink = `/farm/v3?tab=my-farms`;

  return (
    <Box className={styles.liquidityItem}>
      <Box className='flex items-center justify-between'>
        <Box className='flex items-center'>
          {defiedgePosition.token0 && defiedgePosition.token1 && (
            <>
              <Box className='flex' mr='8px'>
                <DoubleCurrencyLogo
                  currency0={defiedgePosition.token0}
                  currency1={defiedgePosition.token1}
                  size={24}
                />
              </Box>
              <p className='weight-600'>
                {defiedgePosition.token0.symbol}/
                {defiedgePosition.token1.symbol}
              </p>
            </>
          )}

          {defiedgePosition && defiedgePosition.farming && (
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
      {expanded && defiedgePosition && (
        <Box mt={2}>
          <DefiedgeLPItemDetails defiedgePosition={defiedgePosition} />
        </Box>
      )}
    </Box>
  );
};

export default DefiedgeLPItem;
