import React from 'react';
import { useRouter } from 'next/router';
import { Box, Button } from '@mui/material';
import { Pair, JSBI, Percent } from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { useTokenBalance } from 'state/wallet/hooks';
import { useTotalSupply } from 'data/TotalSupply';
import { CurrencyLogo } from 'components';
import { formatTokenAmount } from 'utils';
import { useTranslation } from 'next-i18next';
import styles from 'styles/pages/Migrate.module.scss';

const V2PositionCardDetails: React.FC<{ pair: Pair }> = ({ pair }) => {
  const { t } = useTranslation();
  const router = useRouter();

  const { account } = useActiveWeb3React();

  const currency0 = unwrappedToken(pair.token0);
  const currency1 = unwrappedToken(pair.token1);

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
    <>
      <Box className={styles.migratev2PositionCardDetails}>
        <Box className='cardRow'>
          <small>{t('yourPoolTokens')}:</small>
          <small>{formatTokenAmount(userPoolBalance)}</small>
        </Box>
        <Box className='cardRow'>
          <small>
            {t('pooled')} {currency0.symbol}:
          </small>
          <Box>
            <small>{formatTokenAmount(token0Deposited)}</small>
            <CurrencyLogo size='20px' currency={currency0} />
          </Box>
        </Box>

        <Box className='cardRow'>
          <small>
            {t('pooled')} {currency1.symbol}:
          </small>
          <Box>
            <small>{formatTokenAmount(token1Deposited)}</small>
            <CurrencyLogo size='20px' currency={currency1} />
          </Box>
        </Box>

        <Box className='cardRow' mb={3}>
          <small>{t('yourPoolShare')}:</small>
          <small>
            {poolTokenPercentage
              ? poolTokenPercentage.toSignificant() + '%'
              : '-'}
          </small>
        </Box>

        <Button
          className={styles.migratev2LiquidityButton}
          onClick={() =>
            router.push(
              `/migrate/detail?currencyIdA=${
                currency0.symbol?.toLowerCase() === 'matic'
                  ? 'ETH'
                  : pair.token0.address
              }&currencyIdB=${
                currency1.symbol?.toLowerCase() === 'matic'
                  ? 'ETH'
                  : pair.token1.address
              }`,
            )
          }
        >
          <small className='weight-600'>{t('migrateLiquidity1')}</small>
        </Button>
      </Box>
    </>
  );
};

export default V2PositionCardDetails;
