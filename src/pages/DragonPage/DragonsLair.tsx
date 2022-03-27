import React, { useState } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';
import { useLairInfo } from 'state/stake/hooks';
import { CurrencyLogo, StakeQuickModal, UnstakeQuickModal } from 'components';
import { ReactComponent as PriceExchangeIcon } from 'assets/images/PriceExchangeIcon.svg';
import {
  formatNumber,
  formatTokenAmount,
  returnTokenFromKey,
  useLairDQUICKAPY,
} from 'utils';
import { useUSDCPriceToken } from 'utils/useUSDCPrice';

const useStyles = makeStyles(({ palette }) => ({
  stakeButton: {
    width: '100%',
    height: 48,
    borderRadius: 10,
    border: `1px solid ${palette.primary.main}`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    cursor: 'pointer',
    '& p': {
      fontWeight: 600,
      color: '#ebecf2',
    },
  },
}));

const DragonsLair: React.FC = () => {
  const classes = useStyles();
  const { palette } = useTheme();
  const quickPrice = useUSDCPriceToken(returnTokenFromKey('QUICK'));
  const dQUICKPrice = useUSDCPriceToken(returnTokenFromKey('DQUICK'));
  const dQUICKtoQUICK = dQUICKPrice / quickPrice;
  const QUICKtodQUICK = quickPrice / dQUICKPrice;
  const [isQUICKRate, setIsQUICKRate] = useState(false);
  const [openStakeModal, setOpenStakeModal] = useState(false);
  const [openUnstakeModal, setOpenUnstakeModal] = useState(false);
  const lairInfo = useLairInfo();
  const APY = useLairDQUICKAPY(lairInfo);

  return (
    <Box position='relative' zIndex={3}>
      {openStakeModal && (
        <StakeQuickModal
          open={openStakeModal}
          onClose={() => setOpenStakeModal(false)}
        />
      )}
      {openUnstakeModal && (
        <UnstakeQuickModal
          open={openUnstakeModal}
          onClose={() => setOpenUnstakeModal(false)}
        />
      )}
      <Box display='flex'>
        <CurrencyLogo currency={returnTokenFromKey('QUICK')} size='32px' />
        <Box ml={1.5}>
          <Typography
            variant='body2'
            style={{ color: palette.text.primary, lineHeight: 1 }}
          >
            QUICK
          </Typography>
          <Typography variant='caption' style={{ color: palette.text.hint }}>
            Single Stake — Auto compounding
          </Typography>
        </Box>
      </Box>
      <Box display='flex' justifyContent='space-between' mt={1.5}>
        <Typography variant='body2'>Total QUICK</Typography>
        <Typography variant='body2'>
          {lairInfo
            ? lairInfo.totalQuickBalance.toFixed(2, {
                groupSeparator: ',',
              })
            : 0}
        </Typography>
      </Box>
      <Box display='flex' justifyContent='space-between' mt={1.5}>
        <Typography variant='body2'>TVL:</Typography>
        <Typography variant='body2'>
          $
          {(
            Number(lairInfo.totalQuickBalance.toExact()) * quickPrice
          ).toLocaleString()}
        </Typography>
      </Box>
      <Box display='flex' justifyContent='space-between' mt={1.5}>
        <Typography variant='body2'>APY</Typography>
        <Typography variant='body2' style={{ color: palette.success.main }}>
          {APY}%
        </Typography>
      </Box>
      <Box display='flex' justifyContent='space-between' mt={1.5}>
        <Typography variant='body2'>Your Deposits</Typography>
        <Typography variant='body2'>
          {formatTokenAmount(lairInfo.QUICKBalance)}
        </Typography>
      </Box>
      <Box
        mt={2.5}
        width={1}
        height='40px'
        display='flex'
        alignItems='center'
        justifyContent='center'
        borderRadius={10}
        border={`1px solid ${palette.secondary.light}`}
      >
        <CurrencyLogo currency={returnTokenFromKey('QUICK')} />
        <Typography variant='body2' style={{ margin: '0 8px' }}>
          {isQUICKRate ? 1 : dQUICKtoQUICK.toLocaleString()} QUICK =
        </Typography>
        <CurrencyLogo currency={returnTokenFromKey('QUICK')} />
        <Typography variant='body2' style={{ margin: '0 8px' }}>
          {isQUICKRate ? QUICKtodQUICK.toLocaleString() : 1} dQUICK
        </Typography>
        <PriceExchangeIcon
          style={{ cursor: 'pointer' }}
          onClick={() => setIsQUICKRate(!isQUICKRate)}
        />
      </Box>
      <Box
        className={classes.stakeButton}
        bgcolor={palette.primary.main}
        onClick={() => setOpenStakeModal(true)}
      >
        <Typography variant='body2'>Stake</Typography>
      </Box>
      <Box
        className={classes.stakeButton}
        bgcolor='transparent'
        onClick={() => setOpenUnstakeModal(true)}
      >
        <Typography variant='body2'>Unstake</Typography>
      </Box>
      <Box mt={3} textAlign='center'>
        <Typography
          variant='caption'
          style={{ color: palette.text.secondary, fontWeight: 500 }}
        >
          ⭐️ When you unstake, the contract will automatically claim QUICK on
          your behalf.
        </Typography>
      </Box>
    </Box>
  );
};

export default DragonsLair;
