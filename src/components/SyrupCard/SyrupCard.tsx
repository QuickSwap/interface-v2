import React, { useState } from 'react';
import { Box } from 'theme/components';
import { SyrupInfo } from 'types';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { CurrencyLogo } from 'components';
import { formatCompact, formatTokenAmount, getEarnedUSDSyrup } from 'utils';
import { ChevronDown, ChevronUp } from 'react-feather';
import SyrupAPR from './SyrupAPR';
import SyrupCardDetails from './SyrupCardDetails';
import 'components/styles/SyrupCard.scss';
import { Trans, useTranslation } from 'react-i18next';
import { useIsXS } from 'hooks/useMediaQuery';

const SyrupCard: React.FC<{ syrup: SyrupInfo; dQUICKAPY: string }> = ({
  syrup,
  dQUICKAPY,
}) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const isMobile = useIsXS();

  const currency = unwrappedToken(syrup.token);

  const depositAmount = syrup.valueOfTotalStakedAmountInUSDC
    ? `$${syrup.valueOfTotalStakedAmountInUSDC.toLocaleString('us')}`
    : `${formatTokenAmount(syrup.totalStakedAmount)} ${
        syrup.stakingToken.symbol
      }`;

  return (
    <Box className={`syrupCard ${syrup.sponsored ? 'syrupSponsoredCard' : ''}`}>
      {syrup.sponsored && (
        <Box className='syrupSponsorTag'>{t('sponsored')}</Box>
      )}
      <Box className='syrupCardContent' onClick={() => setExpanded(!expanded)}>
        {isMobile ? (
          <>
            <Box className='flex items-center' width={expanded ? '95%' : '50%'}>
              <CurrencyLogo currency={currency} size='32px' />
              <Box margin='0 0 0 12px'>
                <small>{currency.symbol}</small>
              </Box>
            </Box>
            {!expanded && (
              <Box width='45%'>
                <SyrupAPR syrup={syrup} dQUICKAPY={dQUICKAPY} />
              </Box>
            )}
            <Box width='5%' className='text-primary flex justify-end'>
              {expanded ? <ChevronUp /> : <ChevronDown />}
            </Box>
          </>
        ) : (
          <>
            <Box width='30%' className='flex items-center'>
              <CurrencyLogo currency={currency} size='32px' />
              <Box margin='0 0 0 12px'>
                <small>{currency.symbol}</small>
                <Box margin='2px 0 0'>
                  <span>
                    {syrup.rate >= 1000000
                      ? formatCompact(syrup.rate)
                      : syrup.rate.toLocaleString('us')}
                    <span className='text-secondary'> / {t('day')}</span>
                  </span>
                </Box>
                <Box margin='2px 0 0'>
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
            <Box width='30%'>
              <small>{depositAmount}</small>
            </Box>
            <Box width='20%' textAlign='left'>
              <SyrupAPR syrup={syrup} dQUICKAPY={dQUICKAPY} />
            </Box>
            <Box width='20%' textAlign='right'>
              <Box className='flex items-center justify-end' margin='0 0 2px'>
                <CurrencyLogo currency={currency} size='16px' />
                <small style={{ marginLeft: 5 }}>
                  {formatTokenAmount(syrup.earnedAmount)}
                </small>
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
