import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import useCopyClipboard from 'hooks/useCopyClipboard';
import { CheckCircle, Copy } from 'react-feather';

const useStyles = makeStyles(({ palette }) => ({
  copyIcon: {
    color: palette.text.primary,
    display: 'flex',
    cursor: 'pointer',
    '&:hover, &:active, &:focus': {
      color: palette.text.secondary,
    },
  },
}));

interface CopyHelperProps {
  toCopy: string;
  children?: React.ReactNode;
}

const CopyHelper: React.FC<CopyHelperProps> = ({ toCopy, children }) => {
  const [isCopied, setCopied] = useCopyClipboard();
  const classes = useStyles();

  return (
    <Box className={classes.copyIcon} onClick={() => setCopied(toCopy)}>
      {isCopied ? (
        <>
          <CheckCircle size='20' />
          <Typography style={{ marginLeft: 4 }} variant='body2'>
            Copied
          </Typography>
        </>
      ) : (
        <Copy size='20' />
      )}
      {isCopied ? '' : children}
    </Box>
  );
};

export default CopyHelper;
