import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Button } from '@mui/material';
import { Pair, JSBI, Percent, ChainId } from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { useTokenBalance } from 'state/wallet/hooks';
import { useTotalSupply } from 'data/TotalSupply';
import { CurrencyLogo, RemoveLiquidityModal } from 'components';
import { currencyId, formatTokenAmount } from 'utils';
import { useTranslation } from 'next-i18next';
import styles from 'styles/components/PoolPositionCard.module.scss';

const PoolPositionCardDetails: React.FC<{ pair: Pair }> = ({ pair }) => {
  const { t } = useTranslation();
  const router = useRouter();

  const { account, chainId } = useActiveWeb3React();
  const [openRemoveModal, setOpenRemoveModal] = useState(false);

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
      <Box className={styles.poolPositionCardDetails}>
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

        <Box className='cardRow'>
          <small>{t('yourPoolShare')}:</small>
          <small>
            {poolTokenPercentage
              ? poolTokenPercentage.toSignificant() + '%'
              : '-'}
          </small>
        </Box>

        <Box className={styles.poolButtonRow}>
          <Button
            variant='outlined'
            className={styles.viewAnalyticsButton}
            onClick={() =>
              router.push(
                `/analytics/v2/pair?id=${pair.liquidityToken.address}`,
              )
            }
          >
            <small>{t('viewAnalytics')}</small>
          </Button>
          <Button
            className={styles.poolPositionButton}
            onClick={() => {
              router.push(
                `/pools/v2?currency0=${currencyId(
                  currency0,
                  chainId ? chainId : ChainId.MATIC,
                )}&currency1=${currencyId(
                  currency1,
                  chainId ? chainId : ChainId.MATIC,
                )}`,
              );
            }}
          >
            <small>{t('add')}</small>
          </Button>
          <Button
            className={styles.poolPositionButton}
            onClick={() => {
              setOpenRemoveModal(true);
            }}
          >
            <small>{t('remove')}</small>
          </Button>
        </Box>
      </Box>
      {openRemoveModal && (
        <RemoveLiquidityModal
          currency0={currency0}
          currency1={currency1}
          open={openRemoveModal}
          onClose={() => setOpenRemoveModal(false)}
        />
      )}
    </>
  );
};

export default PoolPositionCardDetails;
