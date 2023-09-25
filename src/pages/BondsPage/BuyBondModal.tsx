import React, { useMemo, useState } from 'react';
import { Box, Button, Grid } from '@material-ui/core';
import { CustomModal } from 'components';
import BillImage from 'assets/images/bonds/hidden-bill.jpg';
import BondTokenDisplay from './BondTokenDisplay';
import { useTranslation } from 'react-i18next';
import { formatNumber } from 'utils';
import { useTokenBalance } from 'state/wallet/v3/hooks';
import { useActiveWeb3React } from 'hooks';
import { Token } from '@uniswap/sdk-core';
import { BigNumber } from 'ethers';

interface BuyBondModalProps {
  open: boolean;
  onClose: () => void;
  bond: any;
}

const BuyBondModal: React.FC<BuyBondModalProps> = ({ bond, open, onClose }) => {
  const token1Obj = bond.token;
  const token2Obj =
    bond.billType === 'reserve' ? bond.earnToken : bond.quoteToken;
  const token3Obj = bond.earnToken;
  const stakeLP = bond.billType !== 'reserve';
  const { t } = useTranslation();
  const { chainId, account } = useActiveWeb3React();
  const [buyAmount, setBuyAmount] = useState('');
  const discountEarnTokenPrice =
    bond && bond?.earnTokenPrice
      ? bond?.earnTokenPrice -
        bond?.earnTokenPrice * ((bond?.discount ?? '0') / 100)
      : 0;
  const buyToken = useMemo(() => {
    if (stakeLP) {
      if (
        bond.lpToken &&
        bond.lpToken.address &&
        bond.lpToken.address[chainId] &&
        bond.lpToken.decimals &&
        bond.lpToken.decimals[chainId]
      ) {
        return new Token(
          chainId,
          bond.lpToken.address[chainId],
          bond.lpToken.decimals[chainId],
          bond.lpToken.symbol,
        );
      }
      return;
    }
    if (
      token1Obj &&
      token1Obj.address &&
      token1Obj.address[chainId] &&
      token1Obj.decimals &&
      token1Obj.decimals[chainId]
    ) {
      return new Token(
        chainId,
        token1Obj.address[chainId],
        token1Obj.decimals[chainId],
        token1Obj.symbol,
      );
    }
    return;
  }, [bond.lpToken, chainId, stakeLP, token1Obj]);
  const balance = useTokenBalance(account, buyToken);
  const buyDisabled = useMemo(() => {
    if (Number(buyAmount) <= 0) return true;
    return false;
  }, [buyAmount]);
  const available = BigNumber.from(bond?.maxTotalPayOut ?? '0')
    .sub(BigNumber.from(bond?.totalPayoutGiven ?? '0'))
    .div(BigNumber.from(10).pow(token3Obj?.decimals?.[chainId] ?? 18));
  const thresholdToShow =
    bond && bond.earnTokenPrice && bond.earnTokenPrice > 0
      ? 5 / bond.earnTokenPrice
      : 0;
  const safeAvailable = Number(available) - thresholdToShow;
  const singlePurchaseLimit = Number(
    BigNumber.from(bond?.maxPayoutTokens ?? 0).div(
      BigNumber.from(10).pow(token3Obj?.decimals?.[chainId] ?? 18),
    ),
  );
  const displayAvailable =
    singlePurchaseLimit > safeAvailable ? singlePurchaseLimit : safeAvailable;

  return (
    <CustomModal open={open} onClose={onClose} modalWrapper='bondModalWrapper'>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={12} md={6}>
          <img src={BillImage} width='100%' />
        </Grid>
        <Grid item xs={12} sm={12} md={6}>
          <Box className='flex' mb={2}>
            <Box className='bondTypeTag'>{bond.billType}</Box>
          </Box>
          <Box className='flex items-center'>
            <BondTokenDisplay
              token1Obj={token1Obj}
              token2Obj={token2Obj}
              token3Obj={token3Obj}
              stakeLP={stakeLP}
            />
            <Box className='flex' mx='12px'>
              <h6 className='weight-600 text-gray32'>
                {token1Obj?.symbol}
                {stakeLP ? `/${token2Obj?.symbol}` : ''}
              </h6>
            </Box>
          </Box>
          <Box mt={2}>
            <small className='text-secondary'>
              {bond.earnToken?.symbol} {t('marketPrice')}&nbsp;
              <span style={{ textDecoration: 'line-through' }}>
                ${formatNumber(bond?.earnTokenPrice ?? 0)}
              </span>
            </small>
            <Box mt='4px' className='flex items-center'>
              <BondTokenDisplay token1Obj={bond.earnToken} />
              <Box ml={1}>
                <h4 className='font-bold text-white'>
                  ${formatNumber(discountEarnTokenPrice)} (
                  {formatNumber(bond?.discount ?? 0)}% {t('discount')})
                </h4>
              </Box>
            </Box>
            <Box className='bondInputWrapper'>
              <Box className='flex items-center'>
                <input
                  placeholder='0.00'
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                />
                <Box className='bondBuyLPWrapper'>
                  <BondTokenDisplay
                    token1Obj={token1Obj}
                    token2Obj={token2Obj}
                    stakeLP={stakeLP}
                    size={24}
                  />
                  <p className='weight-600 text-gray32'>
                    {token1Obj?.symbol}
                    {stakeLP ? `/${token2Obj?.symbol}` : ''}
                  </p>
                </Box>
              </Box>
              <Box className='flex justify-end items-center' mt='8px'>
                <small>
                  Balance: {formatNumber(Number(balance?.toExact() ?? 0))}
                </small>
                <Box
                  className='bondBuyMaxButton'
                  ml='5px'
                  onClick={() => {
                    setBuyAmount(balance?.toExact() ?? '0');
                  }}
                >
                  {t('max')}
                </Box>
              </Box>
            </Box>
            <Box my='12px' className='flex justify-between'>
              <small>
                {t('bondValue')} {bond.price}
              </small>
              <small>
                {t('maxPerBond')} {formatNumber(displayAvailable)}{' '}
                {bond?.earnToken?.symbol}
              </small>
            </Box>
            <Box className='bondModalButtonsWrapper'>
              <Button>
                {t('get')} {stakeLP ? 'LP' : token1Obj?.symbol}
              </Button>
              <Button disabled={buyDisabled}>{t('buy')}</Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </CustomModal>
  );
};

export default BuyBondModal;
