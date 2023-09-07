import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button } from '@material-ui/core';

interface BondItemProps {
  bond: any;
}

const BondItem: React.FC<BondItemProps> = ({ bond }) => {
  const { t } = useTranslation();

  const {
    earnToken,
    token,
    quoteToken,
    maxTotalPayOut,
    totalPayoutGiven,
    earnTokenPrice,
    discount,
  } = bond;

  const token1 = token;
  const token2 = bond.billType === 'reserve' ? earnToken : quoteToken;
  const token3 = earnToken;
  const stakeLP = bond.billType !== 'reserve';

  return (
    <Box mb={2} className='bondItemWrapper'>
      <Button>{t('buy')}</Button>
    </Box>
  );
};

export default BondItem;
