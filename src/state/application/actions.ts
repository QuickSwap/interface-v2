import { createAction } from '@reduxjs/toolkit';
import { TokenList } from '@uniswap/token-lists';

export type PopupContent =
  | {
      txn: {
        hash: string;
        pending?: boolean;
        success: boolean;
        summary?: string;
      };
    }
  | {
      listUpdate: {
        listUrl: string;
        oldList: TokenList;
        newList: TokenList;
        auto: boolean;
      };
    };

export enum ApplicationModal {
  WALLET,
  SETTINGS,
  SELF_CLAIM,
  ADDRESS_CLAIM,
  CLAIM_POPUP,
  MENU,
}

export const updateBlockNumber = createAction<{
  chainId: number;
  blockNumber: number;
}>('application/updateBlockNumber');

export const setOpenModal = createAction<ApplicationModal | null>(
  'application/setOpenModal',
);

export const addPopup = createAction<{
  key?: string;
  removeAfterMs?: number | null;
  content: PopupContent;
}>('application/addPopup');

export const removePopup = createAction<{ key: string }>(
  'application/removePopup',
);

export const updateEthPrice = createAction<{
  price: any;
  oneDayPrice: any;
  ethPriceChange: any;
}>('application/updateEthPrice');

export const updateGlobalData = createAction<{ data: any }>(
  'application/updateGlobalData',
);

export const updateTopTokens = createAction<{ data: any }>(
  'application/updateTopTokens',
);

export const updateTokenPairs = createAction<{ data: any }>(
  'application/updateTokenPairs',
);

export const updateSwapTokenPrice0 = createAction<{ data: any }>(
  'application/updateSwapTokenPrice0',
);

export const updateSwapTokenPrice1 = createAction<{ data: any }>(
  'application/updateSwapTokenPrice1',
);
