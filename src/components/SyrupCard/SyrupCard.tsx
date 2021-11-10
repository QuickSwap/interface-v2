import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { SyrupInfo } from 'state/stake/hooks';
import { QUICK } from 'constants/index';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { usePair } from 'data/Reserves';
import useUSDCPrice from 'utils/useUSDCPrice';
import { CurrencyLogo } from 'components';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  syrupCard: {
    background: '#282d3d',
    height: 80,
    width: '100%',
    borderRadius: 10,
    marginTop: 24,
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px'
  }
}));

const SyrupCard: React.FC<{ syrup: SyrupInfo }> = ({ syrup }) => {
  const classes = useStyles();

  const currency = unwrappedToken(syrup.token);
  const baseTokenCurrency = unwrappedToken(syrup.baseToken);
  const isStaking = Boolean(syrup.stakedAmount.greaterThan('0'))

  console.log('bbb', syrup);

  const dQuickDeposit = syrup.valueOfTotalStakedAmountInUSDC
    ? `$${Number(syrup.valueOfTotalStakedAmountInUSDC).toLocaleString()}`
    : `${syrup.totalStakedAmount.toSignificant(6, { groupSeparator: ',' }) ?? '-'} dQUICK`;

  const [, stakingTokenPair] = usePair(currency, baseTokenCurrency);
  const price = stakingTokenPair?.priceOf(syrup.token);
  const USDPriceToken = useUSDCPrice(syrup.token);
  const USDPriceBaseToken = useUSDCPrice(syrup.baseToken);              
  const priceOfRewardTokenInUSD = Number(price?.toSignificant(6)) * Number(USDPriceBaseToken?.toSignificant(6));
  
  const rewards = Number(syrup.rate) * (priceOfRewardTokenInUSD ? priceOfRewardTokenInUSD : 0);

  let tokenAPR: any = 0;
  if (Number(syrup.valueOfTotalStakedAmountInUSDC) > 0) {
    tokenAPR = (rewards / Number(syrup.valueOfTotalStakedAmountInUSDC)) * 365 * 100
    tokenAPR = parseFloat(tokenAPR).toFixed(3);
  }

  const dQUICKAPR =(((Number(syrup.oneDayVol) * 0.04 * 0.01) / Number(syrup.dQuickTotalSupply.toSignificant(6))) * 365) / (Number(syrup.dQUICKtoQUICK.toSignificant(6)) * Number(syrup.quickPrice));
  
  let dQUICKAPY: any = dQUICKAPR ? Number((Math.pow(1 + dQUICKAPR / 365, 365) - 1) * 100).toLocaleString() : 0;
  
  return (
    <Box className={classes.syrupCard}>
      <Box display='flex' alignItems='center' width={0.3}>
        <CurrencyLogo currency={currency} size='32px' />
        <Box ml={1.5}>
          <Typography variant='body2'>{ currency.symbol }</Typography>
          <Typography variant='caption'>{ Number(syrup.rate).toLocaleString() }<span style={{ color: '#696c80' }}> / day</span></Typography>
        </Box>
      </Box>
      <Box width={0.3}>
        <Typography variant='body2'>{ dQuickDeposit }</Typography>
      </Box>
      <Box width={0.2}>
        <Typography variant='body2' style={{ color: '#0fc679' }}>{ tokenAPR }%</Typography>
        <Box display='flex'>
          <Box borderRadius='4px' border='1px solid #3e4252' padding='4px 6px' marginTop='6px' display='flex' alignItems='center'>
            <CurrencyLogo currency={QUICK} size='12px' />
            <Typography variant='caption' style={{ marginLeft: 4 }}>{ dQUICKAPY }% <span style={{ color: '#636780' }}>APY</span></Typography>
          </Box>
        </Box>
      </Box>
      <Box width={0.2} textAlign='right'>
        <Box display='flex' alignItems='center' justifyContent='flex-end' mb={0.25}>
          <CurrencyLogo currency={currency} size='16px' />
          <Typography variant='body2' style={{ marginLeft: 5 }}>{ syrup.earnedAmount.toSignificant(2) }</Typography>
        </Box>
        <Typography variant='body2' style={{ color: '#696c80' }}>${(Number(syrup.earnedAmount.toSignificant()) * Number(USDPriceToken ? USDPriceToken.toSignificant() : 0)).toLocaleString()}</Typography>
      </Box>
    </Box>
  )
}

export default SyrupCard;