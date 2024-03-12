import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, useMediaQuery, useTheme } from '@material-ui/core';
import { QuestionHelper } from 'components';
import BuyBondModal from './BuyBondModal';
import BondTokenDisplay from './BondTokenDisplay';
import { formatCompact, formatNumber } from 'utils';
import { useActiveWeb3React } from 'hooks';
import { BigNumber } from 'ethers';
import { Bond } from 'types/bond';
import { Skeleton } from '@material-ui/lab';
import { formatUnits } from 'ethers/lib/utils';

interface BondItemProps {
  bond: Bond;
}

const BondItem: React.FC<BondItemProps> = ({ bond }) => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const [openModal, setOpenModal] = useState(false);
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const isTablet = useMediaQuery(breakpoints.down('sm'));

  const token1Obj = bond.token;
  const token2Obj =
    bond.billType === 'reserve' ? bond.earnToken : bond.quoteToken;
  const token3Obj = bond.earnToken;
  const stakeLP = bond.billType !== 'reserve';
  const vestingDays = useMemo(() => {
    if (!bond || !bond.vestingTerm) return 0;
    return Math.floor(Number(bond.vestingTerm) / (3600 * 24));
  }, [bond]);
  const available = Number(
    formatUnits(
      BigNumber.from(bond?.maxTotalPayOut ?? '0').sub(
        BigNumber.from(bond?.totalPayoutGiven ?? '0'),
      ),
      token3Obj?.decimals?.[chainId] ?? undefined,
    ),
  );
  const thresholdToShow =
    bond && bond.earnTokenPrice && bond.earnTokenPrice > 0
      ? 5 / bond.earnTokenPrice
      : 0;
  const thresholdToHide =
    bond && bond.earnTokenPrice && bond.earnTokenPrice > 0
      ? 100 / bond.earnTokenPrice
      : 0;
  const displayAvailable = available - thresholdToShow;
  const dollarAvailable =
    (bond?.earnTokenPrice ?? 0) * (Number(displayAvailable) ?? 0);
  const availableTokensTooltip = `${formatNumber(displayAvailable)} ${
    bond?.earnToken?.symbol
  } ($${formatNumber(dollarAvailable)})`;

  const disabled = bond.soldOut
    ? true
    : bond.maxTotalPayOut && bond.totalPayoutGiven && bond.earnTokenPrice
    ? available <= thresholdToHide || Number(bond.discount) === 100
    : false;

  return (
    <Box mb={2} className='bondItemWrapper'>
      {openModal && (
        <BuyBondModal
          bond={bond}
          open={openModal}
          onClose={() => setOpenModal(false)}
        />
      )}
      <Box
        className='flex items-center'
        width={isMobile ? '100%' : isTablet ? '50%' : '30%'}
        my='6px'
      >
        <BondTokenDisplay
          token1Obj={token1Obj}
          token2Obj={token2Obj}
          token3Obj={token3Obj}
          stakeLP={stakeLP}
        />
        <Box className='flex flex-col items-start' ml={2}>
          <Box className='bondTypeTag'>{bond.billType}</Box>
          <h6>
            {token1Obj?.symbol}
            {stakeLP ? `/${token2Obj?.symbol}` : ''}
            {` -> `}
            {stakeLP ? token3Obj?.symbol : token2Obj?.symbol}
          </h6>
        </Box>
      </Box>
      <Box
        width={isMobile ? '100%' : isTablet ? '50%' : '20%'}
        my='6px'
        className={isMobile ? 'flex items-center justify-between' : ''}
      >
        <Box className='flex items-center'>
          <small>{t('discount')}</small>
          <Box className='flex' ml='5px'>
            <QuestionHelper text={t('bondDiscountTooltip')} size={16} />
          </Box>
        </Box>
        {bond.loading ? (
          <Skeleton width={80} height={20} />
        ) : (
          <Box className='flex items-end'>
            <p
              className={
                bond.discount && bond.discount > 0
                  ? 'text-success'
                  : 'text-error'
              }
            >
              {formatNumber(bond.discount)}%
            </p>
            <Box className='flex' margin='0 0 3px 4px'>
              <span className='text-secondary'>
                (${formatNumber(bond.priceUsd)})
              </span>
            </Box>
          </Box>
        )}
      </Box>
      <Box
        width={isMobile ? '100%' : isTablet ? '50%' : '20%'}
        my='6px'
        className={isMobile ? 'flex items-center justify-between' : ''}
      >
        <Box className='flex items-center'>
          <small>{t('vestingTerm')}</small>
          <Box className='flex' ml='5px'>
            <QuestionHelper text={t('bondVestingTermTooltip')} size={16} />
          </Box>
        </Box>
        <Box className='flex'>
          {bond.loading ? (
            <Skeleton width={50} height={20} />
          ) : (
            <p>
              {vestingDays} {t('days')}
            </p>
          )}
        </Box>
      </Box>
      <Box
        width={isMobile ? '100%' : isTablet ? '50%' : '20%'}
        my='6px'
        className={isMobile ? 'flex items-center justify-between' : ''}
      >
        <Box className='flex items-center'>
          <small>{t('availableTokens')}</small>
          {!bond.loading && (
            <Box className='flex' ml='5px'>
              <QuestionHelper text={availableTokensTooltip} size={16} />
            </Box>
          )}
        </Box>
        <Box className='flex'>
          {bond.loading ? (
            <Skeleton width={50} height={20} />
          ) : (
            <p>{formatCompact(displayAvailable, 0)}</p>
          )}
        </Box>
      </Box>
      <Box width={isTablet ? '100%' : '10%'} my='6px'>
        <Button
          disabled={disabled || !bond.discount}
          onClick={() => setOpenModal(true)}
        >
          {disabled ? t('soldout') : t('buy')}
        </Button>
      </Box>
    </Box>
  );
};

export default BondItem;
