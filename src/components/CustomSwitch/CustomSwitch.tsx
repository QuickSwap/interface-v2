import React from 'react';
import { Typography, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import cx from 'classnames';

const useStyles = makeStyles(({ palette }) => ({
  switchItem: {
    width: '50%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    border: `1px solid ${palette.secondary.dark}`,
    '& p': {
      color: palette.text.secondary,
    },
  },
  activeSwitchItem: {
    background: palette.secondary.dark,
    '& p': {
      color: palette.text.primary,
    },
  },
}));

interface SwitchItems {
  text: string;
  onClick: () => void;
  condition: boolean;
}

interface CustomSwitchProps {
  width: number;
  height: number;
  items: SwitchItems[];
  isLarge?: boolean;
}

const CustomSwitch: React.FC<CustomSwitchProps> = ({
  width,
  height,
  items,
  isLarge,
}) => {
  const classes = useStyles();
  return (
    <Box display='flex' width={width} height={height}>
      {items.map((item, index) => (
        <Box
          key={index}
          className={cx(
            classes.switchItem,
            item.condition && classes.activeSwitchItem,
          )}
          style={{
            borderTopLeftRadius: index === 0 ? 8 : 0,
            borderBottomLeftRadius: index === 0 ? 8 : 0,
            borderTopRightRadius: index === items.length - 1 ? 8 : 0,
            borderBottomRightRadius: index === items.length - 1 ? 8 : 0,
          }}
          onClick={item.onClick}
        >
          <Typography variant={isLarge ? 'body1' : 'body2'}>
            {item.text}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default CustomSwitch;
