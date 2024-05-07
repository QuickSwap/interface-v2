import React, { useState } from 'react';
import ProvideLiquidity from 'assets/images/featured/liquidity.svg';
import Perpetual from 'assets/images/featured/perpetual.svg';
import Wallet from 'assets/images/featured/wallet.svg';
import FeaturedSwap from 'assets/images/featured/Swap.svg';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@material-ui/core';
import { FeatureBlock } from 'components/FeatureBlock';
import { MeldModal } from 'components';

function TradeSection() {
  const { t } = useTranslation();
  const [showMeldWidget, setShowMeldWidgetWidget] = useState(false);

  const features = [
    {
      img: FeaturedSwap,
      title: t('swapTokens'),
      desc: t('featureTradeDesc'),
      actionLabel: 'Trade Now',
      link: '/swap',
    },
    {
      img: ProvideLiquidity,
      title: t('supplyLiquidity'),
      desc: t('featureLiquidityDesc'),
      actionLabel: 'LP Now',
      link: '/pool',
    },
    {
      img: Perpetual,
      title: t('perpetual'),
      desc: t('perpetualDesc'),
      actionLabel: 'Trade Now',
      link: '/swap',
    },
    {
      img: Wallet,
      title: t('buyFiat'),
      desc: t('buyFiatDesc'),
      actionLabel: 'Buy Now',
      onClick: () => {
        setShowMeldWidgetWidget(true);
      },
    },
  ];

  return (
    <Box className='featureContainer' style={{ position: 'relative' }}>
      {showMeldWidget && (
        <MeldModal
          open={showMeldWidget}
          onClose={() => setShowMeldWidgetWidget(false)}
        />
      )}
      <Box
        className='featureHeading'
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          marginBottom: '40px',
        }}
      >
        <Typography
          className='title'
          style={{
            fontWeight: 600,
            color: '#448aff',
            lineHeight: ' 2.44',
          }}
        >
          {t('tradeAndProvide')}
        </Typography>
        <Typography
          className='desc'
          style={{
            color: '#ccd8e7',
            lineHeight: '1.67',
            maxWidth: '432px',
          }}
        >
          {t('swapAndLP')}
        </Typography>
      </Box>
      <Box
        className='cover_feat_block'
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '128px',
        }}
      >
        {features.map((val, index) => (
          <FeatureBlock
            key={index}
            title={val.title}
            desc={val.desc}
            actionLabel={val.actionLabel}
            image={val.img}
            link={val.link}
            onClick={val.onClick}
          />
        ))}
      </Box>
    </Box>
  );
}

export default TradeSection;
