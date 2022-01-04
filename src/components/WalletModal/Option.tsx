import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(({ palette }) => ({
  infoCard: {
    backgroundColor: palette.background.paper,
    outline: 'none',
    border: `1px solid ${palette.divider}`,
    borderRadius: 12,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '2rem',
    padding: '1rem',
    '&:focus': {
      boxShadow: `0 0 0 1px ${palette.primary.main}`,
    },
  },
  optionCardClickable: {
    border: `1px solid transparent`,
    background: palette.secondary.dark,
    borderRadius: 10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    padding: '16px 24px',
    marginBottom: 16,
    '&:hover': {
      cursor: 'pointer',
      border: `1px solid ${palette.primary.main}`,
    },
  },
  optionLink: {
    color: palette.text.primary,
  },
}));

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
  const classes = useStyles();
  const content = (
    <Box className={classes.optionCardClickable} id={id} onClick={onClick}>
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
        rel='noreferrer'
        className={classes.optionLink}
      >
        {content}
      </a>
    );
  }

  return content;
};

export default Option;
