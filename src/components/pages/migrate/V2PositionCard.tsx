import React, { useState } from 'react';
import { Box } from '@mui/material';
import { ChevronDown, ChevronUp } from 'react-feather';
import { Pair } from '@uniswap/sdk';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { DoubleCurrencyLogo } from 'components';
import V2PositionCardDetails from './V2PositionCardDetails';
import { useTranslation } from 'next-i18next';
import styles from 'styles/pages/Migrate.module.scss';

const PoolPositionCard: React.FC<{ pair: Pair }> = ({ pair }) => {
  const { t } = useTranslation();
  const currency0 = unwrappedToken(pair.token0);
  const currency1 = unwrappedToken(pair.token1);

  const [showMore, setShowMore] = useState(false);

  return (
    <Box className={`${styles.migratev2PositionCard} bg-secondary1`}>
      <Box className={styles.migratev2PositionCardTop}>
        <Box className='flex items-center'>
          <DoubleCurrencyLogo
            currency0={currency0}
            currency1={currency1}
            size={24}
          />
          <p className='weight-600' style={{ marginLeft: 6 }}>
            {!currency0 || !currency1
              ? t('loading')
              : `${currency0.symbol}/${currency1.symbol}`}
          </p>
        </Box>

        <Box
          className='flex items-center cursor-pointer text-primary'
          onClick={() => setShowMore(!showMore)}
        >
          {!showMore && <p style={{ marginRight: 8 }}>{t('manage')}</p>}
          {showMore ? <ChevronUp size='20' /> : <ChevronDown size='20' />}
        </Box>
      </Box>

      {showMore && <V2PositionCardDetails pair={pair} />}
    </Box>
  );
};

export default PoolPositionCard;
