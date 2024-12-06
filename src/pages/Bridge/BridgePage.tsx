import { Box, ButtonBase, Grid, Typography } from '@material-ui/core';
import { HypeLabAds, Note } from 'components';
import React, { useMemo } from 'react';
import { BridgeBlockItem } from 'components/Bridge';
import eth from 'assets/images/bridge/eth.svg';
import jumper from 'assets/images/bridge/jumper.svg';
import Rhino from 'assets/images/bridge/Rhino.svg';
import Symbiosis from 'assets/images/bridge/Symbiosis.webp';
import Hop from 'assets/images/bridge/Hop.svg';
import Meson from 'assets/images/bridge/Meson.webp';
import Interport from 'assets/images/bridge/Interport.svg';
import Owlto from 'assets/images/bridge/Owlto.webp';
import rango from 'assets/images/bridge/rango.svg';
import Celer from 'assets/images/bridge/Celer.webp';
import Orbiter from 'assets/images/bridge/Orbiter.webp';
import Nitro from 'assets/images/bridge/Nitro.webp';
import Galaxy from 'assets/images/bridge/Galaxy.webp';
import Image505 from 'assets/images/bridge/Image505.webp';
import polygon from 'assets/images/bridge/polygon.svg';
import image525 from 'assets/images/bridge/Image525.webp';
import Image510 from 'assets/images/bridge/Image510.webp';
import Image511 from 'assets/images/bridge/Image511.webp';
import Dogechain from 'assets/images/bridge/dog_coin.webp';
import finance from 'assets/images/bridge/finance.svg';
import layer from 'assets/images/bridge/layer.svg';
import squid from 'assets/images/bridge/squid.webp';
import retr from 'assets/images/bridge/retr.webp';
import rubic from 'assets/images/bridge/rubic.webp';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import { useActiveWeb3React } from 'hooks';
import { SUPPORTED_CHAINIDS } from 'constants/index';
import { getConfig } from 'config';

const BridgePage: React.FC = ({}) => {
  const { chainId } = useActiveWeb3React();
  console.log('🚀 ~ currentChainId:', chainId);

  const supportedChains = SUPPORTED_CHAINIDS.filter((chain: any) => {
    const config = getConfig(chain);
    return config && config.visible;
  });

  const currentChain = useMemo(() => {
    return getConfig(chainId);
  }, [chainId]);

  console.log('🚀 ~ currentChain ~ currentChain:', currentChain);

  const bridgeData = [
    {
      image: jumper,
      chains: [eth, polygon, image525],
      externalLink: 'https://jumper.exchange/exchange',
    },
    {
      image: Rhino,
      chains: [eth, polygon, image525, Image505, Image511],
      externalLink: 'https://app.rhino.fi/bridge',
    },
    {
      image: layer,
      chains: [eth, polygon, image525, Image505, Image510],
      externalLink: 'https://www.layerswap.io/app',
    },
    {
      image: Symbiosis,
      chains: [eth, polygon, image525, Image505],
      externalLink: 'https://app.symbiosis.finance/bridge',
    },
    {
      image: Interport,
      chains: [eth, polygon, image525, Image505],
      externalLink: 'https://app.interport.fi/bridge',
    },
    {
      image: Owlto,
      chains: [eth, polygon, image525, Image505, Image511],
      externalLink: 'https://owlto.finance/',
    },
    {
      image: Meson,
      chains: [eth, polygon, image525, Image505],
      externalLink: 'https://meson.fi/',
    },
    {
      image: Orbiter,
      chains: [eth, polygon, image525, Image505, Image511],
      externalLink: 'https://www.orbiter.finance/',
    },
    {
      image: Nitro,
      chains: [eth, polygon, image525, Image505, Image511, Dogechain],
      externalLink: 'https://app.routernitro.com/swap',
    },
    {
      image: finance,
      chains: [eth, polygon, image525],
      externalLink: 'https://app.xy.finance/',
    },
    {
      image: Celer,
      chains: [eth, polygon, image525],
      externalLink: 'https://cbridge.celer.network/',
    },
    {
      image: rango,
      chains: [eth, polygon, image525],
      externalLink: 'https://app.rango.exchange/swap/',
    },
    {
      image: Hop,
      chains: [eth, polygon, image525],
      isSmallImage: true,
      externalLink: 'https://app.hop.exchange/',
    },
    {
      image: Galaxy,
      chains: [eth, polygon, Image505],
      isSmallImage: true,
      externalLink: 'https://galaxy.exchange/swap',
    },
    {
      image: squid,
      chains: [eth, polygon],
      isSmallImage: true,
      externalLink: 'https://app.squidrouter.com/',
    },
    {
      image: retr,
      chains: [eth, polygon, image525, Image505, Image511],
      isSmallImage: true,
      externalLink: 'https://app.retrobridge.io/?utm_source=Quickswap',
    },
    {
      image: rubic,
      chains: [eth, polygon, image525, Image505, Image511],
      isSmallImage: true,
      externalLink: 'https://app.rubic.exchange/',
    },
  ];

  return (
    <Box width={'100%'} mb={2}>
      <Box margin='24px auto'>
        <HypeLabAds />
      </Box>
      <Grid container justifyContent='center' spacing={2}>
        <Grid item xs={12} sm={12} md={6} lg={6}>
          <Box sx={{ marginBottom: '28px' }}>
            <Note
              title='Important Disclaimer!'
              message='QuickSwap has no affiliation with, is not responsible for and does not make any representation or warranty for any bridge. Users should review Terms of Use or other documentation for third party bridges.'
            />
          </Box>
          <Box style={{ marginBottom: '16px' }}>
            <Typography
              style={{
                fontSize: '20px',
                color: '#fff',
                fontWeight: 500,
                marginBottom: '16px',
              }}
            >
              Chain Native Bridge
            </Typography>
            <Box
              style={{
                backgroundColor: '#22314d',
                borderRadius: '10px',
                padding: '20px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                position: 'relative',
              }}
            >
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                }}
              >
                <img
                  src={
                    currentChain?.bridge?.bridgeCoverImg ??
                    currentChain?.nativeCurrencyImage
                  }
                  alt='image'
                  style={{
                    width: currentChain?.bridge?.isBigCoverImg ? '50%' : 'auto',
                  }}
                />
                {/* <Typography style={{ fontSize: '24px', color: '#fff' }}>
                    {currentChain?.networkName?.toLowerCase()} portal
                  </Typography> */}
              </Box>
              <Typography
                style={{
                  fontSize: '12px',
                  color: '#f6f6f9',
                  marginBottom: '28px',
                }}
              >
                {`${currentChain?.networkName}'s Native Bridge`}
              </Typography>
              <Box className='flex items-center justify-center'>
                {currentChain?.bridge?.supportedChains?.map(
                  (item: string, index: number) => {
                    return (
                      <img
                        key={index}
                        src={item}
                        alt='item'
                        width={16}
                        height={16}
                        style={{ marginLeft: '-2px', borderRadius: '8px' }}
                      />
                    );
                  },
                )}
              </Box>
              <ButtonBase
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '16px',
                  color: '#448aff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                }}
                onClick={() => {
                  if (!currentChain?.bridgeUrl) return;
                  window.open(currentChain?.bridgeUrl, '_blank');
                }}
              >
                Bridge now
                <ArrowForwardIcon style={{ fontSize: '14px' }} />
              </ButtonBase>
            </Box>
          </Box>
          <Box>
            <Typography
              style={{
                fontSize: '20px',
                color: '#fff',
                fontWeight: 500,
                marginBottom: '16px',
              }}
            >
              3rd Party Bridges
            </Typography>

            <Box style={{ marginBottom: '16px' }}>
              <Typography
                style={{
                  fontSize: '11px',
                  color: '#6880a3',
                  fontWeight: 500,
                  marginBottom: '8px',
                }}
              >
                Select Bridge
              </Typography>
              {/* <Select
                  style={{
                    backgroundColor: '#22314d',
                    padding: '4px 8px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                  }}
                  disableUnderline
                  displayEmpty
                  value={'all'}
                  onChange={(e) => {
                    console.log('🚀 ~ e:', e);
                  }}
                  IconComponent={() => <KeyboardArrowDownIcon />}
                  inputProps={{ 'aria-label': 'Without label' }}
                >
                  <MenuItem value='all'>All</MenuItem>
                </Select> */}
            </Box>

            <Grid container spacing={2}>
              {bridgeData.map((item, index) => {
                return (
                  <Grid
                    key={index}
                    item
                    xs={
                      bridgeData.length % 2 === 1 &&
                      index === bridgeData.length - 1
                        ? 12
                        : 6
                    }
                    className='flex justify-center'
                  >
                    <Box
                      width={
                        bridgeData.length % 2 === 1 &&
                        index === bridgeData.length - 1
                          ? 1 / 2
                          : 1
                      }
                    >
                      <BridgeBlockItem
                        onClick={() => {
                          window.open(item.externalLink, '_blank');
                        }}
                        image={item.image}
                        chains={item.chains}
                      />
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
export default BridgePage;
