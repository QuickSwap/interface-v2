import React, { lazy, useState } from 'react';
import { Box } from 'theme/components';
import { ReactComponent as SettingsIcon } from 'assets/images/SettingsIcon.svg';
import { QuestionHelper, SettingsModal } from 'components';
import { useTranslation } from 'react-i18next';
const AddLiquidity = lazy(() => import('components/AddLiquidity'));

const SupplyLiquidity: React.FC = () => {
  const { t } = useTranslation();
  const [openSettingsModal, setOpenSettingsModal] = useState(false);

  return (
    <>
      {openSettingsModal && (
        <SettingsModal
          open={openSettingsModal}
          onClose={() => setOpenSettingsModal(false)}
        />
      )}
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
      <Box margin='20px 0 0'>
        <AddLiquidity />
      </Box>
    </>
  );
};

export default SupplyLiquidity;
