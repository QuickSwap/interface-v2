import {
  Box,
  CircularProgress,
  makeStyles,
  Typography,
  useTheme,
} from '@material-ui/core';
import { InfoRounded } from '@material-ui/icons';
import { CustomTooltip } from 'components';
import ToggleSwitch from './BrandedToggle';
import { ToggleGaslessStatus, useBiconomy } from 'context/Biconomy';
import React, { useMemo } from 'react';
import ErrorTooltip from './ErrorTooltip';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  gaslessToggleWrapper: {
    alignItems: 'center',
    gap: '8px',
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
  infoIcon: {
    height: 16,
    width: 'auto',
  },
  switchLabelWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
}));

const GaslessToggle: React.FunctionComponent<{
  disabled?: boolean;
  isTokenAllowed?: boolean;
}> = ({ disabled, isTokenAllowed }) => {
  const { isGaslessAllowed, toggleGaslessStatus } = useBiconomy();
  const classes = useStyles();
  const { isGaslessEnabled, toggleGasless, toggleGaslessError } = useBiconomy();
  const { palette } = useTheme();

  const tooltipMessage = useMemo(() => {
    if (isGaslessAllowed && isTokenAllowed)
      return "Gasless Mode. This button will toggle QuickSwap's gasless feature for your wallet. Users with hardware wallets should keep this setting turned off.";
    if (!isGaslessAllowed)
      return 'Gasless mode is disabled because gas prices are too high';
    if (!isTokenAllowed)
      return 'Gasless mode is disabled because current from token is unsupported';
    return 'Gasless mode';
  }, [isGaslessAllowed, isTokenAllowed]);

  return (
    <CustomTooltip title={tooltipMessage}>
      <Box position='relative'>
        <ErrorTooltip error={toggleGaslessError} />
        <Box
          className={classes.gaslessToggleWrapper}
          onClick={() => {
            if (disabled) return;
            toggleGasless();
          }}
        >
          <Box className={classes.switchLabelWrapper}>
            <InfoRounded className={classes.infoIcon} />
            <Typography variant='body2' noWrap>
              Go Gasless
            </Typography>
          </Box>
          <ToggleSwitch
            toggled={isGaslessEnabled && isGaslessAllowed && !disabled}
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
