import React, { useState } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';
import { useLairInfo } from 'state/stake/hooks';
import { CurrencyLogo, StakeQuickModal, UnstakeQuickModal } from 'components';
import { ReactComponent as PriceExchangeIcon } from 'assets/images/PriceExchangeIcon.svg';
import { getDaysCurrentYear, formatNumber, returnTokenFromKey } from 'utils';

const useStyles = makeStyles(() => ({
  stakeButton: {
    width: '100%',
    height: 48,
    borderRadius: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    cursor: 'pointer',
  },
}));

const DragonsLair: React.FC = () => {
  const classes = useStyles();
  const daysCurrentYear = getDaysCurrentYear();
  const { palette } = useTheme();
  const [isQUICKRate, setIsQUICKRate] = useState(false);
  const [openStakeModal, setOpenStakeModal] = useState(false);
  const [openUnstakeModal, setOpenUnstakeModal] = useState(false);
  const lairInfo = useLairInfo();
  const APR =
    (((Number(lairInfo?.oneDayVol) * 0.04 * 0.01) /
      Number(lairInfo?.dQuickTotalSupply.toSignificant(6))) *
      daysCurrentYear) /
    (Number(lairInfo?.dQUICKtoQUICK.toSignificant()) *
      Number(lairInfo?.quickPrice));
  const APY = APR
    ? (
        (Math.pow(1 + APR / daysCurrentYear, daysCurrentYear) - 1) *
        100
      ).toFixed(2)
    : 0;

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
            Number(lairInfo.totalQuickBalance.toSignificant()) *
            Number(lairInfo.quickPrice)
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
          {formatNumber(Number(lairInfo.QUICKBalance.toSignificant()))}
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
          {isQUICKRate ? 1 : lairInfo.dQUICKtoQUICK.toSignificant(4)} QUICK =
        </Typography>
        <CurrencyLogo currency={returnTokenFromKey('QUICK')} />
        <Typography variant='body2' style={{ margin: '0 8px' }}>
          {isQUICKRate ? lairInfo.QUICKtodQUICK.toSignificant(4) : 1} dQUICK
        </Typography>
        <PriceExchangeIcon
          style={{ cursor: 'pointer' }}
          onClick={() => setIsQUICKRate(!isQUICKRate)}
        />
      </Box>
      <Box
        className={classes.stakeButton}
        bgcolor={palette.secondary.light}
        onClick={() => setOpenUnstakeModal(true)}
      >
        <Typography variant='body2'>- Unstake dQUICK</Typography>
      </Box>
      <Box
        className={classes.stakeButton}
        style={{
          backgroundImage: 'linear-gradient(279deg, #004ce6, #3d71ff)',
        }}
        onClick={() => setOpenStakeModal(true)}
      >
        <Typography variant='body2'>Stake QUICK</Typography>
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
