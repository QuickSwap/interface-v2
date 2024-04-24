import React, { useState } from 'react';
import { Box, Tab } from '@material-ui/core';
import { TabContext, TabList, TabPanel } from '@material-ui/lab';
import { useOldLairInfo, useNewLairInfo } from 'state/stake/hooks';
import { CurrencyLogo } from 'components';
import { ReactComponent as PriceExchangeIcon } from 'assets/images/matic.svg';
import QUICKIcon from 'assets/images/quickIcon.svg';
import QUICKIconOld from 'assets/images/quickIconOld.svg';
import { ReactComponent as QUICKV2Icon } from 'assets/images/QUICKV2.svg';
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
import 'pages/styles/dragon.scss';
import Badge, { BadgeVariant } from 'components/v3/Badge';
import { GlobalConst } from 'constants/index';
import { useTokenBalance } from 'state/wallet/hooks';

const DragonsLair = () => {
  const { account, chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ? chainId : ChainId.MATIC;
  const isNew = true;

  const quickToken = DLQUICK[chainIdToUse];
  const dQuickToken = DLDQUICK[chainIdToUse];
  const oldQuickToken = OLD_QUICK[chainIdToUse];
  const oldQuickBalance = useTokenBalance(account ?? undefined, oldQuickToken);
  const { price: quickPrice } = useUSDCPriceFromAddress(quickToken.address);
  const [isQUICKRate, setIsQUICKRate] = useState(false);
  const [tabValue, setTabValue] = useState('stake');
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

  const handleTabChange = (event: any, newValue: string) => {
    setTabValue(newValue);
  };

  const handleStake = (value: string) => {
    console.log(value);
  };

  return (
    <Box position='relative' zIndex={3} className='dragonLairBg'>
      <Box mb={3} className='dragonLairTitle'>
        <Box className='sub-title'>
          <h5>Manage QUICK</h5>
          <Badge
            variant={BadgeVariant.POSITIVE}
            text={`${APY}% APY`}
            textColor='text-success'
          />
        </Box>
        {tabValue !== 'convert' && (
          <Box className='quickTodQuick'>
            <CurrencyLogo currency={quickToken} size='16px' />
            <small style={{ margin: '0 8px' }}>
              {isQUICKRate ? 1 : Number(dQUICKtoQUICK).toLocaleString('us')}{' '}
              {quickToken?.symbol} =
            </small>
            <CurrencyLogo currency={dQuickToken} size='16px' />
            <small style={{ margin: '0 8px' }}>
              {isQUICKRate ? Number(QUICKtodQUICK).toLocaleString('us') : 1}{' '}
              {dQuickToken?.symbol}
            </small>
            <PriceExchangeIcon
              className='cursor-pointer'
              onClick={() => setIsQUICKRate(!isQUICKRate)}
            />
          </Box>
        )}
        {tabValue === 'convert' && (
          <Box className='quickTodQuick'>
            <img
              src={QUICKIconOld}
              alt='QUICK (OLD)'
              width='16px'
              height='16px'
            />
            <small style={{ margin: '0 8px' }}>1 QUICK (OLD) = </small>
            <img src={QUICKIcon} alt='QUICK (NEW)' width='16px' height='16px' />
            <small style={{ margin: '0 8px' }}>
              {GlobalConst.utils.QUICK_CONVERSION_RATE} QUICK (NEW)
            </small>
            <PriceExchangeIcon />
          </Box>
        )}
      </Box>
      <Box className='dragonWrapper-tab-container'>
        <TabContext value={tabValue}>
          <TabList
            onChange={handleTabChange}
            variant='fullWidth'
            className='border-dragon'
          >
            <Tab label='Stake' value='stake'></Tab>
            <Tab label='Unstake' value='unstake'></Tab>
            <Tab label='Convert' value='convert'></Tab>
          </TabList>

          <TabPanel value='stake'>
            <Box className='stake-wrapper'>
              <Box className='input-item'>
                <Box className='input-header'>
                  <p>{t('stake')}:</p>
                  <p>
                    {t('available')}:{' '}
                    {formatTokenAmount(lairInfoToUse?.QUICKBalance)}
                  </p>
                </Box>
                <Box className='input-wrapper'>
                  <p>100</p>
                  <Box display='flex' alignItems='center'>
                    <button className='max-button'>MAX</button>
                    <Box display='flex' alignItems='center'>
                      <CurrencyLogo currency={quickToken} />
                      <p className='token-name'>{quickToken?.symbol}</p>
                    </Box>
                  </Box>
                </Box>
              </Box>
              <Box className='input-item'>
                <Box className='input-header'>
                  <p>{t('receive')}:</p>
                  <p>
                    {t('available')}:{' '}
                    {formatTokenAmount(lairInfoToUse?.dQUICKBalance)}
                  </p>
                </Box>
                <Box className='input-wrapper'>
                  <p>100</p>
                  <Box display='flex' alignItems='center'>
                    <Box display='flex' alignItems='center'>
                      <CurrencyLogo currency={dQuickToken} />
                      <p className='token-name'>{dQuickToken?.symbol}</p>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </TabPanel>
          <TabPanel value='unstake'>
            <Box className='stake-wrapper'>
              <Box className='input-item'>
                <Box className='input-header'>
                  <p>{t('unstake')}:</p>
                  <p>
                    {t('available')}:{' '}
                    {formatTokenAmount(lairInfoToUse?.dQUICKBalance)}
                  </p>
                </Box>
                <Box className='input-wrapper'>
                  <p>100</p>
                  <Box display='flex' alignItems='center'>
                    <button className='max-button'>MAX</button>
                    <Box display='flex' alignItems='center'>
                      <CurrencyLogo currency={dQuickToken} />
                      <p className='token-name'>{dQuickToken?.symbol}</p>
                    </Box>
                  </Box>
                </Box>
              </Box>
              <Box className='input-item'>
                <Box className='input-header'>
                  <p>{t('receive')}:</p>
                  <p>
                    {t('available')}:{' '}
                    {formatTokenAmount(lairInfoToUse?.QUICKBalance)}
                  </p>
                </Box>
                <Box className='input-wrapper'>
                  <p>100</p>
                  <Box display='flex' alignItems='center'>
                    <Box display='flex' alignItems='center'>
                      <CurrencyLogo currency={quickToken} />
                      <p className='token-name'>{quickToken?.symbol}</p>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </TabPanel>
          <TabPanel value='convert'>
            <Box className='stake-wrapper'>
              <Box className='input-item'>
                <Box className='input-header'>
                  <p>{t('convert')}:</p>
                  <p>
                    {t('available')}: {formatTokenAmount(oldQuickBalance)}
                  </p>
                </Box>
                <Box className='input-wrapper'>
                  <p>0.45</p>
                  <Box display='flex' alignItems='center'>
                    <button className='max-button'>MAX</button>
                    <Box display='flex' alignItems='center'>
                      <img
                        src={QUICKIconOld}
                        alt='QUICK (OLD)'
                        width='24px'
                        height='24px'
                      />
                      <p className='token-name'>QUICK (OLD)</p>
                    </Box>
                  </Box>
                </Box>
              </Box>
              <Box className='input-item'>
                <Box className='input-header'>
                  <p>{t('receive')}:</p>
                  <p>
                    {t('available')}:{' '}
                    {formatTokenAmount(lairInfoToUse?.QUICKBalance)}
                  </p>
                </Box>
                <Box className='input-wrapper'>
                  <p>450</p>
                  <Box display='flex' alignItems='center'>
                    <Box display='flex' alignItems='center'>
                      <img
                        src={QUICKIcon}
                        alt='QUICK (NEW)'
                        width='24px'
                        height='24px'
                      />
                      <p className='token-name'>QUICK (NEW)</p>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </TabPanel>
        </TabContext>
      </Box>

      <Box className='stakeButton' onClick={() => handleStake(tabValue)}>
        <small>{t('confirm')}</small>
      </Box>
    </Box>
  );
};

export default DragonsLair;
