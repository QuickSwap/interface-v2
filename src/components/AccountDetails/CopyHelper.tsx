import React from 'react'
import { Button } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import useCopyClipboard from 'hooks/useCopyClipboard'
import { CheckCircle, Copy } from 'react-feather'

const useStyles = makeStyles(({ palette }) => ({
  copyIcon: {
    color: palette.text.primary,
    flexShrink: 0,
    display: 'flex',
    textDecoration: 'none',
    fontSize: '0.825rem',
    '&:hover, &:active, &:focus': {
      textDecoration: 'none',
      color: palette.text.secondary
    }
  },
  transactionStatusText: {
    marginLeft: '0.25rem',
    fontSize: '0.825rem',
    display: 'flex',
    alignItems: 'center'
  }
}));

interface CopyHelperProps {
  toCopy: string;
  children?: React.ReactNode;
}

const CopyHelper: React.FC<CopyHelperProps> = ({ toCopy, children }) => {
  const [isCopied, setCopied] = useCopyClipboard()
  const classes = useStyles();

  return (
    <Button className={classes.copyIcon} onClick={() => setCopied(toCopy)}>
      {isCopied ? (
        <span className={classes.transactionStatusText}>
          <CheckCircle size={'16'} />
          <span className={classes.transactionStatusText}>Copied</span>
        </span>
      ) : (
        <span className={classes.transactionStatusText}>
          <Copy size={'16'} />
        </span>
      )}
      {isCopied ? '' : children}
    </Button>
  )
}

export default CopyHelper;
