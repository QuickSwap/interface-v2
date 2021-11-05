import React, { useState } from 'react';
import { Box, Typography, Button } from '@material-ui/core';
import { ChevronDown, ChevronUp } from 'react-feather';
import { Pair, JSBI, Percent } from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { useTokenBalance } from 'state/wallet/hooks';
import { useTotalSupply } from 'data/TotalSupply';
import { CurrencyLogo, DoubleCurrencyLogo } from 'components';

const PoolPositionCard: React.FC<{pair: Pair}> = ({ pair }) => {
  const { account } = useActiveWeb3React()

  const currency0 = unwrappedToken(pair.token0)
  const currency1 = unwrappedToken(pair.token1)

  const [showMore, setShowMore] = useState(false)

  const userPoolBalance = useTokenBalance(account ?? undefined, pair.liquidityToken)
  const totalPoolTokens = useTotalSupply(pair.liquidityToken)

  const poolTokenPercentage =
    !!userPoolBalance && !!totalPoolTokens && JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
      : undefined

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
          pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false)
        ]
      : [undefined, undefined]

  return (
    <Box>
      <Box>
        <Box>
          <DoubleCurrencyLogo currency0={currency0} currency1={currency1} margin={true} size={20} />
          <Typography>
            {!currency0 || !currency1 ? 'Loading' : `${currency0.symbol}/${currency1.symbol}`}
          </Typography>
        </Box>

        <Box>
          <Box
            padding="6px 8px"
            borderRadius="12px"
            onClick={() => setShowMore(!showMore)}
          >
            {showMore ? (
              <>
                {' '}
                Manage
                <ChevronUp size="20" style={{ marginLeft: '10px' }} />
              </>
            ) : (
              <>
                Manage
                <ChevronDown size="20" style={{ marginLeft: '10px' }} />
              </>
            )}
          </Box>
        </Box>
      </Box>

      {showMore && (
        <Box>
          <Box>
            <Typography>
              Your pool tokens:
            </Typography>
            <Typography>
              {userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}
            </Typography>
          </Box>
          <Box>
            <Box>
              <Typography>
                Pooled {currency0.symbol}:
              </Typography>
            </Box>
            {token0Deposited ? (
              <Box>
                <Typography>
                  {token0Deposited?.toSignificant(6)}
                </Typography>
                <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={currency0} />
              </Box>
            ) : (
              '-'
            )}
          </Box>

          <Box>
            <Box>
              <Typography>
                Pooled {currency1.symbol}:
              </Typography>
            </Box>
            {token1Deposited ? (
              <Box>
                <Typography>
                  {token1Deposited?.toSignificant(6)}
                </Typography>
                <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={currency1} />
              </Box>
            ) : (
              '-'
            )}
          </Box>

          <Box>
            <Typography>
              Your pool share:
            </Typography>
            <Typography>
              {poolTokenPercentage ? poolTokenPercentage.toFixed(2) + '%' : '-'}
            </Typography>
          </Box>

          <Button>
            <a
              style={{ width: '100%', textAlign: 'center' }}
              href={`https://info.quickswap.exchange/account/${account}`}
            >
              View accrued fees and analytics<span style={{ fontSize: '11px' }}>↗</span>
            </a>
          </Button>
          <Box marginTop="10px">
            <Button
              // padding="8px"
              // borderRadius="8px"
              // as={Link}
              // to={`/add/${currencyId(currency0)}/${currencyId(currency1)}`}
            >
              Add
            </Button>
            <Button
              // padding="8px"
              // borderRadius="8px"
              // as={Link}
              // width="48%"
              // to={`/remove/${currencyId(currency0)}/${currencyId(currency1)}`}
            >
              Remove
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default PoolPositionCard;
