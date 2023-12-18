import React, { useState } from 'react';
import ZapSlippage from '../ZapSlippage';
import { useTranslation } from 'react-i18next';
import { Box } from '@material-ui/core';
import { QuestionHelper, ToggleSwitch } from 'components';
import { ReactComponent as ZapIcon } from 'assets/images/bonds/ZapIcon.svg';
import { ReactComponent as SettingsIcon } from 'assets/images/SettingsIcon.svg';

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
          <ZapIcon />
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
        <SettingsIcon />
      </Box>
    </Box>
  );
};

export default React.memo(ZapSwitch);
