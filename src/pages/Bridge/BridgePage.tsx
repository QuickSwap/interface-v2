import {
  Box,
  ButtonBase,
  Grid,
  MenuItem,
  Select,
  Typography,
} from '@material-ui/core';
import { HypeLabAds, Note } from 'components';
import React, { useMemo, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
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
import manta from 'assets/images/bridge/Image505.webp';
import polygon from 'assets/images/bridge/polygon.svg';
import zkevm from 'assets/images/bridge/Image525.webp';
import Image510 from 'assets/images/bridge/Image510.webp';
import xlayer from 'assets/images/bridge/Image511.webp';
import Dogechain from 'assets/images/bridge/dog_coin.webp';
import finance from 'assets/images/bridge/finance.svg';
import layer from 'assets/images/bridge/layer.svg';
import squid from 'assets/images/bridge/squid.webp';
import retr from 'assets/images/bridge/retr.webp';
import rubic from 'assets/images/bridge/rubic.webp';
import across from 'assets/images/bridge/across.png';
import soneium from 'assets/images/bridge/soneium.webp';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import { useActiveWeb3React } from 'hooks';
import { getConfig } from 'config';
import { ChainId } from '@uniswap/sdk';

const BridgePage: React.FC = ({}) => {
  const { chainId } = useActiveWeb3React();
  const history = useHistory();

  const config = useMemo(() => {
    return getConfig(chainId);
  }, [chainId]);

  const showBridge = config['bridge']['available'];

  if (!showBridge) {
    location.href = '/';
  }

  useEffect(() => {
    if (!showBridge) {
      history.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBridge]);

  const bridgeData = [
    {
      image: jumper,
      chains: [eth, polygon, zkevm],
      chainNames: ['eth', 'polygon', 'zkevm'],
      externalLink: 'https://jumper.exchange/exchange',
    },
    {
      image: Rhino,
      chains: [eth, polygon, zkevm, manta, xlayer, soneium],
      chainNames: ['eth', 'polygon', 'zkevm', 'manta', 'xlayer', 'soneium'],
      externalLink: 'https://app.rhino.fi/bridge',
    },
    {
      image: layer,
      chains: [eth, polygon, zkevm, manta, Image510, soneium],
      chainNames: ['eth', 'polygon', 'zkevm', 'manta', 'xlayer', 'soneium'], // Image510 is no xlayer
      externalLink: 'https://www.layerswap.io/app',
    },
    {
      image: Symbiosis,
      chains: [eth, polygon, zkevm, manta],
      chainNames: ['eth', 'polygon', 'zkevm', 'manta'],
      externalLink: 'https://app.symbiosis.finance/bridge',
    },
    {
      image: Interport,
      chains: [eth, polygon, zkevm, manta],
      chainNames: ['eth', 'polygon', 'zkevm', 'manta'],
      externalLink: 'https://app.interport.fi/bridge',
    },
    {
      image: Owlto,
      chains: [eth, polygon, zkevm, manta, xlayer],
      chainNames: ['eth', 'polygon', 'zkevm', 'manta', 'xlayer'],
      externalLink: 'https://owlto.finance/',
    },
    {
      image: Meson,
      chains: [eth, polygon, zkevm, manta],
      chainNames: ['eth', 'polygon', 'zkevm', 'manta'],
      externalLink: 'https://meson.fi/',
    },
    {
      image: Orbiter,
      chains: [eth, polygon, zkevm, manta, xlayer],
      chainNames: ['eth', 'polygon', 'zkevm', 'manta', 'xlayer'],
      externalLink: 'https://www.orbiter.finance/',
    },
    {
      image: Nitro,
      chains: [eth, polygon, zkevm, manta, xlayer, Dogechain, soneium],
      chainNames: [
        'eth',
        'polygon',
        'zkevm',
        'manta',
        'xlayer',
        'doge',
        'soneium',
      ],
      externalLink: 'https://app.routernitro.com/swap',
    },
    {
      image: finance,
      chains: [eth, polygon, zkevm],
      chainNames: ['eth', 'polygon', 'zkevm'],
      externalLink: 'https://app.xy.finance/',
    },
    {
      image: Celer,
      chains: [eth, polygon, zkevm],
      chainNames: ['eth', 'polygon', 'zkevm'],
      externalLink: 'https://cbridge.celer.network/',
    },
    {
      image: rango,
      chains: [eth, polygon, zkevm],
      chainNames: ['eth', 'polygon', 'zkevm'],
      externalLink: 'https://app.rango.exchange/swap/',
    },
    {
      image: Hop,
      chains: [eth, polygon, zkevm],
      chainNames: ['eth', 'polygon', 'zkevm'],
      isSmallImage: true,
      externalLink: 'https://app.hop.exchange/',
    },
    {
      image: Galaxy,
      chains: [eth, polygon, manta],
      chainNames: ['eth', 'polygon', 'manta'],
      isSmallImage: true,
      externalLink: 'https://galaxy.exchange/swap',
    },
    {
      image: squid,
      chains: [eth, polygon],
      chainNames: ['eth', 'polygon'],
      isSmallImage: true,
      externalLink: 'https://app.squidrouter.com/',
    },
    {
      image: retr,
      chains: [eth, polygon, zkevm, manta, xlayer],
      chainNames: ['eth', 'polygon', 'zkevm', 'manta', 'xlayer'],
      isSmallImage: true,
      externalLink: 'https://app.retrobridge.io/?utm_source=Quickswap',
    },
    {
      image: rubic,
      chains: [eth, polygon, zkevm, manta, xlayer],
      chainNames: ['eth', 'polygon', 'zkevm', 'manta', 'xlayer'],
      isSmallImage: true,
      externalLink: 'https://app.rubic.exchange/',
    },
    {
      image: across,
      chains: [eth, polygon, soneium],
      chainNames: ['eth', 'polygon', 'soneium'],
      isSmallImage: true,
      externalLink: 'https://app.across.to/bridge',
    },
  ];

  const networkItems = [
    {
      value: 'All',
      label: 'All',
    },
    {
      value: 'polygon',
      label: 'Polygon',
    },
    {
      value: 'eth',
      label: 'Ethereum',
    },
    {
      value: 'zkevm',
      label: 'Polygon Zkevm',
    },
    {
      value: 'manta',
      label: 'Manta',
    },
    {
      value: 'xlayer',
      label: 'X Layer',
    },
    {
      value: 'soneium',
      label: 'Soneium',
    },
  ];

  const [selectedNetwork, setSelectedNetwork] = useState<string>('All');

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
              {config?.bridge?.thirdParty
                ? `${config?.networkName} Official Third Party Bridge `
                : 'Chain Native Bridge'}
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
                    config?.bridge?.bridgeCoverImg ??
                    config?.nativeCurrencyImage
                  }
                  alt='image'
                  style={{
                    width: config?.bridge?.isBigCoverImg ? '50%' : 'auto',
                    height: config?.bridge?.isBigCoverImg ? 'auto' : '40px',
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
                {`${config?.networkName}'s Native Bridge`}
              </Typography>
              <Box className='flex items-center justify-center'>
                {config?.bridge?.supportedChains?.map(
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
              {config?.bridgeUrl && (
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
                    if (!config?.bridgeUrl) return;
                    window.open(config?.bridgeUrl, '_blank');
                  }}
                >
                  Bridge now
                  <ArrowForwardIcon style={{ fontSize: '14px' }} />
                </ButtonBase>
              )}
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
              <Select
                style={{
                  backgroundColor: '#282d3d',
                  borderRadius: '10px',
                  padding: '6px 16px',
                  fontSize: '14px',
                }}
                disableUnderline
                value={selectedNetwork}
              >
                {networkItems.map((item) => (
                  <MenuItem
                    key={item.value}
                    value={item.value}
                    onClick={() => {
                      setSelectedNetwork(item.value);
                    }}
                  >
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <Grid container spacing={2}>
              {bridgeData
                .filter((item) => {
                  if (selectedNetwork === 'All') return true;
                  return item.chainNames.includes(selectedNetwork);
                })
                .map((item, index) => {
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
