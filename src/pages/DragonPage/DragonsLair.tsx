import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { useOldLairInfo, useNewLairInfo } from 'state/stake/hooks';
import { CurrencyLogo, StakeQuickModal, UnstakeQuickModal } from 'components';
import { ReactComponent as PriceExchangeIcon } from 'assets/images/PriceExchangeIcon.svg';
import { formatTokenAmount, useLairDQUICKAPY } from 'utils';
import { useUSDCPriceFromAddress } from 'utils/useUSDCPrice';
import { useTranslation } from 'react-i18next';
import { useActiveWeb3React } from 'hooks';
import { ChainId } from '@uniswap/sdk';
import {
  DLDQUICK,
  DLQUICK,
  OLD_DQUICK,
  OLD_QUICK,
} from 'constants/v3/addresses';

const DragonsLair: React.FC<{ isNew: boolean }> = ({ isNew }) => {
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ? chainId : ChainId.MATIC;

  const quickToken = isNew ? DLQUICK[chainIdToUse] : OLD_QUICK[chainIdToUse];
  const dQuickToken = isNew ? DLDQUICK[chainIdToUse] : OLD_DQUICK[chainIdToUse];
  const { price: quickPrice } = useUSDCPriceFromAddress(quickToken.address);
  const [isQUICKRate, setIsQUICKRate] = useState(false);
  const [openStakeModal, setOpenStakeModal] = useState(false);
  const [openUnstakeModal, setOpenUnstakeModal] = useState(false);
  const lairInfo = useOldLairInfo();
  const newLairInfo = useNewLairInfo();
  const lairInfoToUse = isNew ? newLairInfo : lairInfo;
  const APY = useLairDQUICKAPY(isNew, lairInfoToUse);
  const dQUICKtoQUICK = lairInfoToUse?.dQUICKtoQUICK?.toFixed(4, {
    groupSeparator: ',',
  });
  const QUICKtodQUICK = lairInfoToUse?.QUICKtodQUICK?.toFixed(4, {
    groupSeparator: ',',
  });
  const { t } = useTranslation();

  return (
    <Box position='relative' zIndex={3}>
      {openStakeModal && (
        <StakeQuickModal
          open={openStakeModal}
          onClose={() => setOpenStakeModal(false)}
          isNew={isNew}
        />
      )}
      {openUnstakeModal && (
        <UnstakeQuickModal
          open={openUnstakeModal}
          onClose={() => setOpenUnstakeModal(false)}
          isNew={isNew}
        />
      )}
      <Box display='flex' mb={3}>
        <CurrencyLogo currency={quickToken} size='32px' />
        <Box ml={1.5}>
          <p className='small line-height-1'>{quickToken?.symbol}</p>
          <span className='text-hint'>{t('stakeQUICKTitle')}</span>
        </Box>
      </Box>
      <Box className='dragonLairRow'>
        <small>
          {t('total')} {quickToken?.symbol}
        </small>
        <small>
          {lairInfoToUse
            ? lairInfoToUse.totalQuickBalance.toFixed(2, {
                groupSeparator: ',',
              })
            : 0}
        </small>
      </Box>
      <Box className='dragonLairRow'>
        <small>{t('tvl')}</small>
        <small>
          $
          {lairInfoToUse && quickPrice
            ? (
                Number(lairInfoToUse.totalQuickBalance.toExact()) * quickPrice
              ).toLocaleString('us')
            : 0}
        </small>
      </Box>

      {isNew && (
        <Box className='dragonLairRow'>
          <small>{t('apy')}</small>
          <small className='text-success'> {APY}%</small>
        </Box>
      )}

      <Box className='dragonLairRow'>
        <small>{t('yourdeposits')}</small>
        <small>{formatTokenAmount(lairInfoToUse?.QUICKBalance)}</small>
      </Box>
      <Box className='quickTodQuick border-secondary1'>
        <CurrencyLogo currency={quickToken} />
        <small style={{ margin: '0 8px' }}>
          {isQUICKRate ? 1 : Number(dQUICKtoQUICK).toLocaleString('us')}{' '}
          {quickToken?.symbol} =
        </small>
        <CurrencyLogo currency={quickToken} />
        <small style={{ margin: '0 8px' }}>
          {isQUICKRate ? Number(QUICKtodQUICK).toLocaleString('us') : 1}{' '}
          {dQuickToken?.symbol}
        </small>
        <PriceExchangeIcon
          className='cursor-pointer'
          onClick={() => setIsQUICKRate(!isQUICKRate)}
        />
      </Box>
      {isNew && (
        <Box
          className='stakeButton bg-primary'
          onClick={() => setOpenStakeModal(true)}
        >
          <small>{t('stake')}</small>
        </Box>
      )}
      <Box
        className='stakeButton bg-transparent'
        onClick={() => setOpenUnstakeModal(true)}
      >
        <small>{t('unstake')}</small>
      </Box>
      <Box mt={3} textAlign='center'>
        <span className='text-secondary'>
          {t('unstakeQUICKDesc', { symbol: quickToken.symbol })}
        </span>
      </Box>
    </Box>
  );
};

export default DragonsLair;
