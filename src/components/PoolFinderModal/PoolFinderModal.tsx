import React, { useState, useEffect, useCallback } from 'react';
import { Currency, TokenAmount, ETHER, JSBI, ChainId } from '@uniswap/sdk';
import { ArrowLeft, Plus } from 'react-feather';
import { Box } from '@mui/material';
import {
  CustomModal,
  CurrencyLogo,
  CurrencySearchModal,
  MinimalPositionCard,
} from 'components';
import { useTokenBalance } from 'state/wallet/hooks';
import { usePair, PairState } from 'data/Reserves';
import { usePairAdder } from 'state/user/hooks';
import { useActiveWeb3React } from 'hooks';
import { currencyId } from 'utils';
import { Close } from '@mui/icons-material';
import Link from 'next/link';
import styles from 'styles/components/PoolFinderModal.module.scss';
import { useTranslation } from 'next-i18next';

enum Fields {
  TOKEN0 = 0,
  TOKEN1 = 1,
}

interface PoolFinderModalProps {
  open: boolean;
  onClose: () => void;
}

const PoolFinderModal: React.FC<PoolFinderModalProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const { account, chainId } = useActiveWeb3React();

  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [activeField, setActiveField] = useState<number>(Fields.TOKEN1);
  const chainIdToUse = chainId ? chainId : ChainId.MATIC;
  const nativeCurrency = ETHER[chainIdToUse];
  const [currency0, setCurrency0] = useState<Currency | null>(nativeCurrency);
  const [currency1, setCurrency1] = useState<Currency | null>(null);

  const [pairState, pair] = usePair(
    currency0 ?? undefined,
    currency1 ?? undefined,
  );
  const addPair = usePairAdder();
  useEffect(() => {
    if (pair) {
      addPair(pair);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pair?.liquidityToken.address, addPair]);

  const validPairNoLiquidity: boolean =
    pairState === PairState.NOT_EXISTS ||
    Boolean(
      pairState === PairState.EXISTS &&
        pair &&
        JSBI.equal(pair.reserve0.raw, JSBI.BigInt(0)) &&
        JSBI.equal(pair.reserve1.raw, JSBI.BigInt(0)),
    );

  const position: TokenAmount | undefined = useTokenBalance(
    account ?? undefined,
    pair?.liquidityToken,
  );
  const hasPosition = Boolean(
    position && JSBI.greaterThan(position.raw, JSBI.BigInt(0)),
  );

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      if (activeField === Fields.TOKEN0) {
        setCurrency0(currency);
      } else {
        setCurrency1(currency);
      }
    },
    [activeField],
  );

  const handleSearchDismiss = useCallback(() => {
    setShowSearch(false);
  }, [setShowSearch]);

  return (
    <CustomModal open={open} onClose={onClose}>
      <Box paddingX={3} paddingY={4}>
        <Box className='flex items-center justify-between'>
          <ArrowLeft
            className='cursor-pointer text-secondary'
            onClick={onClose}
          />
          <h6>{t('importPool')}</h6>
          <Close className='cursor-pointer' onClick={onClose} />
        </Box>
        <Box
          mt={2}
          className={styles.borderedCard}
          onClick={() => {
            setShowSearch(true);
            setActiveField(Fields.TOKEN0);
          }}
        >
          {currency0 ? (
            <Box className='flex items-center'>
              <CurrencyLogo currency={currency0} size='20px' />
              <p className='weight-600' style={{ marginLeft: 6 }}>
                {currency0.symbol}
              </p>
            </Box>
          ) : (
            <p className='weight-600'>{t('selectToken')}</p>
          )}
        </Box>
        <Box my={1} className='flex justify-center'>
          <Plus size='20' className='text-secondary' />
        </Box>
        <Box
          className={styles.borderedCard}
          onClick={() => {
            setShowSearch(true);
            setActiveField(Fields.TOKEN1);
          }}
        >
          {currency1 ? (
            <Box display='flex'>
              <CurrencyLogo currency={currency1} />
              <p className='weight-600' style={{ marginLeft: 6 }}>
                {currency1.symbol}
              </p>
            </Box>
          ) : (
            <p className='weight-600'>{t('selectToken')}</p>
          )}
        </Box>
        {hasPosition && (
          <Box textAlign='center' mt={2}>
            <p>{t('poolFound')}!</p>
            <p className='cursor-pointer text-primary' onClick={onClose}>
              {t('manageThisPool')}.
            </p>
          </Box>
        )}
        <Box className={`border ${styles.poolFinderInfo}`}>
          {currency0 && currency1 ? (
            pairState === PairState.EXISTS ? (
              hasPosition && pair ? (
                <MinimalPositionCard pair={pair} border='none' />
              ) : (
                <Box textAlign='center'>
                  <p>{t('noLiquidityinPool')}.</p>
                  <Link
                    href={`/pools?currency0=${currencyId(
                      currency0,
                      chainId ? chainId : ChainId.MATIC,
                    )}&currency1=${currencyId(
                      currency1,
                      chainId ? chainId : ChainId.MATIC,
                    )}`}
                    className='text-primary no-decoration'
                    onClick={onClose}
                  >
                    <p>{t('addLiquidity')}.</p>
                  </Link>
                </Box>
              )
            ) : validPairNoLiquidity ? (
              <Box textAlign='center'>
                <p>{t('nopoolFound')}.</p>
                <Link
                  href={`/pools?currency0=${currencyId(
                    currency0,
                    chainId ? chainId : ChainId.MATIC,
                  )}&currency1=${currencyId(
                    currency1,
                    chainId ? chainId : ChainId.MATIC,
                  )}`}
                  className='text-primary no-decoration'
                  onClick={onClose}
                >
                  {t('createPool')}.
                </Link>
              </Box>
            ) : pairState === PairState.INVALID ? (
              <p>{t('invalidPair')}.</p>
            ) : pairState === PairState.LOADING ? (
              <p>{t('loading')}...</p>
            ) : null
          ) : (
            <p>
              {!account
                ? t('connectWalletToFindPool')
                : t('selectTokenFindLiquidity')}
            </p>
          )}
        </Box>
      </Box>
      {showSearch && (
        <CurrencySearchModal
          isOpen={showSearch}
          onCurrencySelect={handleCurrencySelect}
          onDismiss={handleSearchDismiss}
          showCommonBases
          selectedCurrency={
            (activeField === Fields.TOKEN0 ? currency1 : currency0) ?? undefined
          }
        />
      )}
    </CustomModal>
  );
};

export default PoolFinderModal;
