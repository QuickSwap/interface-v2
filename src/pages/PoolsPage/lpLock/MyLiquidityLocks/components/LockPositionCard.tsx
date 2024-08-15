import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { ChevronDown, ChevronUp } from 'react-feather';
import { DoubleCurrencyLogo } from 'components';
import LockPositionCardDetails from './LockPositionCardDetails';
import 'components/styles/LockPositionCard.scss';
import { useTranslation } from 'react-i18next';
import { LockInterface } from 'state/data/liquidityLocker';
import { useCurrency } from 'hooks/v3/Tokens';

const LockPositionCard: React.FC<{ lock: LockInterface }> = ({ lock }) => {
  const { t } = useTranslation();
  const currency0 = useCurrency((lock?.liquidityContract ?? lock.token).token0);
  const currency1 = useCurrency((lock?.liquidityContract ?? lock.token).token1);
  const [showMore, setShowMore] = useState(false);

  return (
    <Box
      className={`lockPositionCard ${
        showMore ? 'bg-secondary2' : 'bg-transparent'
      }`}
    >
      <Box className='lockPositionCardTop'>
        <Box className='flex items-center'>
          <DoubleCurrencyLogo
            currency0={currency0 ?? undefined}
            currency1={currency1 ?? undefined}
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

      {showMore && <LockPositionCardDetails lock={lock} />}
    </Box>
  );
};

export default LockPositionCard;
