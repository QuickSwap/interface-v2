import { Box, makeStyles, Typography, useTheme } from '@material-ui/core';
import { LocalGasStation } from '@material-ui/icons';
import { CustomTooltip, ToggleSwitch } from 'components';
import { useBiconomy } from 'context/Biconomy';
import { useGasPrice } from 'context/GasPrice';
import React from 'react';
import { useIsGaslessEnabled, useToggleGasless } from 'state/application/hooks';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  gasPrice: {
    padding: 4,
    fontWeight: 600,
  },
}));

const GasPrice: React.FunctionComponent = (props) => {
  const { isGaslessAllowed } = useBiconomy();
  const classes = useStyles({ isGaslessAllowed });
  const { gasPrice } = useGasPrice();
  return (
    <CustomTooltip title='Current gas price' arrow>
      <Typography className={classes.gasPrice} variant='body1'>
        {gasPrice}
      </Typography>
    </CustomTooltip>
  );
};

export default GasPrice;
