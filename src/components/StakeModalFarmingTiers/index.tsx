import React from 'react';
import CurrencyLogo from 'components/CurrencyLogo';
import { useActiveWeb3React } from 'hooks';
import { WrappedCurrency } from 'models/types';
import { useCallback, useMemo, useState } from 'react';
import { useCurrencyBalance } from 'state/wallet/hooks';
// import styles from './StakeModalFarmingTiers.module.scss';

import { formatAmountTokens } from 'utils/numbers';
import { HelpCircle } from 'react-feather';
import Link from 'next/link';
import { Token } from '@uniswap/sdk-core';

import { ChainId } from '@uniswap/sdk';
import { useTranslation } from 'next-i18next';

interface StakeModalFarmingTiersProps {
  tiersLimits: {
    low: string;
    medium: string;
    high: string;
  };
  tiersMultipliers: {
    low: string;
    medium: string;
    high: string;
  };
  selectTier: any;
  multiplierToken: any;
}

export default function StakeModalFarmingTiers({
  tiersLimits,
  tiersMultipliers,
  selectTier,
  multiplierToken,
}: StakeModalFarmingTiersProps) {
  const { account, chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const { t } = useTranslation();

  const [selectedTier, setSelectedTier] = useState<number | undefined>(0);

  const balance = useCurrencyBalance(
    account ?? undefined,
    new Token(
      chainIdToUse,
      multiplierToken.id,
      +multiplierToken.decimals,
      multiplierToken.symbol,
      multiplierToken.name,
    ) ?? undefined,
  );
  const _balance = useMemo(() => (!balance ? '' : balance.toSignificant(4)), [
    balance,
  ]);

  const handleTier = useCallback(
    (tier: any) => {
      if (selectedTier === tier) {
        setSelectedTier(undefined);
        selectTier('');
        return;
      }
      setSelectedTier(tier);
      selectTier(tier);
    },
    [selectTier, selectedTier],
  );

  const tiersList = useMemo(() => {
    if (!tiersLimits || !tiersMultipliers) return [];

    return [
      { img: '/images/no-tier-icon.png', title: `No tier`, lock: 0, earn: 0 },
      {
        img: '/images/bachelor-tier-icon.png',
        title: `Bachelor`,
        lock: +tiersLimits.low,
        earn: +tiersMultipliers.low,
      },
      {
        img: '/images/master-tier-icon.png',
        title: `Master`,
        lock: +tiersLimits.medium,
        earn: +tiersMultipliers.medium,
      },
      {
        img: '/images/professor-tier-icon.png',
        title: `Professor`,
        lock: +tiersLimits.high,
        earn: +tiersMultipliers.high,
      },
    ];
  }, [tiersLimits, tiersMultipliers]);

  return (
    <div className='f c'>
      <div className='mb-1 f-ac f farming-tier__balance br-8'>
        <div className='mr-1 farming-tier__balance-title'>{t('balance')}</div>
        <div>
          <div className='f'>
            <CurrencyLogo
              currency={
                new Token(
                  chainIdToUse,
                  multiplierToken.id,
                  +multiplierToken.decimals,
                  multiplierToken.symbol,
                  multiplierToken.name,
                ) as WrappedCurrency
              }
            />
            <div
              className='ml-05'
              style={{ lineHeight: '24px' }}
            >{`${_balance} ${multiplierToken.symbol}`}</div>
          </div>
        </div>
        <div className='ml-a mxs_display-none ms_display-none'>
          <Link href={'/swap'} className='farming-tier__balance-buy b'>{`${t(
            'buy',
          )} ${multiplierToken.symbol} →`}</Link>
        </div>
      </div>
      <div className='mb-1 f w-100'>
        <span className='b' style={{ fontSize: '18px' }}>
          1. {t('selectTier')}
        </span>
        <div className='ml-a f f-ac farming-tier__hint'>
          <HelpCircle color='#347CC9' size={'14px'} />
          <a
            href={`${process.env.NEXT_PUBLIC_V3_FARMS_HELP_BASE_URL}/en/farm/multi-level-farming-on-algebra`}
            target={'_blank'}
            rel={'noreferrer noopener'}
            className='ml-05'
          >
            {t('howTiersWork')}
          </a>
        </div>
      </div>
      <div className='pb-1 pl-1 pr-1 f w-100 farming-tier-wrapper mxs_pb-0'>
        {tiersList.map((tier, i) => (
          <button
            className='p-1 f c w-100 farming-tier'
            key={i}
            data-selected={selectedTier === i}
            onClick={() => handleTier(i)}
          >
            <div className='p-1 farming-tier__header w-100 ta-l pos-r'>
              <div className='mb-1 farming-tier__img'>
                <picture>
                  <img width={48} height={48} src={tier.img} alt='Tier Image' />
                </picture>
              </div>
              <div className='farming-tier__title b f f-jb'>
                <span>{tier.title}</span>
              </div>
            </div>
            <div className='p-1 farming-tier__body w-100'>
              <div className='mb-1 farming-tier__locked w-100 f ac'>
                <span className='b'>{t('lock')}:</span>
                <span className='ml-a farming-tier__locked-value'>
                  {tier.lock
                    ? `${formatAmountTokens(
                        tier.lock / Math.pow(10, +multiplierToken.decimals),
                        true,
                      )} ${multiplierToken.symbol}`
                    : '-'}
                </span>
              </div>
              <div className='farming-tier__rewards f'>
                <span className='b'>{t('earn')}:</span>
                <span className='ml-a farming-tier__rewards-value'>
                  {tier.earn ? `${100 + (tier.earn - 10000) / 100}%` : '100%'}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
