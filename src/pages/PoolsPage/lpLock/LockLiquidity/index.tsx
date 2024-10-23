import React, { lazy, useState } from 'react';
import { Box } from '@material-ui/core';
import { QuestionHelper } from 'components';
import { useTranslation } from 'react-i18next';
import ToggleVersion from '../ToggleVersion';
const LockV2LiquidityComponent = lazy(() =>
  import('./components/LockV2Liquidity'),
);
const LockV3LiquidityComponent = lazy(() =>
  import('./components/LockV3Liquidity'),
);

const LockLiquidity: React.FC = () => {
  const { t } = useTranslation();
  const [isV3, setIsV3] = useState(false);

  return (
    <>
      <Box className='flex justify-between items-center'>
        <p className='weight-600'>{t('lockLiquidity')}</p>
        <Box className='flex items-center'>
          <Box className='headingItem'>
            <QuestionHelper
              size={24}
              className='text-secondary'
              text={t('lockLiquidityHelp')}
            />
          </Box>
        </Box>
      </Box>
      <Box mt={2}>
        <ToggleVersion method={setIsV3} checkValue={isV3} />
      </Box>
      <Box mt={2.5}>
        {isV3 ? <LockV3LiquidityComponent /> : <LockV2LiquidityComponent />}
      </Box>
    </>
  );
};

export default LockLiquidity;
