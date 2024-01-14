import React, { useState } from 'react';
import ZapSlippage from '../ZapSlippage';
import { useTranslation } from 'next-i18next';
import { Box } from '@mui/material';
import { QuestionHelper, ToggleSwitch } from 'components';
import { Settings } from '@mui/icons-material';

interface ZapSwitchProps {
  handleZapSwitch: () => void;
  goZap: boolean;
}

const ZapSwitch: React.FC<ZapSwitchProps> = ({ handleZapSwitch, goZap }) => {
  const { t } = useTranslation();

  const [openSettings, setOpenSettings] = useState(false);

  return (
    <Box>
      {openSettings && (
        <ZapSlippage
          open={openSettings}
          onClose={() => setOpenSettings(false)}
        />
      )}
      <Box>
        <Box>
          <img src='/assets/images/bonds/ZapIcon.svg' />
        </Box>
        <p>{t('ZAP')}</p>
        <Box sx={{ width: '50px' }}>
          <ToggleSwitch toggled={goZap} onToggle={handleZapSwitch} />
        </Box>
        <QuestionHelper
          text={t(
            'Zap enables you to convert a single token into an LP token in one transaction. Disable Zap to add liquidity with two tokens.',
          )}
        />
      </Box>
      <Box className='cursor-pointer' onClick={() => setOpenSettings(true)}>
        <Settings />
      </Box>
    </Box>
  );
};

export default React.memo(ZapSwitch);
