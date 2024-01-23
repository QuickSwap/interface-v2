import React, { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { SyrupInfo } from 'types/index';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { CurrencyLogo } from 'components';
import { formatCompact, formatTokenAmount, getEarnedUSDSyrup } from 'utils';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import SyrupAPR from './SyrupAPR';
import SyrupCardDetails from './SyrupCardDetails';
import styles from 'styles/components/SyrupCard.module.scss';
import { Trans, useTranslation } from 'next-i18next';

const SyrupCard: React.FC<{ syrup: SyrupInfo; dQUICKAPY: string }> = ({
  syrup,
  dQUICKAPY,
}) => {
  const { t } = useTranslation();
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('sm'));
  const [expanded, setExpanded] = useState(false);

  const currency = unwrappedToken(syrup.token);

  const depositAmount = syrup.valueOfTotalStakedAmountInUSDC
    ? `$${syrup.valueOfTotalStakedAmountInUSDC.toLocaleString('us')}`
    : `${formatTokenAmount(syrup.totalStakedAmount)} ${
        syrup.stakingToken.symbol
      }`;

  return (
    <Box
      className={`${styles.syrupCard} ${
        syrup.sponsored ? styles.syrupSponsoredCard : ''
      }`}
    >
      {syrup.sponsored && (
        <Box className={styles.syrupSponsorTag}>{t('sponsored')}</Box>
      )}
      <Box
        className={styles.syrupCardContent}
        onClick={() => setExpanded(!expanded)}
      >
        {isMobile ? (
          <>
            <Box
              className='flex items-center'
              width={expanded ? 0.95 : 0.5}
              gap='12px'
            >
              <CurrencyLogo currency={currency} size={32} />
              <small>{currency.symbol}</small>
            </Box>
            {!expanded && (
              <Box width={0.45}>
                <SyrupAPR syrup={syrup} dQUICKAPY={dQUICKAPY} />
              </Box>
            )}
            <Box width={0.05} className='flex justify-end text-primary'>
              {expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </Box>
          </>
        ) : (
          <>
            <Box width={0.3} className='flex items-center'>
              <CurrencyLogo currency={currency} size={32} />
              <Box ml={1.5}>
                <small>{currency.symbol}</small>
                <Box mt={0.25}>
                  <span>
                    {syrup.rate >= 1000000
                      ? formatCompact(syrup.rate)
                      : syrup.rate.toLocaleString('us')}
                    <span className='text-secondary'> / {t('day')}</span>
                  </span>
                </Box>
                <Box mt={0.25}>
                  <span>
                    $
                    {syrup.rewardTokenPriceinUSD
                      ? (
                          syrup.rate * syrup.rewardTokenPriceinUSD
                        ).toLocaleString('us')
                      : '-'}{' '}
                    <span className='text-secondary'>/ {t('day')}</span>
                  </span>
                </Box>
              </Box>
            </Box>
            <Box width={0.3}>
              <small>{depositAmount}</small>
            </Box>
            <Box width={0.2} textAlign='left'>
              <SyrupAPR syrup={syrup} dQUICKAPY={dQUICKAPY} />
            </Box>
            <Box width={0.2} textAlign='right'>
              <Box
                className='flex items-center justify-end'
                mb={0.25}
                gap='5px'
              >
                <CurrencyLogo currency={currency} size={16} />
                <small>{formatTokenAmount(syrup.earnedAmount)}</small>
              </Box>
              <small className='text-secondary'>
                {getEarnedUSDSyrup(syrup)}
              </small>
            </Box>
          </>
        )}
      </Box>
      {expanded && syrup && (
        <SyrupCardDetails syrup={syrup} dQUICKAPY={dQUICKAPY} />
      )}
      {syrup.sponsored && syrup.sponsorLink && (
        <Box className='syrupSponsoredLink'>
          <Trans
            i18nKey='learnmoreproject'
            components={{
              alink: (
                <a href={syrup.sponsorLink} rel='noreferrer' target='_blank' />
              ),
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default React.memo(SyrupCard);
