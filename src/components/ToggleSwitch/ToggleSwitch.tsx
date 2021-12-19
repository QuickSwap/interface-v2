import React from 'react';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(({ palette }) => ({
  wrapper: {
    width: 40,
    height: 20,
    position: 'relative',
    borderRadius: 10,
    border: (props: any) =>
      props.toggled
        ? '1px solid transparent'
        : `1px solid ${palette.text.disabled}`,
  },
  innerCircle: {
    width: 14,
    height: 14,
    borderRadius: 8,
    backgroundColor: (props: any) =>
      props.toggled ? palette.success.main : palette.text.disabled,
    position: 'absolute',
    top: 2,
  },
}));

const ToggleSwitch: React.FC<{ toggled: boolean; onToggle: () => void }> = ({
  toggled,
  onToggle,
}) => {
  const classes = useStyles({ toggled });
  return (
    <Box
      className={classes.wrapper}
      bgcolor={toggled ? 'rgba(15, 198, 121, 0.2)' : 'transparent'}
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
