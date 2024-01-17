import React from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { WalletOptionProps } from './WalletOptionProps';
import styles from 'styles/components/WalletModal.module.scss';

const BarOptionContent: React.FC<WalletOptionProps> = ({
  onClick,
  header,
  subheader = null,
  icon,
  active = false,
  id,
  installLink = null,
}) => {
  const { t } = useTranslation();
  return (
    <Box className={styles.optionCardClickable} id={id} onClick={onClick}>
      <Box className='flex items-center' my={0.5}>
        <picture>
          <img src={icon} alt={'Icon'} width={24} />
        </picture>
        <p style={{ marginLeft: 8 }}>{header}</p>
      </Box>
      {active && (
        <Box className='flex items-center'>
          <Box className={styles.optionConnectedDot} />
          <small>{t('connected')}</small>
        </Box>
      )}
      {!active && installLink && (
        <Box className='flex items-center'>
          <small className={styles.installBtn}>{t('install')}</small>
        </Box>
      )}
      {subheader && (
        <Box my={0.5} width={1}>
          <span>{subheader}</span>
        </Box>
      )}
    </Box>
  );
};

export default BarOptionContent;
