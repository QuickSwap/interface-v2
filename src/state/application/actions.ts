import { createAction } from '@reduxjs/toolkit';
import { TokenList } from '@uniswap/token-lists';
import { TokenDetail } from './reducer';
import { SoulZap_UniV2_ApeBond } from '@soulsolidity/soulzap-v1';

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
  SETTINGSV3,
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

export const updateMaticPrice = createAction<{
  price: number;
  oneDayPrice: number;
  maticPriceChange: number;
}>('application/updateMaticPrice');

export const addBookMarkToken = createAction<string>(
  'application/addBookMarkedToken',
);

export const removeBookmarkToken = createAction<string>(
  'application/removeBookMarkedToken',
);

export const updateBookmarkTokens = createAction<string[]>(
  'application/updateBookMarkedTokens',
);

export const addBookMarkPair = createAction<string>(
  'application/addBookMarkPair',
);

export const removeBookmarkPair = createAction<string>(
  'application/removeBookmarkPair',
);

export const updateBookmarkPairs = createAction<string[]>(
  'application/updateBookmarkPairs',
);

export const updateTokenDetails = createAction<TokenDetail>(
  'application/updateTokenDetail',
);

export const updateIsV2 = createAction<boolean>('application/updateIsV2');

export const updateUDDomain = createAction<string | undefined>(
  'application/updateUDDomain',
);

export const updateSoulZap = createAction<SoulZap_UniV2_ApeBond | undefined>(
  'application/updateSoulZap',
);

export const updateOpenNetworkSelection = createAction<boolean>(
  'application/updateOpenNetworkSelection',
);
