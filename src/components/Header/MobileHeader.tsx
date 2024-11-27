import { Box, ButtonBase, Typography } from '@material-ui/core';
import React, { useEffect, useMemo, useState } from 'react';
import { HeaderMenuItem } from './HeaderListItem';
import { ReactComponent as ThreeDashIcon } from 'assets/images/ThreeDashIcon.svg';
import { Link, useLocation } from 'react-router-dom';
import MobileNavItem from './MobileNavItem';
import CloseIcon from '@material-ui/icons/Close';
import { ReactComponent as BlogIcon } from 'assets/images/social/Blog.svg';
import XIcon from 'assets/images/social/X.png';
import { ReactComponent as DiscordIcon } from 'assets/images/social/Discord.svg';
import { ReactComponent as RedditIcon } from 'assets/images/social/Reddit.svg';
import { ReactComponent as TelegramIcon } from 'assets/images/social/Telegram.svg';
import { ReactComponent as Announcement } from 'assets/images/social/announcement.svg';
import { ReactComponent as YouTubeIcon } from 'assets/images/social/YouTube.svg';
import GeckoterminalIcon from 'assets/images/social/Geckoterminal.png';
import CoinpaprikaIcon from 'assets/images/social/coinpaprika-logo.png';
import { HeaderDesktopItem } from 'components/Header/HeaderDesktopItem';
import { useActiveWeb3React } from 'hooks';
import { ChainId } from '@uniswap/sdk';
import { getConfig } from 'config/index';
import { USDC, USDT } from 'constants/v3/addresses';
import { useTranslation } from 'react-i18next';

interface MobileHeaderProps {
  menuItems: HeaderMenuItem[];
  isMobile?: boolean;
  isTablet?: boolean;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  menuItems,
  isTablet,
  isMobile,
}) => {
  const [isActive, setIsActive] = useState(false);
  const location = useLocation();
  const { chainId } = useActiveWeb3React();

  const config = getConfig(chainId);
  const showPerps = config['perps']['available'];
  const showPools = config['pools']['available'];

  const showHydra = config['hydra']['available'];
  const showPerpsV2 = config['perpsV2']['available'];

  useEffect(() => {
    setIsActive(false);
  }, [location]);

  const perpMenuItems: any[] = [];
  if (showPerpsV2) {
    perpMenuItems.push({
      id: 'perps-new-page-link',
      link: '/falkor',
      text: 'Perps',
      isNew: true,
    });
  }
  if (showHydra) {
    perpMenuItems.push({
      link: '/hydra',
      text: 'Hydra',
      id: 'hydra-page-link',
      isExternal: true,
      externalLink: process?.env?.REACT_APP_HYDRA_URL || '',
      onClick: async () => {
        if (process.env.REACT_APP_HYDRA_URL) {
          window.open(process.env.REACT_APP_HYDRA_URL, '_blank');
        }
      },
    });
  }
  if (showPerps) {
    perpMenuItems.push({
      id: 'perps-v1-page-link',
      link: process.env.REACT_APP_PERPS_URL || '#',
      text: 'Perps V1',
      onClick: () => {
        if (process.env.REACT_APP_PERPS_URL) {
          window.open(process.env.REACT_APP_PERPS_URL, '_blank');
        }
      },
    });
  }

  const socialicons = [
    {
      link: 'https://twitter.com/QuickswapDEX',
      icon: <img src={XIcon} alt='X' width={30} height={30} />,
      title: 'X',
    },
    {
      link: 'https://t.me/QuickSwapDEX',
      icon: <TelegramIcon style={{ width: '30px', height: '30px' }} />,
      title: 'Telegram',
    },
    {
      link: 'https://t.me/QuickSwapAnnouncements',
      icon: <Announcement style={{ width: '30px', height: '30px' }} />,
      title: 'Announcements',
    },
    // {
    //   link: 'https://t.me/+OQ-H4hjc-BU5ZmRl',
    //   icon: <DiscordIcon style={{ width: '30px', height: '30px' }} />,
    //   title: 'Discord',
    // },
    {
      link: 'https://blog.quickswap.exchange/',
      icon: <BlogIcon style={{ width: '30px', height: '30px' }} />,
      title: 'Blog',
    },
    {
      link: 'https://www.youtube.com/@quickswapofficial',
      icon: <YouTubeIcon style={{ width: '30px', height: '30px' }} />,
      title: 'Youtube',
    },
    {
      link: 'https://www.reddit.com/r/QuickSwap/',
      icon: <RedditIcon style={{ width: '30px', height: '30px' }} />,
      title: 'Reddit',
    },
    {
      link: 'https://www.geckoterminal.com/polygon_pos/quickswap_v3/pools',
      icon: (
        <img src={GeckoterminalIcon} alt='Coinpaprika' width={30} height={30} />
      ),
      title: 'GeckoTerminal',
    },
    {
      link: 'https://coinpaprika.com/exchanges/quickswap-v3/',
      icon: (
        <img src={CoinpaprikaIcon} alt='Coinpaprika' width={30} height={30} />
      ),
      title: 'Coinpaprika',
    },
  ];

  const govermance: HeaderMenuItem[] = [
    {
      id: 'proposal-new-page-link',
      link: '#',
      text: 'Proposal',
    },
    // {
    //   id: 'vote-page-link',
    //   link: '#',
    //   text: 'Vote',
    // },
  ];

  const developers: HeaderMenuItem[] = [
    {
      id: 'github-new-page-link',
      link: '#',
      text: 'GitHub',
    },
    {
      id: 'docs-page-link',
      link: '#',
      text: 'Docs',
    },
  ];

  const swapCurrencyStr = useMemo(() => {
    if (!chainId) return '';
    if (chainId === ChainId.ZKTESTNET)
      return `&currency1=${USDT[chainId].address}`;
    if (USDC[chainId]) return `&currency1=${USDC[chainId].address}`;
    return '';
  }, [chainId]);

  const { t } = useTranslation();

  return (
    <>
      <Box
        style={{
          width: '100%',
          height: isActive ? '100vh' : '0px',
          backgroundColor: '#12131a',
          opacity: isMobile && !isActive ? 0.6 : 1,
          position: 'fixed',
          left: 0,
          top: '64px',
          borderTop: '1px solid #374769',
          overflow: isActive ? 'scroll' : 'hidden',
          padding: isActive ? '24px' : 0,
          transition: '0.4s ease-in-out',
        }}
      >
        <Box style={{ borderBottom: '1px solid #242938' }}>
          <Typography
            style={{ color: '#686c80', fontSize: '14px', marginBottom: '12px' }}
          >
            Products
          </Typography>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {menuItems.map((item, i) => {
              return <MobileNavItem key={i} navItem={item} />;
            })}
          </Box>
        </Box>
        <Box style={{ paddingTop: '12px', borderBottom: '1px solid #242938' }}>
          <Typography
            style={{
              color: '#686c80',
              fontSize: '14px',
              marginBottom: '12px',
            }}
          >
            Governance
          </Typography>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {govermance.map((item, index) => {
              return (
                <Box
                  key={index}
                  style={{
                    display: 'flex',
                    height: '48px',
                    alignItems: 'center',
                    verticalAlign: 'center',
                  }}
                >
                  <Link
                    onClick={item.onClick}
                    to={item.link}
                    style={{
                      color: '#c7cad9',
                      textDecoration: 'none',
                    }}
                  >
                    {item.text}
                  </Link>
                </Box>
              );
            })}
          </Box>
        </Box>
        <Box
          style={{
            paddingTop: '12px',
            borderBottom: '1px solid #242938',
          }}
        >
          <Typography
            style={{
              color: '#686c80',
              fontSize: '14px',
              marginBottom: '12px',
            }}
          >
            Developers
          </Typography>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {developers.map((item, index) => {
              return (
                <Box
                  key={index}
                  style={{
                    display: 'flex',
                    height: '48px',
                    alignItems: 'center',
                    verticalAlign: 'center',
                  }}
                >
                  <Link
                    onClick={item.onClick}
                    to={item.link}
                    style={{
                      color: '#c7cad9',
                      textDecoration: 'none',
                    }}
                  >
                    {item.text}
                  </Link>
                </Box>
              );
            })}
          </Box>
        </Box>
        <Box style={{ paddingTop: '12px', paddingBottom: '120px' }}>
          <Typography
            style={{
              color: '#686c80',
              fontSize: '14px',
              marginBottom: '24px',
            }}
          >
            Community
          </Typography>
          <Box className='mobile_cover_social_list'>
            {socialicons.map((item, index) => {
              return (
                <Box
                  key={index}
                  style={{
                    width: '30px',
                    height: '30px',
                  }}
                  onClick={() => {
                    window.open(item.link, '_blank');
                  }}
                >
                  {item.icon}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
      <Box
        className='mobile_header'
        sx={{
          width: '100vw',
          position: 'fixed',
          left: '0',
          bottom: '0',
          zIndex: '100',
        }}
      >
        <Box
          style={{
            width: '100%',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgb(18 19 26)',
            // backdropFilter: 'blur(30px)',
            padding: '0 42px',
          }}
        >
          {isActive ? (
            <ButtonBase
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'end',
                gap: '18px',
              }}
              onClick={() => {
                setIsActive(false);
              }}
            >
              Close
              <CloseIcon style={{ color: '#ca0000' }} />
            </ButtonBase>
          ) : (
            <Box
              justifyContent='space-between'
              alignItems='center'
              className='flex gap-3'
              width='100%'
            >
              <Box>
                <Link to={`/swap?currency0=ETH${swapCurrencyStr}`}>
                  {t('swap')}
                </Link>
              </Box>
              <Box>
                <HeaderDesktopItem
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                  }}
                  item={{
                    link: '/perps',
                    text: 'Perps',
                    id: 'perps-page-link',
                    isExternal: true,
                    externalLink: process?.env?.REACT_APP_PERPS_URL || '',
                    items: perpMenuItems,
                  }}
                />
              </Box>
              {showPools && (
                <Box>
                  <Link to='/pools'>{t('pool')}</Link>
                </Box>
              )}
              <ButtonBase
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'end',
                  gap: '18px',
                }}
                onClick={() => {
                  setIsActive(true);
                }}
              >
                Menu
                <ThreeDashIcon />
              </ButtonBase>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};
export default MobileHeader;
