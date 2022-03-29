import React, { useEffect } from 'react';
import { Box, LinearProgress, Typography } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useActiveWeb3React } from 'hooks';
import { getEtherscanLink } from 'utils/index';
import { ReactComponent as ArrowTopRight } from 'assets/images/ArrowTopRight.svg';

const useStyles = makeStyles(({}) => ({
  pendingBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    left: 0,
    '& .MuiLinearProgress-root': {
      background: 'rgba(255, 160, 0, 0.3)',
      '& .MuiLinearProgress-bar': {
        background: '#ffa000',
      },
    },
  },
}));

interface TransactionPopupProps {
  hash: string;
  pending?: boolean;
  success?: boolean;
  summary?: string;
}

const TransactionPopup: React.FC<TransactionPopupProps> = ({
  hash,
  pending,
  success,
  summary,
}) => {
  const classes = useStyles();
  const { palette } = useTheme();
  const { chainId } = useActiveWeb3React();
  const [progress, setProgress] = React.useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        return Math.min(oldProgress + 2.5, 100);
      });
    }, 500);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <>
      <Box
        mb={1.5}
        display='flex'
        justifyContent='space-between'
        alignItems='center'
      >
        <Typography
          variant='body2'
          style={{
            fontWeight: 600,
            color: pending
              ? '#ffa000'
              : success
              ? palette.success.main
              : palette.error.main,
          }}
        >
          {pending ? 'Processing…' : success ? 'Confirmed' : 'Failed'}
        </Typography>
        {chainId && hash.length > 0 && (
          <a
            href={getEtherscanLink(chainId, hash, 'transaction')}
            target='_blank'
            rel='noopener noreferrer'
          >
            <ArrowTopRight />
          </a>
        )}
      </Box>
      <Typography variant='body2'>
        {summary ?? 'Hash: ' + hash.slice(0, 8) + '...' + hash.slice(58, 65)}
      </Typography>
      {pending && (
        <Box className={classes.pendingBar}>
          <LinearProgress variant='determinate' value={progress} />
        </Box>
      )}
    </>
  );
};

export default TransactionPopup;
