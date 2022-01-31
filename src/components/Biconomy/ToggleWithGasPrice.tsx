import { Box, makeStyles, Typography, useTheme } from '@material-ui/core';
import { LocalGasStation } from '@material-ui/icons';
import { CustomTooltip, ToggleSwitch } from 'components';
import { isGaslessEnabledForToken } from 'config/biconomy/metaTokens/utils';
import { useBiconomy } from 'context/Biconomy';
import { useGasPrice } from 'context/GasPrice';
import React from 'react';
import GaslessToggle from './GaslessToggle';
import GasPrice from './GasPrice';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  gaslessToggleWrapper: {
    alignItems: 'center',
    gap: '8px',
    display: 'flex',
    marginBottom: 5,
    color: '#A69845',
    opacity: (props: any) =>
      props.isGaslessAllowed && props.isTokenAllowed ? '1' : '0.4',
  },
}));

interface IToggleWithGasPrice {
  token?: any;
}

const ToggleWithGasPrice: React.FC<IToggleWithGasPrice> = ({ token }) => {
  const { isGaslessAllowed } = useBiconomy();
  const isTokenAllowed: boolean = token
    ? isGaslessEnabledForToken(token)
    : false;

  const classes = useStyles({ isGaslessAllowed, isTokenAllowed });
  const { gasPrice } = useGasPrice();
  const { isGaslessEnabled, toggleGasless } = useBiconomy();
  const { palette } = useTheme();

  return (
    <Box className={classes.gaslessToggleWrapper}>
      <GasPrice />
      <GaslessToggle
        disabled={!isGaslessAllowed || !isTokenAllowed}
        isTokenAllowed={isTokenAllowed}
      />
    </Box>
  );
};

export default ToggleWithGasPrice;
