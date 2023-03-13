import React from 'react';
import CurrencyLogo from 'components/CurrencyLogo';
import { useActiveWeb3React } from 'hooks';
import { WrappedCurrency } from 'models/types';
import { useCallback, useMemo, useState } from 'react';
import { useCurrencyBalance } from 'state/wallet/hooks';
import './index.scss';

import { formatAmountTokens } from 'utils/numbers';
import { HelpCircle } from 'react-feather';
import { Link } from 'react-router-dom';

import { Token } from '@uniswap/sdk-core';

import NoTierIcon from '../../assets/images/no-tier-icon.png';
import BachelorTierIcon from '../../assets/images/bachelor-tier-icon.png';
import MasterTierIcon from '../../assets/images/master-tier-icon.png';
import ProfessorTierIcon from '../../assets/images/professor-tier-icon.png';
import { ChainId } from '@uniswap/sdk';
import { useTranslation } from 'react-i18next';

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
  const { account } = useActiveWeb3React();
  const { t } = useTranslation();

  const [selectedTier, setSelectedTier] = useState<number | undefined>(0);

  const balance = useCurrencyBalance(
    account ?? undefined,
    new Token(
      ChainId.MATIC,
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
    (tier) => {
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
      { img: NoTierIcon, title: `No tier`, lock: 0, earn: 0 },
      {
        img: BachelorTierIcon,
        title: `Bachelor`,
        lock: +tiersLimits.low,
        earn: +tiersMultipliers.low,
      },
      {
        img: MasterTierIcon,
        title: `Master`,
        lock: +tiersLimits.medium,
        earn: +tiersMultipliers.medium,
      },
      {
        img: ProfessorTierIcon,
        title: `Professor`,
        lock: +tiersLimits.high,
        earn: +tiersMultipliers.high,
      },
    ];
  }, [tiersLimits, tiersMultipliers]);

  return (
    <div className='f c'>
      <div className='f-ac f farming-tier__balance br-8 mb-1'>
        <div className='farming-tier__balance-title mr-1'>{t('balance')}</div>
        <div>
          <div className='f'>
            <CurrencyLogo
              currency={
                new Token(
                  ChainId.MATIC,
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
          <Link to={'/swap'} className='farming-tier__balance-buy b'>{`${t(
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
            href={`${process.env.REACT_APP_V3_FARMS_HELP_BASE_URL}/en/farm/multi-level-farming-on-algebra`}
            target={'_blank'}
            rel={'noreferrer noopener'}
            className='ml-05'
          >
            {t('howTiersWork')}
          </a>
        </div>
      </div>
      <div className='f w-100 farming-tier-wrapper pl-1 pb-1 pr-1 mxs_pb-0'>
        {tiersList.map((tier, i) => (
          <button
            className='p-1 f c w-100 farming-tier'
            key={i}
            data-selected={selectedTier === i}
            onClick={() => handleTier(i)}
          >
            <div className='p-1 farming-tier__header w-100 ta-l pos-r'>
              <div className='farming-tier__img mb-1'>
                <img width={'48px'} height={'48px'} src={tier.img} />
              </div>
              <div className='farming-tier__title b f f-jb'>
                <span>{tier.title}</span>
              </div>
            </div>
            <div className='p-1 farming-tier__body w-100'>
              <div className='farming-tier__locked w-100 f ac mb-1'>
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
