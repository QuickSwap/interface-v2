import React from 'react';
import { Box } from '@material-ui/core';
import { useNewLairInfo } from 'state/stake/hooks';
import { CurrencyLogo } from 'components';
import QUICKIcon from 'assets/images/quickIcon.svg';
import QUICKIconOld from 'assets/images/quickIconOld.svg';
import { useUSDCPriceFromAddress } from 'utils/useUSDCPrice';
import { useTranslation } from 'react-i18next';
import { useActiveWeb3React } from 'hooks';
import { ChainId } from '@uniswap/sdk';
import { DLDQUICK, DLQUICK, OLD_QUICK } from 'constants/v3/addresses';
import 'pages/styles/dragon.scss';
import { useTokenBalance } from 'state/wallet/hooks';

const DragonsInfo = () => {
  const { account, chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ? chainId : ChainId.MATIC;

  const quickToken = DLQUICK[chainIdToUse];
  const dQuickToken = DLDQUICK[chainIdToUse];
  const oldQuickToken = OLD_QUICK[chainIdToUse];
  const oldQuickBalance = useTokenBalance(account ?? undefined, oldQuickToken);
  const { price: quickPrice } = useUSDCPriceFromAddress(quickToken?.address);
  const { price: dQuickPrice } = useUSDCPriceFromAddress(dQuickToken?.address);
  const { price: oldQuickPrice } = useUSDCPriceFromAddress(
    oldQuickToken ? oldQuickToken.address : undefined,
  );
  const newLairInfo = useNewLairInfo();
  const lairInfoToUse = newLairInfo;
  const { t } = useTranslation();

  return (
    <Box
      position='relative'
      zIndex={3}
      className='dragonLairBg dragonInfoWrapper'
    >
      <Box className='dragonLairTitle'>
        <h5>{t('yourdragonlairbalance')}</h5>
      </Box>
      <Box marginBottom='32px'>
        <small className='text-dragon-gray uppercase sub-title'>
          {t('currentPrice')}
        </small>
        <Box className='tokenWrapper' marginTop='12px'>
          <p style={{ fontSize: '16px' }}>${quickPrice.toLocaleString('us')}</p>
          <small className='text-dragon-gray' style={{ fontSize: '12px' }}>
            USD / QUICK (NEW)
          </small>
        </Box>
      </Box>
      <hr />
      <Box>
        <small className='text-dragon-gray uppercase sub-title'>
          {t('available')}
        </small>
        <Box className='tokenInfo' marginBottom='15px'>
          <Box className='tokenWrapper'>
            <img src={QUICKIcon} alt='QUICK (NEW)' width='16px' height='16px' />
            <p>{t('quickNew')}</p>
          </Box>
          <Box textAlign='right'>
            <h5>
              {lairInfoToUse
                ? lairInfoToUse.QUICKBalance.toFixed(2, {
                    groupSeparator: ',',
                  })
                : 0}
            </h5>
            <small className='text-dragon-gray'>
              $
              {lairInfoToUse && quickPrice
                ? (
                    Number(lairInfoToUse.QUICKBalance.toExact()) * quickPrice
                  ).toLocaleString('us')
                : 0}
            </small>
          </Box>
        </Box>
        <Box className='tokenInfo'>
          <Box className='tokenWrapper'>
            <img
              src={QUICKIconOld}
              alt='QUICK (OLD)'
              width='16px'
              height='16px'
            />
            <p>{t('quickOld')}</p>
          </Box>
          <Box textAlign='right'>
            <h5>
              {oldQuickBalance
                ? oldQuickBalance.toFixed(2, {
                    groupSeparator: ',',
                  })
                : 0}
            </h5>
            <small className='text-dragon-gray'>
              $
              {oldQuickBalance && oldQuickPrice
                ? (
                    Number(oldQuickBalance.toExact()) * oldQuickPrice
                  ).toLocaleString('us')
                : 0}
            </small>
          </Box>
        </Box>
      </Box>
      <hr />
      <Box>
        <small className='text-dragon-gray uppercase sub-title'>
          {t('staked')}
        </small>
        <Box className='tokenInfo'>
          <Box className='tokenWrapper'>
            <CurrencyLogo currency={dQuickToken} size='16px' />
            <p>{dQuickToken?.symbol}</p>
          </Box>
          <Box textAlign='right'>
            <h5>
              {lairInfoToUse
                ? lairInfoToUse.dQUICKBalance.toFixed(2, {
                    groupSeparator: ',',
                  })
                : 0}
            </h5>
            <small className='text-dragon-gray'>
              $
              {lairInfoToUse && quickPrice
                ? (
                    Number(lairInfoToUse.dQUICKBalance.toExact()) * dQuickPrice
                  ).toLocaleString('us')
                : 0}
            </small>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DragonsInfo;
