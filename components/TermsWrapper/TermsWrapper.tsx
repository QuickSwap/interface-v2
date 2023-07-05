import React, { ReactNode, useEffect, useState } from 'react';
import { CustomModal } from 'components';
import { Trans, useTranslation } from 'next-i18next';
import styles from 'styles/components/TermsWrapper.module.scss';
import { Box, Button, Checkbox } from '@mui/material';

export default function TermsWrapper({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [readTerms, setReadTerms] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const currentTOSVersion = process.env.NEXT_PUBLIC_TOS_VERSION;

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
        <div className={styles.termsConditionsWrapper}>
          <h5>{t('disclaimer')}</h5>
          <Box my={2}>
            <p>
              <Trans
                i18nKey='disclaimerText1'
                components={{
                  alink: (
                    <a
                      className='text-primary'
                      href='https://docs.google.com/document/d/1Gglh43oxUZHdgrS2L9lZfsI4f6HYNF6MbBDsDPJVFkM/edit'
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
          <Image
            src='assets/images/perpsBanner.png'
            alt='perps banner'
            width='100%'
          />
          <Box my={2}>
            <p className='caption text-secondary'>
              <Trans
                i18nKey='perpsBannerText'
                components={{
                  alink: (
                    <a
                      className='text-primary'
                      href={process.env.NEXT_PUBLIC_PERPS_URL}
                      rel='noreferrer'
                      target='_blank'
                    />
                  ),
                }}
              />
            </p>
          </Box>
          <Button
            fullWidth
            disabled={!readTerms || !agreeTerms}
            onClick={confirmTOS}
          >
            {t('confirm')}
          </Button>
        </div>
      </CustomModal>
    );

  return <>{children}</>;
}
