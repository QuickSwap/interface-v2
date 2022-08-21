import React, { useEffect, useMemo, useState } from 'react';
import Loader from 'components/Loader';
import { CheckCircle, XCircle } from 'react-feather';
import { Link } from 'react-router-dom';
import { useAppDispatch } from 'state/hooks';
import {
  setAddLiquidityTxHash,
  setShowNewestPosition,
} from 'state/mint/v3/actions';
import { useAddLiquidityTxHash } from 'state/mint/v3/hooks';
import { useAllTransactions } from 'state/transactions/hooks';
import './index.scss';

interface IAftermath {
  done?: boolean;
  Button: any;
  rejected: boolean;
}

export function Aftermath({ done, Button, rejected }: IAftermath) {
  const [isConfirmed, toggleIsConfirmed] = useState(false);
  const [isError, toggleIsError] = useState(false);

  const allTransactions = useAllTransactions();

  const dispatch = useAppDispatch();
  const txHash = useAddLiquidityTxHash();

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions);
    return txs
      .filter((tx) => new Date().getTime() - tx.addedTime < 86_400_000)
      .sort((a, b) => b.addedTime - a.addedTime);
  }, [allTransactions]);

  const confirmed = useMemo(
    () =>
      sortedRecentTransactions.filter((tx) => tx.receipt).map((tx) => tx.hash),
    [sortedRecentTransactions, allTransactions],
  );

  const failed = useMemo(
    () =>
      sortedRecentTransactions
        .filter((tx) => tx.receipt)
        .map((tx) => ({ hash: tx.hash, status: tx.receipt?.status })),
    [sortedRecentTransactions, allTransactions],
  );

  useEffect(() => {
    if (confirmed.some((hash) => hash === txHash)) {
      toggleIsConfirmed(true);
      dispatch(setAddLiquidityTxHash({ txHash: '' }));
      dispatch(setShowNewestPosition({ showNewestPosition: true }));
    }
  }, [confirmed, txHash]);

  useEffect(() => {
    if (failed.some((hash) => hash.hash === txHash && hash.status === 0)) {
      toggleIsError(true);
      dispatch(setAddLiquidityTxHash({ txHash: '' }));
      dispatch(setShowNewestPosition({ showNewestPosition: true }));
    }
  }, [failed, txHash]);

  useEffect(() => {
    console.log(rejected, isError);
    if (rejected) {
      toggleIsError(true);
    }
  }, [rejected]);

  return (
    <div
      className='f c f-ac f-jc w-100'
      style={{ height: 'calc(414px + 4rem)' }}
    >
      {isError ? (
        <>
          <div>
            {' '}
            <XCircle size={'36px'} stroke={'var(--red)'} />
          </div>
          <div className='mt-1 fs-125'>Transaction Failed</div>
          <div
            onClick={() => {
              toggleIsError(false);
              toggleIsConfirmed(false);
            }}
          >
            <Button />
          </div>
        </>
      ) : isConfirmed ? (
        <>
          <div>
            {' '}
            <CheckCircle size={'36px'} stroke={'var(--green)'} />
          </div>
          <div className='mt-1 fs-125'>Liquidity added!</div>
          <Link to={'/v3pools'} className='go-to-pools mt-2'>
            Go to pools
          </Link>
        </>
      ) : (
        <>
          <div>
            <Loader size={'36px'} stroke={'white'} />
          </div>
          <div className='mt-1 fs-125'>Adding liquidity</div>
        </>
      )}
    </div>
  );
}
