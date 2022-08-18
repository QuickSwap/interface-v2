import React, { lazy, useCallback, useState } from 'react';
import { Box } from '@material-ui/core';
import { ReactComponent as SettingsIcon } from 'assets/images/SettingsIcon.svg';
import { QuestionHelper, SettingsModal } from 'components';
import { useTranslation } from 'react-i18next';
import { NewAddLiquidityPage } from 'components/v3/NewAddLiquidity';
const AddLiquidity = lazy(() => import('components/AddLiquidity'));
const AddLiquidityV3 = lazy(() => import('components/AddLiquidityV3'));

const SupplyLiquidity: React.FC<{ isV3: boolean }> = ({ isV3 }) => {
  const { t } = useTranslation();
  const [openSettingsModal, setOpenSettingsModal] = useState(false);

  const handleSettingsModalOpen = useCallback(
    (flag: boolean) => {
      setOpenSettingsModal(flag);
    },
    [openSettingsModal, setOpenSettingsModal],
  );

  return (
    <>
      {openSettingsModal && (
        <SettingsModal
          open={openSettingsModal}
          onClose={() => setOpenSettingsModal(false)}
        />
      )}
      {!isV3 && (
        <>
          {' '}
          <Box className='flex justify-between items-center'>
            <p className='weight-600'>{t('supplyLiquidity')}</p>
            <Box className='flex items-center'>
              <Box className='headingItem'>
                <QuestionHelper
                  size={24}
                  className='text-secondary'
                  text={t('supplyLiquidityHelp')}
                />
              </Box>
              <Box className='headingItem'>
                <SettingsIcon onClick={() => setOpenSettingsModal(true)} />
              </Box>
            </Box>
          </Box>
          <Box mt={2.5}>
            <AddLiquidity />
          </Box>
        </>
      )}
      {/* {isV3 && <AddLiquidityV3 />} */}
      {isV3 && <NewAddLiquidityPage />}
    </>
  );
};

export default SupplyLiquidity;
