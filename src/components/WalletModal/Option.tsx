import React from 'react';
import { Box } from 'theme/components';
import { useTranslation } from 'react-i18next';

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
    <Box className='optionCardClickable' id={id} onClick={onClick}>
      <Box className='flex items-center' margin='4px 0'>
        <img src={icon} alt={'Icon'} width={24} />
        <p style={{ marginLeft: 8 }}>{header}</p>
      </Box>
      {active && (
        <Box className='flex items-center'>
          <Box className='optionConnectedDot' />
          <small>{t('connected')}</small>
        </Box>
      )}
      {!active && installLink && (
        <Box className='flex items-center'>
          <small className='installBtn'>{t('install')}</small>
        </Box>
      )}
      {subheader && (
        <Box margin='4px 0' width='100%'>
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
        className='optionLink'
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
        className='installLink'
      >
        {content}
      </a>
    );
  }

  return content;
};

export default Option;
