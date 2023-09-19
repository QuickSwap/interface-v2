import React from 'react';
import { useTranslation } from 'react-i18next';

import { Box } from '@material-ui/core';

export const Graph: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Box width='100%' mb={3}>
      <h1 className='h4'>{t('howMuchETH')}</h1>
    </Box>
  );
};
