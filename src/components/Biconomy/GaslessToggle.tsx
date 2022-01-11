import { Box, makeStyles, Typography, useTheme } from '@material-ui/core';
import { LocalGasStation } from '@material-ui/icons';
import { CustomTooltip, ToggleSwitch } from 'components';
import { useBiconomy } from 'context/Biconomy';
import { useGasPrice } from 'context/GasPrice';
import React from 'react';
import { useIsGaslessEnabled, useToggleGasless } from 'state/application/hooks';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  gaslessToggleWrapper: {
    alignItems: 'center',
    gap: '4px',
    display: 'flex',
    cursor: 'pointer',
    marginBottom: 5,
  },
}));

const GaslessToggle: React.FunctionComponent = (props) => {
  const { isGaslessAllowed } = useBiconomy();
  const classes = useStyles();
  const { gasPrice } = useGasPrice();
  const toggleGaslessEnabled = useToggleGasless();
  const isGaslessEnabled = useIsGaslessEnabled();
  const { palette } = useTheme();

  return (
    <>
      <CustomTooltip
        title={
          isGaslessAllowed
            ? 'Gasless Mode. This button will toggle QuickSwap&rsquo;s gasless feature for your wallet. Users with hardware wallets should keep this setting turned off.'
            : 'Gasless mode is disabled because gas prices are too high'
        }
        arrow
      >
        <LocalGasStation
          htmlColor={
            isGaslessEnabled && isGaslessAllowed
              ? palette.text.primary
              : palette.text.disabled
          }
        />
      </CustomTooltip>
      <ToggleSwitch
        toggled={isGaslessEnabled && isGaslessAllowed}
        onToggle={() => null}
      />
    </>
  );
};

export default GaslessToggle;
