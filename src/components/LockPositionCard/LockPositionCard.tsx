import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { ChevronDown, ChevronUp } from 'react-feather';
import { DoubleCurrencyLogo } from 'components';
import LockPositionCardDetails from './LockPositionCardDetails';
import 'components/styles/LockPositionCard.scss';
import { useTranslation } from 'react-i18next';
import { useActiveWeb3React } from 'hooks';
import { LockInterface } from 'state/data/liquidityLocker';

const LockPositionCard: React.FC<{ lock: LockInterface }> = ({ lock }) => {
  const { t } = useTranslation();
  const currency0 = lock.pair;
  const currency1 = lock.token;
  const [showMore, setShowMore] = useState(false);

  return (
    <Box
      className={`lockPositionCard ${
        showMore ? 'bg-secondary2' : 'bg-transparent'
      }`}
    >
      <Box className='lockPositionCardTop'>
        <Box className='flex items-center'>
          {/* <DoubleCurrencyLogo
            currency0={currency0}
            currency1={currency1}
            size={28}
          /> */}
          <p className='weight-600' style={{ marginLeft: 16 }}>
            {!currency0 || !currency1
              ? 'Loading'
              : `${currency0.tokenSymbol}/${currency1.tokenSymbol}`}
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
