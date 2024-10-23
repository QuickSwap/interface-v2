import React from 'react';
import { Box } from '@material-ui/core';
import { Trans, useTranslation } from 'react-i18next';

const TOSPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Box width='100%' padding='0 0 64px' maxWidth={800} id='tosPage'>
      <h4>{t('termsOfService')}</h4>
      <br />
      <p className='small'>{t('termsOfServiceText1')}</p>
      <br />
      <br />
      <p className='small'>{t('termsOfServiceText2')}</p>
      <br />
      <small>
        <Trans
          i18nKey='termsOfServiceText3'
          components={{
            alink: (
              <a
                className='text-primary'
                href='mailto:legal@quickswap.exchange'
              />
            ),
          }}
          values={{ email: 'legal@quickswap.exchange' }}
        />
      </small>
      <br />
      <br />
      <p className='text-bold'>{t('eligibility')}</p>
      <br />
      <small>{t('eligibilityText1')}</small>
      <br />
      <ol>
        <li>{t('eligibilityText2')}</li>
        <li>{t('eligibilityText3')}</li>
        <li>{t('eligibilityText4')}</li>
        <li>{t('eligibilityText5')}</li>
        <li>{t('eligibilityText6')}</li>
      </ol>
      <br />
      <h5>1. {t('siteOverview')}</h5>
      <br />
      <p className='text-bold'>1.1 {t('aboutTheSite')}</p>
      <br />
      <small>{t('aboutTheSiteText1')}</small>
      <br />
      <ol style={{ listStyleType: 'inherit' }}>
        <li>{t('aboutTheSiteText2')}</li>
        <li>{t('aboutTheSiteText3')}</li>
        <li>{t('aboutTheSiteText4')}</li>
        <li>{t('aboutTheSiteText5')}</li>
        <li>{t('aboutTheSiteText6')}</li>
      </ol>
      <small>{t('aboutTheSiteText7')}</small>
      <br />
      <br />
      <p className='text-bold'>1.2 {t('aboutQuickSwap')}</p>
      <br />
      <small>{t('aboutQuickSwapText')}</small>
      <br />
      <br />
      <p className='text-bold'>1.3 {t('relationshipQuickSwapSmartContract')}</p>
      <br />
      <small>{t('relationshipQuickswapSmartContractText1')}</small>
      <br />
      <br />
      <small>{t('relationshipQuickswapSmartContractText2')}</small>
      <br />
      <br />
      <small>{t('relationshipQuickswapSmartContractText3')}</small>
      <br />
      <br />
      <small>{t('relationshipQuickswapSmartContractText4')}</small>
      <br />
      <br />
      <h5>2. {t('siteOperatorDiscretion')}</h5>
      <br />
      <small>{t('siteOperatorDiscretionText1')}</small>
      <br />
      <br />
      <p className='text-bold'>2.1 {t('content')}</p>
      <br />
      <small>{t('siteOperatorDiscretionText2')}</small>
      <br />
      <br />
      <p className='text-bold'>2.2 {t('tokenListsandTokenIdentification')}</p>
      <br />
      <small>{t('siteOperatorDiscretionText2')}</small>
    </Box>
  );
};

export default TOSPage;
