import React, { ReactNode, useEffect, useState } from 'react';
import { CustomModal } from 'components';
import { Trans, useTranslation } from 'react-i18next';
import 'components/styles/TermsWrapper.scss';
import { Box, Button, Checkbox } from '@material-ui/core';
import PerpsBanner from 'assets/images/perpsBanner.png';
import PerpsBannerWebP from 'assets/images/perpsBanner.webp';
import liquidityHubBanner from 'assets/images/liquidityHubBanner.webp';
import { useActiveWeb3React } from 'hooks';
import { getConfig } from 'config/index';

export default function TermsWrapper({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [readTerms, setReadTerms] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const currentTOSVersion = process.env.REACT_APP_TOS_VERSION;
  const { chainId } = useActiveWeb3React();
  const config = getConfig(chainId);
  const showPerpsV2 = config['perpsV2']['available'];

  useEffect(() => {
    const savedTermsVersion = localStorage.getItem('tosVersion');
    if (
      !savedTermsVersion ||
      !currentTOSVersion ||
      savedTermsVersion !== currentTOSVersion
    ) {
      setShowTerms(true);
    }
  }, [currentTOSVersion]);

  const confirmTOS = () => {
    localStorage.setItem('tosVersion', currentTOSVersion ?? '');
    setShowTerms(false);
  };

  if (showTerms)
    return (
      <CustomModal open={showTerms}>
        <div className='termsConditionsWrapper'>
          <h5>{t('disclaimer')}</h5>
          <Box my={2}>
            <p>
              <Trans
                i18nKey='disclaimerText1'
                components={{
                  alink: (
                    <a
                      className='text-primary'
                      href='https://quickswap.exchange/#/tos'
                      rel='noreferrer'
                      target='_blank'
                    />
                  ),
                }}
              />
            </p>
          </Box>
          <Box className='flex items-start'>
            <Checkbox
              checked={readTerms}
              onClick={() => setReadTerms(!readTerms)}
            />
            <p>{t('disclaimerText2')}</p>
          </Box>
          <Box className='flex items-start' my={2}>
            <Checkbox
              checked={agreeTerms}
              onClick={() => setAgreeTerms(!agreeTerms)}
            />
            <p>{t('disclaimerText3')}</p>
          </Box>
          <picture>
            <source
              srcSet={showPerpsV2 ? liquidityHubBanner : PerpsBannerWebP}
              type='image/webp'
            />
            <img
              src={showPerpsV2 ? liquidityHubBanner : PerpsBanner}
              alt='perps banner'
              width='100%'
            />
          </picture>
          {!showPerpsV2 && (
            <Box mt={2}>
              <p className='caption text-secondary'>
                <Trans
                  i18nKey='perpsBannerText'
                  components={{
                    alink: (
                      <a
                        className='text-primary'
                        href={process.env.REACT_APP_PERPS_URL}
                        rel='noreferrer'
                        target='_blank'
                      />
                    ),
                  }}
                />
              </p>
            </Box>
          )}
          <Box mt={2}>
            <Button
              fullWidth
              disabled={!readTerms || !agreeTerms}
              onClick={confirmTOS}
            >
              {t('confirm')}
            </Button>
          </Box>
        </div>
      </CustomModal>
    );

  return <>{children}</>;
}
