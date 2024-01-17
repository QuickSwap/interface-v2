import React from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'next-i18next';
import styles from 'styles/components/WalletModal.module.scss';

interface OptionProps {
  link?: string | null;
  clickable?: boolean;
  size?: number | null;
  onClick?: () => void;
  color: string;
  header: React.ReactNode;
  subheader: React.ReactNode | null;
  icon: string;
  active?: boolean;
  id: string;
  installLink?: string | null;
}

const Option: React.FC<OptionProps> = ({
  link = null,
  onClick,
  header,
  subheader = null,
  icon,
  active = false,
  id,
  installLink = null,
}) => {
  const { t } = useTranslation();
  const content = (
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
  if (link) {
    return (
      <a
        href={link}
        target='_blank'
        rel='noopener noreferrer'
        className={styles.optionLink}
      >
        {content}
      </a>
    );
  }

  if (installLink !== null) {
    return (
      <a
        href={installLink}
        target='_blank'
        rel='noopener noreferrer'
        className={styles.installLink}
      >
        {content}
      </a>
    );
  }

  return content;
};

export default Option;
