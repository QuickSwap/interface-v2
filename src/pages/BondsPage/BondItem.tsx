import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button } from '@material-ui/core';
import { QuestionHelper } from 'components';
import BuyBondModal from './BuyBondModal';
import BondTokenDisplay from './BondTokenDisplay';
import { formatCompact, formatNumber } from 'utils';
import { useActiveWeb3React } from 'hooks';
import { BigNumber } from 'ethers';

interface BondItemProps {
  bond: any;
}

const BondItem: React.FC<BondItemProps> = ({ bond }) => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const [openModal, setOpenModal] = useState(false);

  const token1Obj = bond.token;
  const token2Obj =
    bond.billType === 'reserve' ? bond.earnToken : bond.quoteToken;
  const token3Obj = bond.earnToken;
  const stakeLP = bond.billType !== 'reserve';
  const vestingDays = useMemo(() => {
    if (!bond || !bond.vestingTerm) return 0;
    return Math.floor(Number(bond.vestingTerm) / (3600 * 24));
  }, [bond]);
  const available = BigNumber.from(bond?.maxTotalPayOut ?? '0')
    .sub(BigNumber.from(bond?.totalPayoutGiven ?? '0'))
    .div(BigNumber.from(10).pow(token3Obj?.decimals?.[chainId] ?? '0'));
  const thresholdToShow =
    bond && bond.earnTokenPrice && bond.earnTokenPrice > 0
      ? 5 / bond.earnTokenPrice
      : 0;
  const displayAvailable = Number(available) - thresholdToShow;
  const dollarAvailable =
    bond?.earnTokenPrice ?? 0 * (Number(displayAvailable) ?? 0);
  const availableTokensTooltip = `${formatNumber(displayAvailable)} ${
    bond?.earnToken?.symbol
  } ($${formatNumber(dollarAvailable)})`;

  return (
    <Box mb={2} className='bondItemWrapper'>
      <BuyBondModal
        bond={bond}
        open={openModal}
        onClose={() => setOpenModal(false)}
      />
      <Box className='flex items-center' width='30%'>
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
          </h6>
        </Box>
      </Box>
      <Box width='20%'>
        <Box className='flex items-center'>
          <small>{t('discount')}</small>
          <Box className='flex' ml='5px'>
            <QuestionHelper text={t('bondDiscountTooltip')} size={16} />
          </Box>
        </Box>
        <Box className='flex items-end'>
          <p className={bond.discount > 0 ? 'text-success' : 'text-error'}>
            {formatNumber(bond.discount)}%
          </p>
          <Box className='flex' margin='0 0 3px 4px'>
            <span className='text-secondary'>
              (${formatNumber(bond.priceUsd)})
            </span>
          </Box>
        </Box>
      </Box>
      <Box width='20%'>
        <Box className='flex items-center'>
          <small>{t('vestingTerm')}</small>
          <Box className='flex' ml='5px'>
            <QuestionHelper text={t('bondVestingTermTooltip')} size={16} />
          </Box>
        </Box>
        <Box className='flex'>
          <p>{vestingDays} days</p>
        </Box>
      </Box>
      <Box width='20%'>
        <Box className='flex items-center'>
          <small>{t('availableTokens')}</small>
          <Box className='flex' ml='5px'>
            <QuestionHelper text={availableTokensTooltip} size={16} />
          </Box>
        </Box>
        <Box className='flex'>
          <p>{formatCompact(displayAvailable, 0)}</p>
        </Box>
      </Box>
      <Box width='10%'>
        <Button fullWidth onClick={() => setOpenModal(true)}>
          {t('buy')}
        </Button>
      </Box>
    </Box>
  );
};

export default BondItem;
