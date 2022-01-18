import React from 'react';
import { Box, Typography, Button } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { JSBI, TokenAmount } from '@uniswap/sdk';
import { makeStyles } from '@material-ui/core/styles';
import { StakingInfo } from 'state/stake/hooks';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { DoubleCurrencyLogo } from 'components';
import { GlobalConst } from 'constants/index';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon.svg';
import { getAPYWithFee, returnTokenFromKey } from 'utils';

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
      background: palette.primary.main,
      borderRadius: 20,
    },
  },
}));

interface RewardSliderItemProps {
  info: StakingInfo;
  stakingAPY: number;
}

const RewardSliderItem: React.FC<RewardSliderItemProps> = ({
  info,
  stakingAPY,
}) => {
  const classes = useStyles();
  const history = useHistory();
  const token0 = info.tokens[0];

  const baseTokenCurrency = unwrappedToken(info.baseToken);
  const empty = unwrappedToken(returnTokenFromKey('EMPTY'));

  let valueOfTotalStakedAmountInBaseToken: TokenAmount | undefined;
  const totalSupplyOfStakingToken = info.totalSupply;
  const stakingTokenPair = info.stakingTokenPair;
  const baseToken = baseTokenCurrency === empty ? token0 : info.baseToken;

  const USDPrice = info.usdPrice;

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

  let apyWithFee;
  if (stakingAPY && stakingAPY > 0) {
    apyWithFee = getAPYWithFee(info.perMonthReturnInRewards ?? 0, stakingAPY);

    if (apyWithFee > 100000000) {
      apyWithFee = '>100000000';
    } else {
      apyWithFee = parseFloat(apyWithFee.toFixed(2)).toLocaleString();
    }
  }

  const tvl = valueOfTotalStakedAmountInUSDC
    ? `$${valueOfTotalStakedAmountInUSDC.toFixed(0, { groupSeparator: ',' })}`
    : `${valueOfTotalStakedAmountInBaseToken?.toSignificant(4, {
        groupSeparator: ',',
      }) ?? '-'} ETH`;

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
          ${Number((info?.oneDayFee ?? 0).toFixed(0)).toLocaleString()}
        </Typography>
      </Box>
      <Box className='row'>
        <Typography>Rewards</Typography>
        <Typography component='h4'>
          ${Number(rewards.toFixed(0)).toLocaleString()} / day
        </Typography>
      </Box>
      <Box className='row'>
        <Typography>TVL</Typography>
        <Typography component='h4'>{tvl}</Typography>
      </Box>
      <Box className='row'>
        <Typography>
          APR
          <HelpIcon />
        </Typography>
        <Typography component='h5'>{apyWithFee}%</Typography>
      </Box>
      <Button
        fullWidth
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
