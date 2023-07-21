import React, { useState } from 'react';
import { Box } from '@mui/material';
import { Settings } from '@mui/icons-material';
import { QuestionHelper, SettingsModal } from 'components';
import { useTranslation } from 'next-i18next';
import AddLiquidity from 'components/AddLiquidity';
import styles from 'styles/pages/Pools.module.scss';

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
      <Box className='flex items-center justify-between'>
        <p className='weight-600'>{t('supplyLiquidity')}</p>
        <Box className='flex items-center'>
          <Box className={styles.headingItem}>
            <QuestionHelper
              size={24}
              className='text-secondary'
              text={t('supplyLiquidityHelp')}
            />
          </Box>
          <Box ml={1} className={`${styles.headingItem} text-secondary`}>
            <Settings onClick={() => setOpenSettingsModal(true)} />
          </Box>
        </Box>
      </Box>
      <Box mt={2.5}>
        <AddLiquidity />
      </Box>
    </>
  );
};

export default SupplyLiquidity;
