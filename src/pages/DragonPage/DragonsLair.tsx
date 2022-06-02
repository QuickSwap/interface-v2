import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { useLairInfo } from 'state/stake/hooks';
import { CurrencyLogo, StakeQuickModal, UnstakeQuickModal } from 'components';
import { ReactComponent as PriceExchangeIcon } from 'assets/images/PriceExchangeIcon.svg';
import { formatTokenAmount, returnTokenFromKey, useLairDQUICKAPY } from 'utils';
import { useUSDCPriceToken } from 'utils/useUSDCPrice';
import { useTranslation } from 'react-i18next';

const DragonsLair: React.FC = () => {
  const quickPrice = useUSDCPriceToken(returnTokenFromKey('QUICK'));
  const dQUICKPrice = useUSDCPriceToken(returnTokenFromKey('DQUICK'));
  const dQUICKtoQUICK = dQUICKPrice / quickPrice;
  const QUICKtodQUICK = quickPrice / dQUICKPrice;
  const [isQUICKRate, setIsQUICKRate] = useState(false);
  const [openStakeModal, setOpenStakeModal] = useState(false);
  const [openUnstakeModal, setOpenUnstakeModal] = useState(false);
  const lairInfo = useLairInfo();
  const APY = useLairDQUICKAPY(lairInfo);
  const { t } = useTranslation();

  return (
    <Box position='relative' zIndex={3}>
      {openStakeModal && (
        <StakeQuickModal
          open={openStakeModal}
          onClose={() => setOpenStakeModal(false)}
        />
      )}
      {openUnstakeModal && (
        <UnstakeQuickModal
          open={openUnstakeModal}
          onClose={() => setOpenUnstakeModal(false)}
        />
      )}
      <Box display='flex'>
        <CurrencyLogo currency={returnTokenFromKey('QUICK')} size='32px' />
        <Box ml={1.5}>
          <p className='small line-height-1'>QUICK</p>
          <span className='text-hint'>{t('stakeQUICKTitle')}</span>
        </Box>
      </Box>
      <Box className='dragonLairRow'>
        <small>{t('total')} QUICK</small>
        <small>
          {lairInfo
            ? lairInfo.totalQuickBalance.toFixed(2, {
                groupSeparator: ',',
              })
            : 0}
        </small>
      </Box>
      <Box className='dragonLairRow'>
        <small>{t('tvl')}</small>
        <small>
          $
          {(
            Number(lairInfo.totalQuickBalance.toExact()) * quickPrice
          ).toLocaleString()}
        </small>
      </Box>
      <Box className='dragonLairRow'>
        <small>{t('apy')}</small>
        <small className='text-success'>{APY}%</small>
      </Box>
      <Box className='dragonLairRow'>
        <small>{t('yourdeposits')}</small>
        <small>{formatTokenAmount(lairInfo.QUICKBalance)}</small>
      </Box>
      <Box className='quickTodQuick border-secondary1'>
        <CurrencyLogo currency={returnTokenFromKey('QUICK')} />
        <small style={{ margin: '0 8px' }}>
          {isQUICKRate ? 1 : dQUICKtoQUICK.toLocaleString()} QUICK =
        </small>
        <CurrencyLogo currency={returnTokenFromKey('QUICK')} />
        <small style={{ margin: '0 8px' }}>
          {isQUICKRate ? QUICKtodQUICK.toLocaleString() : 1} dQUICK
        </small>
        <PriceExchangeIcon
          className='cursor-pointer'
          onClick={() => setIsQUICKRate(!isQUICKRate)}
        />
      </Box>
      <Box
        className='stakeButton bg-primary'
        onClick={() => setOpenStakeModal(true)}
      >
        <small>{t('stake')}</small>
      </Box>
      <Box
        className='stakeButton bg-transparent'
        onClick={() => setOpenUnstakeModal(true)}
      >
        <small>{t('unstake')}</small>
      </Box>
      <Box mt={3} textAlign='center'>
        <span className='text-secondary'>{t('unstakeQUICKDesc')}</span>
      </Box>
    </Box>
  );
};

export default DragonsLair;
