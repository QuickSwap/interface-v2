import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';
import { useIsDarkMode } from 'state/user/hooks';

const useStylesBootstrap = makeStyles(({ palette }) => ({
  arrow: {
    fontSize: 16,
    width: 17,
    '&::before': {
      color: (props: any) =>
        props.dark ? palette.secondary.dark : 'rgba(255, 255, 255, 0.9)',
      border: `1px solid ${palette.divider}`,
      boxSizing: 'border-box',
    },
  },
  tooltip: {
    backgroundColor: (props: any) =>
      props.dark ? palette.secondary.dark : 'rgba(255, 255, 255, 0.9)',
    border: `1px solid ${palette.divider}`,
    padding: '14px',
    fontSize: '14px',
    borderRadius: '14px',
    color: palette.text.primary,
  },
}));

const CustomTooltip: React.FC<TooltipProps> = (props: TooltipProps) => {
  const dark = useIsDarkMode();
  const classes = useStylesBootstrap({ dark });
  return <Tooltip arrow classes={classes} {...props} />;
};

export default CustomTooltip;
