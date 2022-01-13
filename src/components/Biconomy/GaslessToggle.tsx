import {
  Box,
  CircularProgress,
  makeStyles,
  Typography,
  useTheme,
} from '@material-ui/core';
import { LocalGasStation } from '@material-ui/icons';
import { CustomTooltip, ToggleSwitch } from 'components';
import { ToggleGaslessStatus, useBiconomy } from 'context/Biconomy';
import React from 'react';
import ErrorTooltip from './ErrorTooltip';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  gaslessToggleWrapper: {
    alignItems: 'center',
    gap: '4px',
    display: 'flex',
    cursor: 'pointer',
  },
  gaslessToggleError: {
    position: 'absolute',
    display: 'inline-block',
    width: 'max-content',
    maxWidth: '200px',
    top: '0',
    left: '50%',
    transform: 'translate(-50%, -120%)',
    transformOrigin: '50% 0',
    backgroundColor: palette.error.main,
    color: palette.error.contrastText,
    borderRadius: '10px',
    opacity: '0.7',
    padding: '8px 12px',
    transition: 'opacity',
  },
  gaslessToggleErrorArrow: {
    position: 'absolute',
    bottom: '0',
    height: '8px',
    width: '8px',
    left: '50%',
    transform: 'translate(-50%, 50%) rotate(45deg)',
    backgroundColor: palette.error.main,
  },
}));

const GaslessToggle: React.FunctionComponent = (props) => {
  const { isGaslessAllowed, toggleGaslessStatus } = useBiconomy();
  const classes = useStyles();
  const { isGaslessEnabled, toggleGasless, toggleGaslessError } = useBiconomy();
  const { palette } = useTheme();

  return (
    <CustomTooltip
      title={
        isGaslessAllowed
          ? "Gasless Mode. This button will toggle QuickSwap's gasless feature for your wallet. Users with hardware wallets should keep this setting turned off."
          : 'Gasless mode is disabled because gas prices are too high'
      }
    >
      <Box position='relative'>
        <ErrorTooltip error={toggleGaslessError} />
        <Box className={classes.gaslessToggleWrapper} onClick={toggleGasless}>
          <LocalGasStation
            htmlColor={
              isGaslessEnabled && isGaslessAllowed
                ? palette.text.primary
                : palette.text.disabled
            }
          />
          <ToggleSwitch
            toggled={isGaslessEnabled && isGaslessAllowed}
            onToggle={() => null}
          />
          {toggleGaslessStatus === ToggleGaslessStatus.PENDING && (
            <CircularProgress size={18} />
          )}
        </Box>
      </Box>
    </CustomTooltip>
  );
};

export default GaslessToggle;
