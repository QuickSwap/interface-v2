import React from 'react';
import { Box, Typography, Button } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { JSBI, TokenAmount } from '@uniswap/sdk';
import { makeStyles } from '@material-ui/core/styles';
import { StakingInfo } from 'state/stake/hooks';
import { useTotalSupply } from 'data/TotalSupply';
import { usePair } from 'data/Reserves';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { DoubleCurrencyLogo } from 'components';
import { EMPTY } from 'constants/index';
import useUSDCPrice from 'utils/useUSDCPrice';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon.svg';

const useStyles = makeStyles(({ palette }) => ({
  rewardsSliderItem: {
    borderRadius: 32,
    background: palette.background.paper,
    padding: '32px 22px',
    position: 'relative',
    '& .rewardIcon': {
      position: 'absolute',
      display: 'flex',
      top: 32,
      left: 22,
    },
    '& h5': {
      marginLeft: 70,
      textAlign: 'left',
    },
    '& .row': {
      display: 'flex',
      width: '100%',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
      '& p': {
        color: 'rgba(255, 255, 255, 0.47)',
        display: 'flex',
        alignItems: 'center',
        '& svg': {
          marginLeft: 4,
        },
      },
      '& h4': {
        color: 'white',
      },
      '& h5': {
        background: 'rgba(15, 198, 121, 0.12)',
        color: palette.success.main,
        padding: '0 4px',
        borderRadius: 5,
      },
    },
    '& button': {
      height: 40,
      fontSize: 16,
      marginTop: 12,
    },
  },
}));

interface RewardSliderItemProps {
  info: StakingInfo;
}

const RewardSliderItem: React.FC<RewardSliderItemProps> = ({ info }) => {
  const classes = useStyles();
  const history = useHistory();
  const token0 = info.tokens[0];

  const baseTokenCurrency = unwrappedToken(info.baseToken);
  const empty = unwrappedToken(EMPTY);

  let valueOfTotalStakedAmountInBaseToken: TokenAmount | undefined;
  const totalSupplyOfStakingToken = useTotalSupply(info.stakedAmount.token);
  const [, stakingTokenPair] = usePair(...info.tokens);
  const baseToken = baseTokenCurrency === empty ? token0 : info.baseToken;

  const USDPrice = useUSDCPrice(baseToken);

  if (totalSupplyOfStakingToken && stakingTokenPair) {
    // take the total amount of LP tokens staked, multiply by ETH value of all LP tokens, divide by all LP tokens
    valueOfTotalStakedAmountInBaseToken = new TokenAmount(
      baseToken,
      JSBI.divide(
        JSBI.multiply(
          JSBI.multiply(
            info.totalStakedAmount.raw,
            stakingTokenPair.reserveOf(baseToken).raw,
          ),
          JSBI.BigInt(2), // this is b/c the value of LP shares are ~double the value of the WETH they entitle owner to
        ),
        totalSupplyOfStakingToken.raw,
      ),
    );
  }
  const valueOfTotalStakedAmountInUSDC =
    valueOfTotalStakedAmountInBaseToken &&
    USDPrice?.quote(valueOfTotalStakedAmountInBaseToken);

  const rewards = Number(info.rate) * Number(info.quickPrice);

  const perMonthReturnInRewards: any =
    (Number(info.rate) * Number(info.quickPrice) * 30) /
    Number(valueOfTotalStakedAmountInUSDC?.toSignificant(6));

  let apyWithFee;
  if (info.oneYearFeeAPY && info.oneYearFeeAPY > 0) {
    apyWithFee =
      ((1 +
        ((perMonthReturnInRewards + Number(info.oneYearFeeAPY) / 12) * 12) /
          12) **
        12 -
        1) *
      100; // compounding monthly APY
    if (apyWithFee > 100000000) {
      apyWithFee = '>100000000';
    } else {
      apyWithFee = parseFloat(apyWithFee.toFixed(2)).toLocaleString();
    }
  }

  return (
    <Box className={classes.rewardsSliderItem}>
      <Box mb={4}>
        <Box className='rewardIcon'>
          <DoubleCurrencyLogo
            currency0={info.tokens[0]}
            currency1={info.tokens[1]}
            size={32}
          />
        </Box>
        <Typography variant='h5'>
          {info.tokens[0].symbol?.toUpperCase()}-
          {info.tokens[1].symbol?.toUpperCase()}
        </Typography>
      </Box>
      <Box className='row'>
        <Typography>24h Fees</Typography>
        <Typography component='h4'>
          ${Number(info?.oneDayFee.toFixed(0)).toLocaleString()}
        </Typography>
      </Box>
      <Box className='row'>
        <Typography>Locked Value</Typography>
        <Typography component='h4'>
          {valueOfTotalStakedAmountInUSDC
            ? `$${valueOfTotalStakedAmountInUSDC.toFixed(0, {
                groupSeparator: ',',
              })}`
            : `${valueOfTotalStakedAmountInBaseToken?.toSignificant(4, {
                groupSeparator: ',',
              }) ?? '-'} ETH`}
        </Typography>
      </Box>
      <Box className='row'>
        <Typography>TVL</Typography>
        <Typography component='h4'>
          ${Number(rewards.toFixed(0)).toLocaleString()}
        </Typography>
      </Box>
      {/* <Box className='row'>
        <Typography>Pool Rate</Typography>
        <Typography component='h4'>
          {info.totalRewardRate?.toFixed(2, { groupSeparator: ',' }).replace(/[.,]00$/, "")} QUICK / day
        </Typography>
      </Box> */}
      <Box className='row'>
        <Typography>
          APR
          <HelpIcon />
        </Typography>
        <Typography component='h5'>{apyWithFee}%</Typography>
      </Box>
      <Button
        fullWidth
        color='primary'
        style={{ marginTop: '30px' }}
        onClick={() => {
          history.push(
            `/pools?currency0=${info.tokens[0].address}&currency1=${info.tokens[1].address}`,
          );
        }}
      >
        Deposit LP Tokens
      </Button>
    </Box>
  );
};

export default RewardSliderItem;
