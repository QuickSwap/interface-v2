import React from 'react';
import { useTranslation } from 'react-i18next';

import { Box } from '@material-ui/core';

export const HistoricalTable: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Box width='100%' mb={3}>
      <h6>{t('ethHistoricalTableHeading')}</h6>
    </Box>
  );
};
