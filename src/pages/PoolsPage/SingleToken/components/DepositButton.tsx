import { Box, Button } from '@material-ui/core';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useSingleTokenCurrency,
  useSingleTokenVault,
} from 'state/singleToken/hooks';

const SingleTokenDepositButton: React.FC = () => {
  const { t } = useTranslation();
  const currency = useSingleTokenCurrency();
  const { selectedVault } = useSingleTokenVault();
  const buttonText = useMemo(() => {
    if (!currency) return t('selectToken');
    if (!selectedVault) return t('selectPool');
    return t('deposit');
  }, [currency, selectedVault, t]);

  return <Button className='singleTokenDepositButton'>{buttonText}</Button>;
};

export default SingleTokenDepositButton;
