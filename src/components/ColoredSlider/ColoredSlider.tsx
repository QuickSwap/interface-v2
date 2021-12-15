import { withStyles, Theme } from '@material-ui/core/styles';

import { Slider } from '@material-ui/core';

const ColoredSlider = withStyles((theme: Theme) => ({
  root: {
    color: '#5294FF',
    height: 2,
    width: 'calc(100% - 16px)',
    padding: '13px 0',

    '& .MuiSlider-mark': {
      width: 4,
      height: '4px !important',
      bottom: 15,
      borderRadius: 4,
      backgroundColor: 'white',
      '&:hover': {
        '&::after': {
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          height: '30px',
          width: '82px',
          borderRadius: '14px',
          bottom: '14px',
          color: theme.palette.text.primary,
          fontFamily: 'DM Sans',
          content: '"Cheaper gas"',
          display: 'flex',
          alignItems: 'center',
          marginLeft: '-50px',
          padding: '0.3em 1em',
          position: 'absolute',
          zIndex: 98,
        },
        '&::before': {
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          height: '12px',
          width: '12px',
          bottom: '8px',
          borderBottom: 'transparent',
          borderLeft: 'transparent',
          color: theme.palette.text.primary,
          fontFamily: 'DM Sans',
          content: '""',
          display: 'flex',
          alignItems: 'center',
          marginLeft: '-4px',
          position: 'absolute',
          boxSizing: 'border-box',
          '-webkit-transform': 'rotate(135deg)',
          transform: 'rotate(135deg)',
          zIndex: 99,
        },
      },
    },
  },

  mark: {
    height: 8,
    backgroundColor: '#B4C2D5',
  },

  thumb: {
    height: 20,
    width: 20,
    backgroundColor: theme.palette.primary.main,
    marginTop: -9,
    marginLeft: 0,
    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.15)',

    '&:focus, &:hover, &$active': {
      boxShadow: 'inherit',
    },
  },

  valueLabel: {
    left: 'calc(-50% - 8px)',
    top: -18,
    fontSize: 12,
    '& > span': {
      color: 'transparent',
    },
    '& > span > span': {
      color: theme.palette.text.primary,
    },
  },

  track: {
    height: 2,
    background: '#4389fd',
    borderRadius: 4,
    paddingRight: 8,
  },

  rail: {
    height: 2,
    borderRadius: 4,
    background: theme.palette.background.paper,
    width: 'calc(100% + 16px)',
  },
}))(Slider);

export default ColoredSlider;
