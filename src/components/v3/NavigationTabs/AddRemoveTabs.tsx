import React, { ReactNode } from 'react';
import { Percent } from '@uniswap/sdk-core';
import { useAppDispatch } from 'state/hooks';
import { Link as HistoryLink, useLocation } from 'react-router-dom';
import { resetMintState } from 'state/mint/actions';
import { resetMintState as resetMintV3State } from 'state/mint/v3/actions';
import { Box } from 'rebass';
import { ArrowLeft } from 'react-feather';

interface AddRemoveTabsProps {
  adding: boolean;
  creating: boolean;
  defaultSlippage: Percent;
  positionID?: string | undefined;
  showBackLink?: boolean;
  children?: ReactNode | undefined;
}

export function AddRemoveTabs({
  adding,
  creating,
  defaultSlippage,
  positionID,
  children,
}: AddRemoveTabsProps) {
  // reset states on back
  const dispatch = useAppDispatch();
  const location = useLocation();

  // detect if back should redirect to v3 or v2 pool page
  const poolLink = location.pathname.includes('add/v2')
    ? '/pool/v2'
    : '/pool' + (!!positionID ? `/${positionID.toString()}` : '');

  return (
    <div className={'flex-s-between'}>
      <HistoryLink
        to={poolLink}
        onClick={() => {
          if (adding) {
            // not 100% sure both of these are needed
            dispatch(resetMintState());
            dispatch(resetMintV3State());
          }
        }}
      >
        <ArrowLeft stroke={'white'} />
      </HistoryLink>
      <span className={'fs-125 w-100 ta-c'}>
        {creating
          ? 'Create a pair'
          : adding
          ? 'Increase Liquidity'
          : 'Remove Liquidity'}
      </span>
      <Box style={{ marginRight: '.5rem' }}>{children}</Box>
      {/* <SettingsTab placeholderSlippage={defaultSlippage} /> */}
    </div>
  );
}
