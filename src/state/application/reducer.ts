import { createReducer, nanoid } from '@reduxjs/toolkit';
import {
  addPopup,
  PopupContent,
  removePopup,
  updateBlockNumber,
  ApplicationModal,
  setOpenModal,
  addBookMarkToken,
  removeBookmarkToken,
  updateBookmarkTokens,
  addBookMarkPair,
  removeBookmarkPair,
  updateBookmarkPairs,
  updateTokenDetails,
  updateMaticPrice,
  updateIsV2,
  updateIsV4,
  updateIsLpLock,
  updateSoulZap,
  updateOpenNetworkSelection,
} from './actions';
import { SoulZap_UniV2_ApeBond } from '@soulsolidity/soulzap-v1';

type PopupList = Array<{
  key: string;
  show: boolean;
  content: PopupContent;
  removeAfterMs: number | null;
}>;

export interface TokenDetail {
  address: string;
  tokenData: any;
  priceData: any;
}

export interface ETHPrice {
  price?: number;
  oneDayPrice?: number;
  ethPriceChange?: number;
}

export interface MaticPrice {
  price?: number;
  oneDayPrice?: number;
  maticPriceChange?: number;
}

export interface ApplicationState {
  readonly blockNumber: { readonly [chainId: number]: number };
  readonly popupList: PopupList;
  readonly openModal: ApplicationModal | null;
  readonly ethPrice: ETHPrice;
  readonly maticPrice: MaticPrice;
  readonly globalData: any;
  readonly bookmarkedTokens: string[];
  readonly bookmarkedPairs: string[];
  readonly analyticToken: any;
  readonly tokenChartData: any;
  readonly tokenDetails: TokenDetail[];
  readonly isV2: boolean | undefined;
  readonly isV4: boolean | undefined;
  readonly isLpLock: boolean | undefined;
  readonly soulZap: SoulZap_UniV2_ApeBond | null | undefined;
  readonly openNetworkSelection: boolean;
}

const initialState: ApplicationState = {
  blockNumber: {},
  popupList: [],
  openModal: null,
  globalData: null,
  ethPrice: {},
  maticPrice: {},
  bookmarkedTokens: [],
  bookmarkedPairs: [],
  analyticToken: null,
  tokenChartData: null,
  tokenDetails: [],
  isV2: undefined,
  isV4: undefined,
  isLpLock: undefined,
  soulZap: undefined,
  openNetworkSelection: false,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateBlockNumber, (state, action) => {
      const { chainId, blockNumber } = action.payload;
      if (typeof state.blockNumber[chainId] !== 'number') {
        state.blockNumber[chainId] = blockNumber;
      } else {
        state.blockNumber[chainId] = Math.max(
          blockNumber,
          state.blockNumber[chainId],
        );
      }
    })
    .addCase(setOpenModal, (state, action) => {
      state.openModal = action.payload;
    })
    .addCase(
      addPopup,
      (state, { payload: { content, key, removeAfterMs = 15000 } }) => {
        state.popupList = (key
          ? state.popupList.filter((popup) => popup.key !== key)
          : state.popupList
        ).concat([
          {
            key: key || nanoid(),
            show: true,
            content,
            removeAfterMs,
          },
        ]);
      },
    )
    .addCase(removePopup, (state, { payload: { key } }) => {
      state.popupList.forEach((p) => {
        if (p.key === key) {
          p.show = false;
        }
      });
    })
    .addCase(
      updateMaticPrice,
      (state, { payload: { price, oneDayPrice, maticPriceChange } }) => {
        state.maticPrice = {
          price,
          oneDayPrice,
          maticPriceChange,
        };
      },
    )
    .addCase(addBookMarkToken, (state, { payload }) => {
      const tokens = state.bookmarkedTokens;
      tokens.push(payload);
      state.bookmarkedTokens = tokens;
    })
    .addCase(removeBookmarkToken, (state, { payload }) => {
      state.bookmarkedTokens = state.bookmarkedTokens.filter(
        (item) => item !== payload,
      );
    })
    .addCase(updateBookmarkTokens, (state, { payload }) => {
      state.bookmarkedTokens = payload;
    })
    .addCase(addBookMarkPair, (state, { payload }) => {
      const pairs = state.bookmarkedPairs;
      pairs.push(payload);
      state.bookmarkedPairs = pairs;
    })
    .addCase(removeBookmarkPair, (state, { payload }) => {
      const pairIndex = state.bookmarkedPairs.indexOf(payload);
      const pairs = state.bookmarkedPairs
        .slice(0, pairIndex - 1)
        .concat(
          state.bookmarkedPairs.slice(
            pairIndex + 1,
            state.bookmarkedPairs.length - 1,
          ),
        );
      state.bookmarkedPairs = pairs;
    })
    .addCase(updateBookmarkPairs, (state, { payload }) => {
      state.bookmarkedPairs = payload;
    })
    .addCase(updateTokenDetails, (state, { payload }) => {
      const updatedTokenDetails = state.tokenDetails;
      const detailIndex = updatedTokenDetails.findIndex(
        (item) => item.address === payload.address,
      );
      if (detailIndex > -1) {
        updatedTokenDetails[detailIndex] = payload;
      } else {
        updatedTokenDetails.push(payload);
      }
      state.tokenDetails = updatedTokenDetails;
    })
    .addCase(updateIsV2, (state, { payload }) => {
      state.isV2 = payload;
    })
    .addCase(updateIsV4, (state, { payload }) => {
      state.isV4 = payload;
    })
    .addCase(updateIsLpLock, (state, { payload }) => {
      state.isLpLock = payload;
    })
    .addCase(updateSoulZap, (state, { payload }) => {
      state.soulZap = payload;
    })
    .addCase(updateOpenNetworkSelection, (state, { payload }) => {
      state.openNetworkSelection = payload;
    }),
);
