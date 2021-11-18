import React from 'react';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useActivePopups } from 'state/application/hooks';
import { useURLWarningVisible } from 'state/user/hooks';
import PopupItem from './PopupItem';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  mobilePopupWrapper: {
    position: 'relative',
    maxWidth: '100%',
    height: (props: any) => props.height,
    margin: (props: any) => (props.height ? '0 auto' : 0),
    marginBottom: (props: any) => (props.height ? '20px' : 0),
    display: 'none',
    [breakpoints.down('xs')]: {
      display: 'block',
    },
  },
  mobilePopupInner: {
    height: '99%',
    overflowX: 'auto',
    overflowY: 'hidden',
    display: 'flex',
    flexDirection: 'row',
    WebkitOverflowScrolling: 'touch',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
  fixedPopupColumn: {
    position: 'fixed',
    top: (props: any) => (props.extraPadding ? '108px' : '88px'),
    right: 40,
    maxWidth: '355px !important',
    width: '100%',
    zIndex: 3,

    [breakpoints.down('xs')]: {
      display: 'none',
    },
  },
}));

export default function Popups() {
  // get all popups
  const activePopups = useActivePopups();
  const urlWarningActive = useURLWarningVisible();
  const classes = useStyles({
    extraPadding: urlWarningActive,
    height: activePopups?.length > 0 ? 'fit-content' : 0,
  });

  return (
    <>
      <Box className={classes.fixedPopupColumn}>
        {activePopups.map((item) => (
          <PopupItem
            key={item.key}
            content={item.content}
            popKey={item.key}
            removeAfterMs={item.removeAfterMs}
          />
        ))}
      </Box>
      <Box className={classes.mobilePopupWrapper}>
        <Box className={classes.mobilePopupInner}>
          {activePopups // reverse so new items up front
            .slice(0)
            .reverse()
            .map((item) => (
              <PopupItem
                key={item.key}
                content={item.content}
                popKey={item.key}
                removeAfterMs={item.removeAfterMs}
              />
            ))}
        </Box>
      </Box>
    </>
  );
}
