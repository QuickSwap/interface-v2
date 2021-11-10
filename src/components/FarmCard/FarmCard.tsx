import React, { useState } from 'react';
import { Box, Typography, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { SyrupInfo } from 'state/stake/hooks';
import { QUICK } from 'constants/index';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { usePair } from 'data/Reserves';
import useUSDCPrice from 'utils/useUSDCPrice';
import { CurrencyLogo } from 'components';
import CircleInfoIcon from 'assets/images/circleinfo.svg';
import TokenPairIcon from 'assets/images/tokenpair.png';
import { Link } from 'react-router-dom';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  syrupCard: {
    background: '#282d3d',
    width: '100%',
    borderRadius: 10,
    marginTop: 24,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  syrupCardUp: {
    background: '#282d3d',
    height: 80,
    width: '100%',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    cursor: 'pointer'
  },
  inputVal: {
    backgroundColor: '#121319', 
    borderRadius: '10px', 
    height: '50px',
    display: 'flex',
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between'
  },
  buttonToken: {
    backgroundColor: '#3e4252', 
    borderRadius: '10px', 
    height: '50px',
    display: 'flex',
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    cursor: 'pointer'
  },
  buttonClaim: {
    backgroundImage: 'linear-gradient(280deg, #64fbd3 0%, #00cff3 0%, #0098ff 10%, #004ce6 100%)',
    borderRadius: '10px', 
    height: '50px',
    display: 'flex',
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'white'
  }
}));

const FarmCard: React.FC<{ syrup: SyrupInfo }> = ({ syrup }) => {
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
  
  const [isExpandCard, setExpandCard] = useState(false);

  return (
    <Box className={classes.syrupCard}>
      <Box className={classes.syrupCardUp} onClick={() => setExpandCard(!isExpandCard)} >
        <Box display='flex' alignItems='center' width={0.3}>
          <img src={TokenPairIcon} alt='token pair' style={{height: '28px'}} />
          <Box ml={1.5}>
            <Typography variant='body2'>{ currency.symbol }</Typography>
          </Box>
        </Box>
        <Box width={0.25}>
          <Typography variant='body2'>{ dQuickDeposit }</Typography>
        </Box>
        <Box width={0.25}>
          <Typography variant='caption'>{ Number(syrup.rate).toLocaleString() }<span>&nbsp;dQUICK / Day</span></Typography>
        </Box>
        <Box width={0.2} display='flex' flexDirection='row' alignItems='center' justifyContent='center'>
          <Typography variant='body2' style={{ color: '#0fc679' }}>{ tokenAPR }%</Typography>
          <Box ml={1} style={{height: '16px'}}><img src={CircleInfoIcon} alt={'arrow up'} /></Box>
        </Box>
        <Box width={0.1} mr={2} textAlign='right'>
          <Box display='flex' alignItems='center' justifyContent='flex-end' mb={0.25}>
            <CurrencyLogo currency={currency} size='16px' />
            <Typography variant='body2' style={{ marginLeft: 5 }}>{ syrup.earnedAmount.toSignificant(2) }<span>&nbsp;dQUICK</span></Typography>
          </Box>
          <Typography variant='body2' style={{ color: '#696c80' }}>${(Number(syrup.earnedAmount.toSignificant()) * Number(USDPriceToken ? USDPriceToken.toSignificant() : 0)).toLocaleString()}</Typography>
        </Box>
      </Box>

      { isExpandCard && 
        <Box width='100%' mt={2.5} pl={4} pr={4} pt={4} display='flex' flexDirection='row' borderTop='1px solid #444444' alignItems='center' justifyContent='space-between'>
          <Box width={0.25} ml={4} mr={4} style={{color: '#696c80'}}>
            <Box display='flex' flexDirection='row' alignItems='flex-start' justifyContent='space-between'>
              <Typography variant='body2'>In Wallet:</Typography>
              <Box display='flex' flexDirection='column' alignItems='flex-end' justifyContent='flex-start'>
                <Typography variant='body1'>0.00<span>LP (</span>$0)</Typography>
                <Link to='#' style={{color: '#448aff'}}>Get QUICK / USDC LP</Link>
              </Box>
            </Box>
            <Box className={classes.inputVal} mb={2} mt={2} p={2}>
              <Typography variant='body1'>0.00</Typography>
              <Typography variant='body2'>MAX</Typography>
            </Box>
            <Box className={classes.buttonToken} mb={2} mt={2} p={2}>
              <Typography variant='body1'>Stake LP Tokens</Typography>
            </Box>
          </Box>
          <Box width={0.25} ml={4} mr={4} style={{color: '#696c80'}}>
            <Box display='flex' flexDirection='row' alignItems='flex-start' justifyContent='space-between'>
              <Typography variant='body2'>My deposits:</Typography>
              <Box display='flex' flexDirection='column' alignItems='flex-end' justifyContent='flex-start'>
                <Typography variant='body1'>10.30<span>LP (</span>$4,387.23)</Typography>
              </Box>
            </Box>
            <Box className={classes.inputVal} mb={2} mt={4.5} p={2}>
              <Typography variant='body1'>0.00</Typography>
              <Typography variant='body2' style={{color: '#448aff'}}>MAX</Typography>
            </Box>
            <Box className={classes.buttonToken} mb={2} mt={2} p={2}>
              <Typography variant='body1'>Unstake LP Tokens</Typography>
            </Box>
          </Box>
          <Box width={0.25} ml={4} mr={4} style={{color: '#696c80'}}>
            <Box display='flex' flexDirection='column' alignItems='center' justifyContent='space-between'>
              <Box mb={1}><Typography variant='body2'>Unclaimed Rewards:</Typography></Box>
              <Box mb={1}><img src={TokenPairIcon} alt='token pair' style={{height: '24px'}} /></Box>
              <Box mb={0.5}><Typography variant='body1' color='textSecondary'>1.05<span>&nbsp;dQUICK</span></Typography></Box>
              <Box mb={0.5}><Typography variant='body2'>$423</Typography></Box>
            </Box>
            <Box className={classes.buttonClaim} mb={2} p={2}>
              <Typography variant='body1' color='textSecondary'>Claim</Typography>
            </Box>
          </Box>
        </Box>
      }
    </Box>
  )
}

export default FarmCard;