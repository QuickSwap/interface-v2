import React from 'react';
import { Box, Typography } from '@material-ui/core';

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
}

const Option: React.FC<OptionProps> = ({
  link = null,
  onClick,
  header,
  subheader = null,
  icon,
  active = false,
  id,
}) => {
  const content = (
    <Box className='optionCardClickable' id={id} onClick={onClick}>
      <Box display='flex' alignItems='center' my={0.5}>
        <img src={icon} alt={'Icon'} width={24} />
        <Typography variant='body1' style={{ marginLeft: 8 }}>
          {header}
        </Typography>
      </Box>
      {active && (
        <Box display='flex' alignItems='center'>
          <Box
            width={10}
            height={10}
            borderRadius={10}
            mr={1}
            bgcolor='#11eea7'
          />
          <Typography variant='body2'>Connected</Typography>
        </Box>
      )}
      {subheader && (
        <Box my={0.5} width={1}>
          <Typography variant='caption'>{subheader}</Typography>
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

  return content;
};

export default Option;
