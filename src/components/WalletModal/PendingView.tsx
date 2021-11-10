import { AbstractConnector } from '@web3-react/abstract-connector'
import React from 'react'
import { Box, CircularProgress, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { SUPPORTED_WALLETS } from 'constants/index'
import { injected } from 'connectors'
import Option from './Option'

const useStyles = makeStyles(({ palette }) => ({
  pendingSection: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    '& > *': {
      width: '100%'
    }
  },
  loadingMessage: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderRadius: 12,
    marginBottom: 20,
    color: palette.error.main,
    border: `1px solid ${palette.error.main}`, 
    '& > *': {
      padding: '1rem'
    }
  },
  errorGroup: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  errorButton: {
    borderRadius: 8,
    fontSize: 12,
    color: palette.text.primary,
    backgroundColor: palette.background.default,
    marginLeft: '1rem',
    padding: '0.5rem',
    fontWeight: 600,
    userSelect: 'none',
    cursor: 'pointer',
  },
  loadingWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& p': {
      marginLeft: 8
    }
  }
}));

interface PendingViewProps {
  connector?: AbstractConnector
  error?: boolean
  setPendingError: (error: boolean) => void
  tryActivation: (connector: AbstractConnector) => void
}

const PendingView: React.FC<PendingViewProps> = ({
  connector,
  error = false,
  setPendingError,
  tryActivation
}) => {
  const isMetamask = (window as any).ethereum?.isMetaMask
  const classes = useStyles();

  return (
    <Box className={classes.pendingSection}>
      <Box className={classes.loadingMessage}>
        <Box className={classes.loadingWrapper}>
          {error ? (
            <Box className={classes.errorGroup}>
              <div>Error connecting.</div>
              <Box className={classes.errorButton}
                onClick={() => {
                  setPendingError(false)
                  connector && tryActivation(connector)
                }}
              >
                Try Again
              </Box>
            </Box>
          ) : (
            <>
              <CircularProgress />
              <Typography>Initializing...</Typography>
            </>
          )}
        </Box>
      </Box>
      {Object.keys(SUPPORTED_WALLETS).map(key => {
        const option = SUPPORTED_WALLETS[key]
        if (option.connector === connector) {
          if (option.connector === injected) {
            if (isMetamask && option.name !== 'MetaMask') {
              return null
            }
            if (!isMetamask && option.name === 'MetaMask') {
              return null
            }
          }
          return (
            <Option
              id={`connect-${key}`}
              key={key}
              clickable={false}
              color={option.color}
              header={option.name}
              subheader={option.description}
              icon={option.iconName}
            />
          )
        }
        return null
      })}
    </Box>
  )
}

export default PendingView;
