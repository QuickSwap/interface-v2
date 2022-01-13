import React, { useEffect, useState } from 'react';
import {
  Box,
  CircularProgress,
  makeStyles,
  Typography,
  useTheme,
} from '@material-ui/core';
import { Transition } from 'react-transition-group';

interface IErrorTooltipProps {
  error: Error | undefined;
}

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  errorTooltip: {
    position: 'absolute',
    display: 'inline-block',
    width: 'max-content',
    maxWidth: '200px',
    top: '0',
    left: '50%',
    transform: 'translate(-50%, -120%)',
    transformOrigin: '50% 0',
    opacity: 0,
    backgroundColor: palette.error.main,
    color: palette.error.contrastText,
    borderRadius: '10px',
    padding: '8px 12px',
    transition: 'opacity 300ms ease-in-out',
    lineHeight: '0.5em',
  },
  errorTooltipArrow: {
    position: 'absolute',
    bottom: '0',
    height: '8px',
    width: '8px',
    left: '50%',
    transform: 'translate(-50%, 50%) rotate(45deg)',
    backgroundColor: palette.error.main,
  },
}));

const ErrorTooltip: React.FunctionComponent<IErrorTooltipProps> = ({
  error,
}) => {
  const classes = useStyles();
  const [errorTooltipVisible, setErrorTooltipVisible] = useState(false);

  useEffect(() => {
    let timeout: any;
    if (error) {
      setErrorTooltipVisible(true);
      console.log(true);
      timeout = setTimeout(() => setErrorTooltipVisible(false), 3000);
    }
    () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [error]);

  return (
    <Transition in={errorTooltipVisible} timeout={200} unmountOnExit>
      {(status) => (
        <div
          className={classes.errorTooltip}
          style={{
            opacity: status === 'entered' ? '0.8' : '0',
          }}
        >
          <Typography variant='caption'>{error?.message || 'error'}</Typography>
          <div className={classes.errorTooltipArrow} />
        </div>
      )}
    </Transition>
  );
};

export default ErrorTooltip;
