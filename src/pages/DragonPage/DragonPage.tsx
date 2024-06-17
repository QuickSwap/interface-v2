import React, { useState, useEffect } from 'react';
import { useTheme } from '@material-ui/core/styles';
import { Box, Grid, useMediaQuery } from '@material-ui/core';
import DragonsLair from './DragonsLair';
import DragonsSyrup from './DragonsSyrup';
import 'pages/styles/dragon.scss';
import { useTranslation } from 'react-i18next';
import { HypeLabAds, CurrencyLogo } from 'components';
import { getConfig } from 'config/index';
import { useActiveWeb3React } from 'hooks';
import { useNewLairInfo } from 'state/stake/hooks';
import { ChainId } from '@uniswap/sdk';
import { useHistory } from 'react-router-dom';
import { DLDQUICK, DLQUICK } from 'constants/v3/addresses';
import DragonsInfo from 'pages/DragonPage/DragonsInfo';
import APRHover from 'assets/images/aprHover.png';
import BurnImage from 'assets/images/fire.png';
import { useLairDQUICKAPY } from 'utils';
import { formatAmount } from 'utils/numbers';
import { useUSDCPriceFromAddress } from 'utils/useUSDCPrice';
import { fetchQuickBurnAmount, fetchQuickBurnApy } from 'utils/api';

const DragonPage: React.FC = () => {
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const { t } = useTranslation();
  //showing old dragons lair until we're ready to deploy

  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const lairInfoToUse = useNewLairInfo();
  const APY = useLairDQUICKAPY(true, lairInfoToUse);
  const quickToken = DLQUICK[chainIdToUse];
  const dQuickToken = DLDQUICK[chainIdToUse];
  const { price: quickPrice } = useUSDCPriceFromAddress(quickToken?.address);
  const config = getConfig(chainIdToUse);
  const showLair = config['lair']['available'];
  const showOld = config['lair']['oldLair'];
  const showNew = config['lair']['newLair'];

  // if (lairInfoToUse == undefined) return;

  const totalStaked = lairInfoToUse
    ? formatAmount(Number(lairInfoToUse?.totalQuickBalance.toExact()))
    : 0;
  const totalStakedUSDPrice = totalStaked
    ? formatAmount(
        Number(lairInfoToUse?.totalQuickBalance.toExact()) * quickPrice,
      )
    : 0;
  const history = useHistory();

  const [quickBurnAmount, setQuickBurnAmount] = useState('0');
  const [quickBurnUSD, setQuickBurnUSD] = useState('0');
  const [quickBurnApy, setQuickBurnApy] = useState('0');

  useEffect(() => {
    if (!showLair) {
      history.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showLair]);

  useEffect(() => {
    const fetchQuickBurn = async () => {
      const amount = await fetchQuickBurnAmount();
      const formattedAmount = formatAmount(amount);
      const usdPrice = formatAmount(amount * quickPrice);
      setQuickBurnAmount(formattedAmount);
      setQuickBurnUSD(usdPrice);
    };

    const fetchQuickBurnAPY = async () => {
      const apy = await fetchQuickBurnApy();
      setQuickBurnApy(apy);
    };

    fetchQuickBurn();
    fetchQuickBurnAPY();
  }, [quickPrice]);

  return showLair ? (
    <Box width='100%' mb={3}>
      <Box margin='0 auto 24px'>
        <HypeLabAds />
      </Box>
      <Grid container className={`dragonHeader ${isMobile ? 'mobile' : ''}`}>
        <Grid item xs={12}>
          <Box className='dragonWrapper-title'>
            <h5>{t('dragonLair')}</h5>
            <small>
              {t('dragonLairTitle', {
                symbol: quickToken?.symbol,
                symbol1: dQuickToken?.symbol,
              })}
            </small>
          </Box>
          {!isMobile && (
            <Box className='dragonWrapper-overview'>
              <Box className='total-supply'>
                <CurrencyLogo currency={quickToken} size='40px' />
                <Box>
                  <small>{t('staked')}</small>
                  <h5 className='text-dragon-white'>
                    {totalStaked.toString().toUpperCase()}
                  </h5>
                  <small>
                    ${totalStakedUSDPrice?.toString().toUpperCase()}
                  </small>
                </Box>
              </Box>
              <Box>
                <small>{t('quickBurned')}</small>
                <h5 className='text-dragon-white'>
                  {quickBurnAmount.toUpperCase()}
                </h5>
                <small>${quickBurnUSD.toUpperCase()}</small>
              </Box>
              <Box>
                <small>{t('stakingApy')}</small>
                <Box display='flex' alignItems='center'>
                  <h5 className='text-success'>{APY ? APY : '-'}%</h5>
                  <img src={APRHover} width={18} />
                </Box>
              </Box>
              <Box>
                <small>{t('burnApy')}</small>
                <Box display='flex' alignItems='center'>
                  <h5 className='text-success'>{quickBurnApy}%</h5>
                  <img
                    src={BurnImage}
                    width={12}
                    style={{ marginLeft: '5px' }}
                  />
                </Box>
              </Box>
            </Box>
          )}
          {isMobile && (
            <Box className='dragonWrapper-overview-mobile'>
              <Box className='flex-wrapper'>
                <Box className='total-supply' width='50%'>
                  <CurrencyLogo currency={quickToken} size='40px' />
                  <Box width='50%'>
                    <small>{t('staked')}</small>
                    <h5 className='text-dragon-white'>
                      {totalStaked?.toString()?.toUpperCase()}
                    </h5>
                    <small>
                      ${totalStakedUSDPrice.toString().toUpperCase()}
                    </small>
                  </Box>
                </Box>
                <Box width='50%'>
                  <small>{t('quickBurned')}</small>
                  <h5 className='text-dragon-white'>
                    {quickBurnAmount.toUpperCase()}
                  </h5>
                  <small>${quickBurnUSD.toUpperCase()}</small>
                </Box>
              </Box>
              <Box className='flex-wrapper'>
                <Box width='50%'>
                  <small>{t('stakingApy')}</small>
                  <Box display='flex' alignItems='center'>
                    <h5 className='text-success'>{APY ? APY : '-'}%</h5>
                    <img src={APRHover} width={18} />
                  </Box>
                </Box>
                <Box width='50%'>
                  <small>{t('burnApy')}</small>
                  <Box display='flex' alignItems='center'>
                    <h5 className='text-success'>{quickBurnApy}%</h5>
                    <img
                      src={BurnImage}
                      width={12}
                      style={{ marginLeft: '5px' }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </Grid>
      </Grid>
      <Grid container spacing={4} style={{ marginTop: '24px' }}>
        <Grid item xs={12} sm={12} md={7}>
          <DragonsLair />
        </Grid>
        <Grid item xs={12} sm={12} md={5}>
          <DragonsInfo />
        </Grid>
        <Grid item xs={12}>
          <DragonsSyrup />
        </Grid>
      </Grid>
    </Box>
  ) : (
    <></>
  );
};

export default DragonPage;
