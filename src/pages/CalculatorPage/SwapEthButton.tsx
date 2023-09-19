import React from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Button } from '@material-ui/core';

export const SwapEthButton: React.FC = () => {
  const { t } = useTranslation();
  return <Button>{t('swapEthButton')}</Button>;
};
