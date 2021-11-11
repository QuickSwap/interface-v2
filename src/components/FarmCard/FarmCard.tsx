import React, { useState } from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { StakingInfo } from 'state/stake/hooks';
import { JSBI, TokenAmount } from '@uniswap/sdk';
import { QUICK, EMPTY } from 'constants/index';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { usePair } from 'data/Reserves';
import { useTotalSupply } from 'data/TotalSupply';
import useUSDCPrice from 'utils/useUSDCPrice';
import { DoubleCurrencyLogo, CurrencyLogo } from 'components';
import CircleInfoIcon from 'assets/images/circleinfo.svg';
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

const FarmCard: React.FC<{ stakingInfo: StakingInfo }> = ({ stakingInfo }) => {
  const classes = useStyles();
  const [ isExpandCard, setExpandCard ] = useState(false);

  const token0 = stakingInfo.tokens[0]
  const token1 = stakingInfo.tokens[1]

  const currency0 = unwrappedToken(token0)
  const currency1 = unwrappedToken(token1)
  const baseTokenCurrency = unwrappedToken(stakingInfo.baseToken);
  const empty = unwrappedToken(EMPTY);
  const quickPriceUSD = stakingInfo.quickPrice;

  // get the color of the token
  const baseToken = baseTokenCurrency === empty ? token0: stakingInfo.baseToken;
  
  const totalSupplyOfStakingToken = useTotalSupply(stakingInfo.stakedAmount.token)
  const [, stakingTokenPair] = usePair(...stakingInfo.tokens)

  // let returnOverMonth: Percent = new Percent('0')
  let valueOfTotalStakedAmountInBaseToken: TokenAmount | undefined
  if (totalSupplyOfStakingToken && stakingTokenPair) {
    // take the total amount of LP tokens staked, multiply by ETH value of all LP tokens, divide by all LP tokens
    valueOfTotalStakedAmountInBaseToken = new TokenAmount(
      baseToken,
      JSBI.divide(
        JSBI.multiply(
          JSBI.multiply(stakingInfo.totalStakedAmount.raw, stakingTokenPair.reserveOf(baseToken).raw),
          JSBI.BigInt(2) // this is b/c the value of LP shares are ~double the value of the WETH they entitle owner to
        ),
        totalSupplyOfStakingToken.raw
      )
    )
  }

  // get the USD value of staked WETH
  const USDPrice = useUSDCPrice(baseToken)
  const valueOfTotalStakedAmountInUSDC =
    valueOfTotalStakedAmountInBaseToken && USDPrice?.quote(valueOfTotalStakedAmountInBaseToken)
  
  const perMonthReturnInRewards = (Number(stakingInfo.dQuickToQuick) * Number(stakingInfo?.quickPrice) * 30) / Number(valueOfTotalStakedAmountInUSDC?.toSignificant(6));
  
  let apyWithFee: any = 0;

  if(stakingInfo?.oneYearFeeAPY && stakingInfo?.oneYearFeeAPY > 0) {
    apyWithFee = ((1 + ((Number(perMonthReturnInRewards) + Number(stakingInfo.oneYearFeeAPY) / 12) * 12) / 12) ** 12 - 1) * 100 // compounding monthly APY
    if(apyWithFee > 100000000) {
      apyWithFee = ">100000000"
    }
    else {
      apyWithFee = parseFloat(apyWithFee.toFixed(2)).toLocaleString()
    }
  }

  const tvl = valueOfTotalStakedAmountInUSDC
    ? `$${valueOfTotalStakedAmountInUSDC.toFixed(0, { groupSeparator: ',' })}`
    : `${valueOfTotalStakedAmountInBaseToken?.toSignificant(4, { groupSeparator: ',' }) ?? '-'} ETH`;

  const poolRate = `${stakingInfo.totalRewardRate?.toFixed(2, { groupSeparator: ',' }).replace(/[.,]00$/, "")} dQUICK / day`;

  return (
    <Box className={classes.syrupCard}>
      <Box className={classes.syrupCardUp} onClick={() => setExpandCard(!isExpandCard)} >
        <Box display='flex' alignItems='center' width={0.3}>
          <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={28} />
          <Box ml={1.5}>
            <Typography variant='body2'>{ currency0.symbol } / { currency1.symbol } LP</Typography>
          </Box>
        </Box>
        <Box width={0.2}>
          <Typography variant='body2'>{ tvl }</Typography>
        </Box>
        <Box width={0.25}>
          <Typography variant='body2'>{ poolRate }</Typography>
        </Box>
        <Box width={0.15} display='flex' flexDirection='row' alignItems='center' justifyContent='center'>
          <Typography variant='body2' style={{ color: '#0fc679' }}>{ apyWithFee }%</Typography>
          <Box ml={1} style={{height: '16px'}}><img src={CircleInfoIcon} alt={'arrow up'} /></Box>
        </Box>
        <Box width={0.2} mr={2} textAlign='right'>
          <Box display='flex' alignItems='center' justifyContent='flex-end' mb={0.25}>
            <CurrencyLogo currency={QUICK} size='16px' />
            <Typography variant='body2' style={{ marginLeft: 5 }}>{ stakingInfo.earnedAmount.toSignificant(2) }<span>&nbsp;dQUICK</span></Typography>
          </Box>
          <Typography variant='body2' style={{ color: '#696c80' }}>${(Number(stakingInfo.earnedAmount.toSignificant(2)) * Number(quickPriceUSD.toFixed(2)))}</Typography>
        </Box>
      </Box>

      { isExpandCard && 
        <Box width='100%' mt={2.5} pl={4} pr={4} pt={4} display='flex' flexDirection='row' borderTop='1px solid #444444' alignItems='center' justifyContent='space-between'>
          <Box width={0.25} ml={4} mr={4} style={{color: '#696c80'}}>
            <Box display='flex' flexDirection='row' alignItems='flex-start' justifyContent='space-between'>
              <Typography variant='body2'>In Wallet:</Typography>
              <Box display='flex' flexDirection='column' alignItems='flex-end' justifyContent='flex-start'>
                <Typography variant='body2'>0.00<span>LP (</span>$0)</Typography>
                <Link to='#' style={{color: '#448aff'}}>Get {currency0.symbol} / {currency1.symbol} LP</Link>
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
                <Typography variant='body2'>10.30<span>LP (</span>$4,387.23)</Typography>
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
              <Box mb={1}><CurrencyLogo currency={QUICK} /></Box>
              <Box mb={0.5}><Typography variant='body1' color='textSecondary'>{ stakingInfo.earnedAmount.toSignificant(2) }<span>&nbsp;dQUICK</span></Typography></Box>
              <Box mb={1}><Typography variant='body2'>${(Number(stakingInfo.earnedAmount.toSignificant(2)) * Number(quickPriceUSD.toFixed(2)))}</Typography></Box>
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