import { Box, makeStyles, Typography, useTheme } from '@material-ui/core';
import { LocalGasStation } from '@material-ui/icons';
import { CustomTooltip, ToggleSwitch } from 'components';
import { useBiconomy } from 'context/Biconomy';
import { useGasPrice } from 'context/GasPrice';
import React from 'react';
import { useIsGaslessEnabled, useToggleGasless } from 'state/application/hooks';
import GaslessToggle from './GaslessToggle';
import GasPrice from './GasPrice';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  gaslessToggleWrapper: {
    alignItems: 'center',
    gap: '4px',
    display: 'flex',
    cursor: 'pointer',
    marginBottom: 5,
    opacity: (props: any) => (props.isGaslessAllowed ? '1' : '0.3'),
  },
}));

const ToggleWithGasPrice: React.FunctionComponent = (props) => {
  const { isGaslessAllowed } = useBiconomy();
  const classes = useStyles({ isGaslessAllowed });
  const { gasPrice } = useGasPrice();
  const toggleGaslessEnabled = useToggleGasless();
  const isGaslessEnabled = useIsGaslessEnabled();
  const { palette } = useTheme();

  return (
    <Box
      className={classes.gaslessToggleWrapper}
      onClick={() => toggleGaslessEnabled()}
    >
      <GasPrice />
      <GaslessToggle />
    </Box>
  );
};

export default ToggleWithGasPrice;
