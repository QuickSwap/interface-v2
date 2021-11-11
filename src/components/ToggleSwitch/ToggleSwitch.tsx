import React from 'react';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  wrapper: {
    width: 40,
    height: 20,
    position: 'relative',
    borderRadius: 10
  },
  innerCircle: {
    width: 14,
    height: 14,
    borderRadius: 8,
    backgroundColor: '#07432a',
    position: 'absolute',
    top: 3,
  }
}));

const ToggleSwitch: React.FC<{ toggled: boolean, onToggle: () => void }> = ({ toggled, onToggle }) => {
  const classes = useStyles();
  return (
    <Box className={classes.wrapper} bgcolor={toggled ? '#0fc679' : '#ddd'} onClick={onToggle}>
      <Box className={classes.innerCircle} left={toggled ? 'unset' : '3px'} right={toggled ? '3px' : 'unset'} />
    </Box>
  )
}

export default ToggleSwitch;
