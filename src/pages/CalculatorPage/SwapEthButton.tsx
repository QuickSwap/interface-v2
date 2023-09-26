import React from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Button } from '@material-ui/core';

export const SwapEthButton: React.FC = () => {
  const { t } = useTranslation();
  return (
    <a
      className='btn-swap'
      href={
        '/#/swap?currency0=0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619&currency1=0xc2132D05D31c914a87C6611C10748AEb04B58e8F&swapIndex=0'
      }
      rel='noreferrer'
    >
      {t('swapEthButton')}
    </a>
  );
};
