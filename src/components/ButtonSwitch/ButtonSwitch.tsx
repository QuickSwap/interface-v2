import React from 'react';

import {
  Box,
  makeStyles,
  Tab,
  Tabs,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';

import cx from 'classnames';
import { useIsDarkMode } from 'state/user/hooks';

const useStyles = makeStyles(({ palette }) => ({
  container: {
    border: (props: any) =>
      props.borderMode === 'border' ? `1px solid ${palette.divider}` : '',
    boxShadow: (props: any) =>
      props.borderMode === 'shadow' ? 'rgb(0 0 0 / 8%) 0px 2px 5px' : '',
    backgroundColor: palette.background.paper,
    borderRadius: '8px',
    padding: (props: any) => props.padding,
    '& .MuiTabs-scroller': {
      padding: '0px !important',
    },
  },
  indicator: {
    height: '100%',
    borderRadius: '5px',
    backgroundColor: palette.secondary.main,
    transition: 'all 0.4s ease-out',
    boxShadow: 'none',
  },
  tab: {
    textTransform: 'none',
    fontSize: '14px',
    fontWeight: 400,
    opacity: 1,
    minHeight: (props: any) => `${props.minHeight}px `,
    height: (props: any) => `${props.minHeight}px `,
    color: palette.text.secondary,
  },
  tabInactive: {
    cursor: 'pointer',
    '& svg path': {
      fill: palette.secondary.main,
    },
    '&:hover': {
      color: palette.text.primary,
      '& svg path': {
        fill: palette.text.primary,
      },
    },
  },
  tabActive: {
    cursor: 'default',
    color: palette.text.primary,
    zIndex: 2,
    '& svg path': {
      fill: palette.text.primary,
    },
  },
}));

interface Item {
  label: React.ReactNode;
  icon?: any;
  value: string;
}

interface ButtonSwitchProps {
  items?: Item[];
  value?: string;
  onChange?: (value: string) => void;
  height?: number;
  padding?: number;
  width?: number | string;
  borderMode?: 'border' | 'shadow';
}

const ButtonSwitch: React.FC<ButtonSwitchProps> = ({
  items = [],
  height = 44,
  padding = 5,
  width = '100%',
  value,
  onChange,
  borderMode,
}) => {
  const dark = useIsDarkMode();

  const minHeight = height - padding * 2;
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('xs'));
  const classes = useStyles({
    minHeight,
    mobile,
    padding,
    borderMode: borderMode ?? (dark ? 'border' : 'shadow'),
  });

  return (
    <Box
      width={width}
      maxWidth='100%'
      display='inline-block'
      className='t-button-switch'
    >
      <Box className={classes.container}>
        <Tabs
          style={{ minHeight: minHeight }}
          value={value}
          variant='fullWidth'
          onChange={(event, newValue) => {
            onChange && onChange(newValue);
          }}
          classes={{
            indicator: classes.indicator,
          }}
        >
          {items.map((tab, index) => {
            return (
              <Tab
                key={index}
                disableRipple={true}
                label={
                  Array.isArray(tab.label)
                    ? tab.label.map((item, index) => (
                        <span key={index}>{item}</span>
                      ))
                    : tab.label
                }
                value={tab.value}
                wrapped
                className={cx(
                  classes.tab,
                  value === tab.value ? classes.tabActive : classes.tabInactive,
                  't-button-switch-item',
                )}
                style={{ minWidth: '0px' }}
              />
            );
          })}
        </Tabs>
      </Box>
    </Box>
  );
};

export default ButtonSwitch;
