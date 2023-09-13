import React from 'react';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { WalletOptionProps } from './WalletOptionProps';

const IconifyOption: React.FC<WalletOptionProps> = ({
  header,
  icon,
  active,
  id,
  onClick,
}) => {
  const { t } = useTranslation();

  return (
    <Box
      id={id}
      onClick={onClick}
      className='flex items-center flex-col optionCardIconfiy'
    >
      <Box className='optionIconContainer'>
        <img className='m-auto' src={icon} alt={'Icon'} width={48} />
      </Box>
      <Box className='optionHeader' mt={0.5}>
        {header}
      </Box>
      {active && (
        <Box className='flex items-center'>
          <Box className='optionConnectedDot' />
          <small>{t('connected')}</small>
        </Box>
      )}
    </Box>
  );
};

export default IconifyOption;
