import React from 'react';
import { Box } from '@material-ui/core';
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
  optionCardLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  optionCardClickable: {
    marginTop: 0,
    border: `1px solid ${palette.divider}`,
    borderRadius: 12,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    '&:hover': {
      cursor: 'pointer',
      border: `1px solid ${palette.primary.main}`,
    },
  },
  greenCircle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    '&:first-child': {
      height: 8,
      width: 8,
      marginRight: 8,
      backgroundColor: palette.success.main,
      borderRadius: '50%',
    },
  },
  circleWrapper: {
    color: palette.success.main,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    display: 'flex',
    color: palette.primary.main,
    fontSize: '1rem',
    fontWeight: 500,
  },
  subHeader: {
    color: palette.text.primary,
    marginTop: 10,
    fontSize: 12,
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& > img, & > span': {
      height: 24,
      width: 24,
    },
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
  clickable = true,
  size,
  onClick,
  color,
  header,
  subheader = null,
  icon,
  active = false,
  id,
}) => {
  const classes = useStyles();
  const content = (
    <Box className={classes.optionCardClickable} id={id} onClick={onClick}>
      <Box className={classes.optionCardLeft}>
        <Box className={classes.headerText}>
          {active ? (
            <Box className={classes.circleWrapper}>
              <Box className={classes.greenCircle}>
                <div />
              </Box>
            </Box>
          ) : (
            ''
          )}
          {header}
        </Box>
        {subheader && <Box className={classes.subHeader}>{subheader}</Box>}
      </Box>
      <Box className={classes.iconWrapper}>
        <img src={icon} alt={'Icon'} />
      </Box>
    </Box>
  );
  if (link) {
    return (
      <a href={link} target='_blank' rel='noreferrer'>
        {content}
      </a>
    );
  }

  return content;
};

export default Option;
