import { JSBI, Pair, Percent } from '@uniswap/sdk';
import React, { useState } from 'react';
import { Box, Typography, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ChevronDown, ChevronUp } from 'react-feather';
import { Link } from 'react-router-dom';
import { useTotalSupply } from 'data/TotalSupply';
import { useActiveWeb3React } from 'hooks';
import { useTokenBalance } from 'state/wallet/hooks';
import { currencyId, formatTokenAmount } from 'utils';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { CurrencyLogo, DoubleCurrencyLogo } from 'components';

const useStyles = makeStyles(({ palette }) => ({
  minimalCardWrapper: {
    width: '100%',
    borderRadius: 16,
    padding: 12,
    '& p': {
      fontSize: '16px !important',
      lineHeight: '24px !important',
    },
  },
}));

interface PositionCardProps {
  pair: Pair;
  showUnwrapped?: boolean;
  border?: string;
}

export const MinimalPositionCard: React.FC<PositionCardProps> = ({
  pair,
  border,
  showUnwrapped = false,
}) => {
  const { account } = useActiveWeb3React();
  const classes = useStyles();

  const currency0 = showUnwrapped ? pair.token0 : unwrappedToken(pair.token0);
  const currency1 = showUnwrapped ? pair.token1 : unwrappedToken(pair.token1);

  const [showMore, setShowMore] = useState(false);

  const userPoolBalance = useTokenBalance(
    account ?? undefined,
    pair.liquidityToken,
  );
  const totalPoolTokens = useTotalSupply(pair.liquidityToken);

  const poolTokenPercentage =
    !!userPoolBalance &&
    !!totalPoolTokens &&
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
      : undefined;

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
          pair.getLiquidityValue(
            pair.token0,
            totalPoolTokens,
            userPoolBalance,
            false,
          ),
          pair.getLiquidityValue(
            pair.token1,
            totalPoolTokens,
            userPoolBalance,
            false,
          ),
        ]
      : [undefined, undefined];

  return (
    <Box className={classes.minimalCardWrapper} border={border}>
      {userPoolBalance &&
      JSBI.greaterThan(userPoolBalance.raw, JSBI.BigInt(0)) ? (
        <Box>
          <Typography>Your position</Typography>
          <Box
            mt={0.75}
            display='flex'
            justifyContent='space-between'
            onClick={() => setShowMore(!showMore)}
          >
            <Box display='flex' alignItems='center'>
              <DoubleCurrencyLogo
                currency0={currency0}
                currency1={currency1}
                margin={true}
                size={20}
              />
              <Typography style={{ marginLeft: 6 }}>
                {currency0.symbol}/{currency1.symbol}
              </Typography>
            </Box>
            <Typography>{formatTokenAmount(userPoolBalance)}</Typography>
          </Box>
          <Box
            mt={0.75}
            display='flex'
            alignItems='center'
            justifyContent='space-between'
          >
            <Typography>Your pool share:</Typography>
            <Typography>
              {poolTokenPercentage ? poolTokenPercentage.toFixed(6) + '%' : '-'}
            </Typography>
          </Box>
          <Box
            mt={0.75}
            display='flex'
            alignItems='center'
            justifyContent='space-between'
          >
            <Typography>{currency0.symbol}:</Typography>
            <Typography>{formatTokenAmount(token0Deposited)}</Typography>
          </Box>
          <Box
            mt={0.75}
            display='flex'
            alignItems='center'
            justifyContent='space-between'
          >
            <Typography>{currency1.symbol}:</Typography>
            <Typography>{formatTokenAmount(token1Deposited)}</Typography>
          </Box>
        </Box>
      ) : (
        <Typography>
          <span role='img' aria-label='wizard-icon'>
            ⭐️
          </span>{' '}
          By adding liquidity you&apos;ll earn 0.25% of all trades on this pair
          proportional to your share of the pool. Fees are added to the pool,
          accrue in real time and can be claimed by withdrawing your liquidity.
        </Typography>
      )}
    </Box>
  );
};

const FullPositionCard: React.FC<PositionCardProps> = ({ pair }) => {
  const { account } = useActiveWeb3React();

  const currency0 = unwrappedToken(pair.token0);
  const currency1 = unwrappedToken(pair.token1);

  const [showMore, setShowMore] = useState(false);

  const userPoolBalance = useTokenBalance(
    account ?? undefined,
    pair.liquidityToken,
  );
  const totalPoolTokens = useTotalSupply(pair.liquidityToken);

  const poolTokenPercentage =
    !!userPoolBalance &&
    !!totalPoolTokens &&
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
      : undefined;

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
          pair.getLiquidityValue(
            pair.token0,
            totalPoolTokens,
            userPoolBalance,
            false,
          ),
          pair.getLiquidityValue(
            pair.token1,
            totalPoolTokens,
            userPoolBalance,
            false,
          ),
        ]
      : [undefined, undefined];

  return (
    <Box>
      <Box>
        <Box>
          <DoubleCurrencyLogo
            currency0={currency0}
            currency1={currency1}
            margin={true}
            size={20}
          />
          <Typography>
            {!currency0 || !currency1 ? (
              <Typography>Loading</Typography>
            ) : (
              `${currency0.symbol}/${currency1.symbol}`
            )}
          </Typography>
        </Box>

        <Button onClick={() => setShowMore(!showMore)}>
          {showMore ? (
            <>
              {' '}
              Manage
              <ChevronUp size='20' style={{ marginLeft: '10px' }} />
            </>
          ) : (
            <>
              Manage
              <ChevronDown size='20' style={{ marginLeft: '10px' }} />
            </>
          )}
        </Button>
      </Box>

      {showMore && (
        <Box>
          <Box>
            <Typography>Your pool tokens:</Typography>
            <Typography>{formatTokenAmount(userPoolBalance)}</Typography>
          </Box>
          <Box>
            <Typography>Pooled {currency0.symbol}:</Typography>
            <Box>
              <Typography>{formatTokenAmount(token0Deposited)}</Typography>
              <CurrencyLogo
                size='20px'
                style={{ marginLeft: '8px' }}
                currency={currency0}
              />
            </Box>
          </Box>

          <Box>
            <Typography>Pooled {currency1.symbol}:</Typography>
            <Box>
              <Typography>{formatTokenAmount(token1Deposited)}</Typography>
              <CurrencyLogo
                size='20px'
                style={{ marginLeft: '8px' }}
                currency={currency1}
              />
            </Box>
          </Box>

          <Box>
            <Typography>Your pool share:</Typography>
            <Typography>
              {poolTokenPercentage ? poolTokenPercentage.toFixed(2) + '%' : '-'}
            </Typography>
          </Box>

          <Button>
            <a
              style={{ width: '100%', textAlign: 'center' }}
              href={`https://info.quickswap.exchange/account/${account}`}
              target='_blank'
              rel='noreferrer'
            >
              View accrued fees and analytics
              <span style={{ fontSize: '11px' }}>↗</span>
            </a>
          </Button>
          <Box display='flex'>
            <Box width='48%'>
              <Link
                to={`/add/${currencyId(currency0)}/${currencyId(currency1)}`}
              >
                Add
              </Link>
            </Box>
            <Box width='48%'>
              <Link
                to={`/remove/${currencyId(currency0)}/${currencyId(currency1)}`}
              >
                Remove
              </Link>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default FullPositionCard;
