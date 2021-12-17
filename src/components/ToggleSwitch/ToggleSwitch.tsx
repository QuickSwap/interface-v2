import React from 'react';
import { Box } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';

const useStyles = makeStyles(({ palette }) => ({
  wrapper: {
    width: 40,
    height: 20,
    position: 'relative',
    borderRadius: 10,
    border: `1px solid ${palette.secondary.dark}`,
  },
  innerCircle: {
    width: 14,
    height: 14,
    borderRadius: 8,
    backgroundColor: palette.text.secondary,
    position: 'absolute',
    top: 2,
  },
}));

const ToggleSwitch: React.FC<{ toggled: boolean; onToggle: () => void }> = ({
  toggled,
  onToggle,
}) => {
  const classes = useStyles();
  const { palette } = useTheme();
  return (
    <Box
      className={classes.wrapper}
      bgcolor={toggled ? palette.secondary.dark : 'transparent'}
      onClick={onToggle}
    >
      <Box
        className={classes.innerCircle}
        left={toggled ? 'unset' : '2px'}
        right={toggled ? '2px' : 'unset'}
      />
    </Box>
  );
};

export default ToggleSwitch;
