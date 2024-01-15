import React, { useEffect, useState } from 'react';
import { Box, Grid, useMediaQuery, useTheme } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { useActiveWeb3React } from 'hooks';
import styles from 'styles/pages/Bonds.module.scss';
import { getConfig } from 'config/index';
import { CustomSwitch, HypeLabAds, SearchInput } from 'components';
import BondsList from 'components/pages/bonds/BondsList';
import { useRouter } from 'next/router';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import HelpIcon from 'svgs/HelpIcon1.svg';

const BondsPage = (_props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const isTablet = useMediaQuery(breakpoints.down('sm'));

  const config = getConfig(chainId);
  const showBonds = config['bonds']['available'];
  const router = useRouter();
  const helpURL = process.env.NEXT_PUBLIC_HELP_URL;

  useEffect(() => {
    if (!showBonds) {
      router.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBonds]);

  const bondsStatus =
    router.query && router.query.status
      ? (router.query.status as string)
      : 'available';
  const bondsType =
    router.query && router.query.bondType
      ? (router.query.bondType as string)
      : 'availableBonds';

  const currencyParamsArray = Object.keys(router.query).map((key, index) => [
    key,
    Object.values(router.query)[index],
  ]);

  const redirectWithBondsType = (bondType: string) => {
    const currentPath = router.asPath;
    let redirectPath;
    if (router.query && router.query.bondType) {
      redirectPath = currentPath.replace(
        `bondType=${router.query.bondType}`,
        `bondType=${bondType}`,
      );
    } else {
      redirectPath = `${currentPath}${
        currencyParamsArray.length === 0 ? '?' : '&'
      }bondType=${bondType}`;
    }
    router.push(redirectPath);
  };

  const bondsTypeItems = [
    {
      text: t('availableBonds'),
      onClick: () => {
        redirectWithBondsType('availableBonds');
      },
      condition: bondsType === 'availableBonds',
    },
    {
      text: t('myBonds'),
      onClick: () => {
        redirectWithBondsType('myBonds');
      },
      condition: bondsType === 'myBonds',
    },
  ];

  const redirectWithBondsStatus = (status: string) => {
    const currentPath = router.asPath;
    let redirectPath;
    if (router.query && router.query.status) {
      redirectPath = currentPath.replace(
        `status=${router.query.status}`,
        `status=${status}`,
      );
    } else {
      redirectPath = `${currentPath}${
        currencyParamsArray.length === 0 ? '?' : '&'
      }status=${status}`;
    }
    router.push(redirectPath);
  };

  const bondsStatusItems = [
    {
      text: t('available'),
      onClick: () => {
        redirectWithBondsStatus('available');
      },
      condition: bondsStatus === 'available',
    },
    {
      text: t('soldout'),
      onClick: () => {
        redirectWithBondsStatus('soldout');
      },
      condition: bondsStatus === 'soldout',
    },
  ];

  const [search, setSearch] = useState('');

  return (
    <Box width='100%' id='bondsPage'>
      <Box className='pageHeading'>
        <h1 className='h4'>{t('bonds')}</h1>

        {helpURL && (
          <Box
            className='helpWrapper'
            onClick={() => window.open(helpURL, '_blank')}
          >
            <small>{t('help')}</small>
            <HelpIcon />
          </Box>
        )}
      </Box>
      <Box margin='0 auto 24px'>
        <HypeLabAds />
      </Box>
      <Box className='bg-palette' borderRadius={10} mb={4}>
        <Box
          className='flex justify-between border-bottom flex-wrap'
          px={3}
          py={2}
        >
          <Box my={1} width={isTablet ? '100%' : '300px'}>
            <CustomSwitch
              width='100%'
              height={36}
              items={bondsTypeItems}
              activeItemClass={styles.availableBondsSwitch}
            />
          </Box>
          <Box
            className={`flex flex-wrap ${isTablet ? 'justify-between' : ''}`}
            my={1}
            width={isTablet ? '100%' : 'auto'}
          >
            <Box
              mr={isTablet || bondsType === 'myBonds' ? 0 : 3}
              mb={isMobile && bondsType === 'availableBonds' ? 2 : 0}
              width={
                isMobile
                  ? '100%'
                  : isTablet
                  ? bondsType === 'availableBonds'
                    ? '49%'
                    : '100%'
                  : 'auto'
              }
            >
              <SearchInput
                placeholder={t('search')}
                value={search}
                setValue={setSearch}
                height={36}
              />
            </Box>
            {bondsType === 'availableBonds' && (
              <CustomSwitch
                width={isMobile ? '100%' : isTablet ? '49%' : 214}
                height={36}
                items={bondsStatusItems}
              />
            )}
          </Box>
        </Box>
        <Box p={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={6}>
              <picture>
                <img
                  src='/assets/images/bonds/quickBond.jpg'
                  width='100%'
                  alt='bond image'
                />
              </picture>
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
              <h5>{t('tipsBuyBonds')}</h5>
              <Box className='flex items-center' mt={2}>
                <Box className='flex' mr={1}>
                  <picture>
                    <img
                      src='/assets/images/bonds/billSvg1.svg'
                      alt='bond icon1'
                    />
                  </picture>
                </Box>
                <p>{t('tipBuyBond1Desc')}</p>
              </Box>
              <Box className='flex items-center' mt={2}>
                <Box className='flex' mr={1}>
                  <picture>
                    <img
                      src='/assets/images/bonds/billSvg2.svg'
                      alt='bond icon2'
                    />
                  </picture>
                </Box>
                <p>{t('tipBuyBond2Desc')}</p>
              </Box>
              <Box className='flex items-center' mt={2}>
                <Box className='flex' mr={1}>
                  <picture>
                    <img
                      src='/assets/images/bonds/billSvg3.svg'
                      alt='bond icon3'
                    />
                  </picture>
                </Box>
                <p>{t('tipBuyBond3Desc')}</p>
              </Box>
              <Box mt={2}>
                <span>{t('tipBuyBondComment')}</span>
              </Box>
            </Grid>
          </Grid>
          <Box my={3} className='flex justify-center items-center' gap='6px'>
            <p>{t('poweredBy')}</p>
            <picture>
              <img
                src='assets/images/bonds/apeBond.png'
                height='16px'
                alt='bond icon'
              />
            </picture>
          </Box>
        </Box>
        <BondsList search={search} />
      </Box>
    </Box>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};

export default BondsPage;
