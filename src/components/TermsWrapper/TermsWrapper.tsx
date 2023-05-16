import React, { ReactNode, useState } from 'react';
import { CustomModal } from 'components';
import { Trans, useTranslation } from 'react-i18next';
import 'components/styles/TermsWrapper.scss';
import { Button, Checkbox } from '@material-ui/core';

export default function TermsWrapper({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [readTerms, setReadTerms] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(true);

  if (showTerms)
    return (
      <CustomModal open={showTerms}>
        <div className='termsConditionsWrapper'>
          <h6>{t('disclaimer')}</h6>
          <p>
            <Trans
              i18nKey='disclaimerText1'
              components={{
                alink: (
                  <a
                    href='https://docs.google.com/document/d/1Gglh43oxUZHdgrS2L9lZfsI4f6HYNF6MbBDsDPJVFkM/edit'
                    rel='noreferrer'
                    target='_blank'
                  />
                ),
              }}
            />
          </p>
          <div className='flex'>
            <Checkbox
              checked={readTerms}
              onClick={() => setReadTerms(!readTerms)}
            />
            <p>{t('disclaimerText2')}</p>
          </div>
          <div className='flex'>
            <Checkbox
              checked={agreeTerms}
              onClick={() => setAgreeTerms(!agreeTerms)}
            />
            <p>{t('disclaimerText2')}</p>
          </div>
          <Button
            disabled={!readTerms || !agreeTerms}
            onClick={() => setShowTerms(false)}
          >
            {t('confirm')}
          </Button>
        </div>
      </CustomModal>
    );

  return <>{children}</>;
}
