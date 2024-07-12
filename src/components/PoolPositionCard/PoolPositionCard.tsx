import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { ChevronDown, ChevronUp } from 'react-feather';
import { Pair } from '@uniswap/sdk';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { DoubleCurrencyLogo } from 'components';
import PoolPositionCardDetails from './PoolPositionCardDetails';
import 'components/styles/PoolPositionCard.scss';
import { useTranslation } from 'react-i18next';

const PoolPositionCard: React.FC<{ pair: Pair }> = ({ pair }) => {
  const { t } = useTranslation();
  const currency0 = unwrappedToken(pair.token0);
  const currency1 = unwrappedToken(pair.token1);

  const [showMore, setShowMore] = useState(false);

  return (
    <Box
      className={`poolPositionCard ${
        showMore ? 'bg-secondary2' : 'bg-transparent'
      }`}
    >
      <Box className='poolPositionCardTop'>
        <Box className='flex items-center'>
          <DoubleCurrencyLogo
            currency0={currency0}
            currency1={currency1}
            size={28}
          />
          <p className='weight-600' style={{ marginLeft: 16 }}>
            {!currency0 || !currency1
              ? 'Loading'
              : `${currency0.symbol}/${currency1.symbol}`}
          </p>
        </Box>

        <Box
          className='flex items-center text-primary cursor-pointer'
          onClick={() => setShowMore(!showMore)}
        >
          <p style={{ marginRight: 8 }}>{t('manage')}</p>
          {showMore ? <ChevronUp size='20' /> : <ChevronDown size='20' />}
        </Box>
      </Box>

      {showMore && <PoolPositionCardDetails pair={pair} />}
    </Box>
  );
};

export default PoolPositionCard;
