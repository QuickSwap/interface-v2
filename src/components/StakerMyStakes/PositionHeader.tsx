import React, { useMemo } from 'react';
import { NFTPositionIcon } from './styled';
import { IsActive } from './IsActive';
import CurrencyLogo from '../CurrencyLogo';
import { Token } from '@uniswap/sdk-core';
import { WrappedCurrency } from '../../models/types';
import Loader from '../Loader';
import { ChevronsUp, Send } from 'react-feather';
import { Deposit, UnfarmingInterface } from '../../models/interfaces';

interface PositionHeaderProps {
  el: Deposit;
  unstaking: UnfarmingInterface;
  setSendModal: any;
  setUnstaking: any;
  withdrawHandler: any;
}

export default function PositionHeader({
  el,
  unstaking,
  setUnstaking,
  withdrawHandler,
  setSendModal,
}: PositionHeaderProps) {
  return (
    <div
      className={'my-farms__position-card__header flex-s-between mb-1 br-8 p-1'}
    >
      <div className={'my-farms__position-card__header__row'}>
        <div className={'f f-ac mxs_ml-0 mxs_mb-1'}>
          <NFTPositionIcon name={el.id}>
            <span>{el.id}</span>
          </NFTPositionIcon>
          <div className={'ml-05'}>
            <IsActive el={el} />
            <a
              style={{ textDecoration: 'underline' }}
              className={'c-w fs-075'}
              href={`https://app.algebra.finance/#/pool/${+el.id}?onFarming=true`}
              rel='noopener noreferrer'
              target='_blank'
            >
              View position
            </a>
          </div>
        </div>
        <div className={'f f-ac ml-2 mxs_ml-0 mxs_mv-1'}>
          <CurrencyLogo
            currency={
              new Token(
                97,
                el.token0,
                18,
                el.pool.token0.symbol,
              ) as WrappedCurrency
            }
            size={'35px'}
          />
          <CurrencyLogo
            currency={
              new Token(
                97,
                el.token1,
                18,
                el.pool.token1.symbol,
              ) as WrappedCurrency
            }
            size={'35px'}
            style={{ marginLeft: '-1rem' }}
          />
          <div className={'ml-05'}>
            <div className={'b fs-075'} style={{ marginBottom: '2px' }}>
              POOL
            </div>
            <div>{`${el.pool.token0.symbol} / ${el.pool.token1.symbol}`}</div>
          </div>
        </div>
      </div>
      <div className={'my-farms__position-card__header__row'}>
        {!el.limitFarming && !el.eternalFarming && (
          <button
            className={'btn c-w f f-ac b pv-05 ph-1 mxs_mv-05 mxs_f-jc'}
            disabled={unstaking.id === el.id && unstaking.state !== 'done'}
            onClick={() => {
              setUnstaking({ id: el.id, state: 'pending' });
              withdrawHandler(el.id);
            }}
          >
            {unstaking &&
            unstaking.id === el.id &&
            unstaking.state !== 'done' ? (
              <>
                <Loader
                  size={'1rem'}
                  stroke={'var(--white)'}
                  style={{ margin: 'auto' }}
                />
                <span className={'ml-05'}>Withdrawing</span>
              </>
            ) : (
              <>
                <ChevronsUp size={'1rem'} />
                <span className={'ml-05'}>{`Withdraw`}</span>
              </>
            )}
          </button>
        )}
        <button
          className={'btn c-w f f-ac b pv-05 ph-1 ml-05 mxs_ml-0 mxs_f-jc'}
          onClick={() => setSendModal(el.L2tokenId)}
        >
          <Send size={'1rem'} />
          <span className={'ml-05'}>Send</span>
        </button>
      </div>
    </div>
  );
}
