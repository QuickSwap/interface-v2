import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useActiveWeb3React } from 'hooks';
import { AppDispatch, AppState } from 'state';
import {
  addPopup,
  ApplicationModal,
  PopupContent,
  removePopup,
  setOpenModal,
  addBookMarkToken,
  removeBookmarkToken,
  updateBookmarkTokens,
  addBookMarkPair,
  removeBookmarkPair,
  updateTokenDetails,
  updateIsV2,
  updateIsLpLock,
  updateOpenNetworkSelection,
} from './actions';
import { TokenDetail } from './reducer';

export function useBlockNumber(): number | undefined {
  const { chainId } = useActiveWeb3React();

  return useSelector(
    (state: AppState) => state.application.blockNumber[chainId ?? -1],
  );
}

export function useModalOpen(modal: ApplicationModal): boolean {
  const openModal = useSelector(
    (state: AppState) => state.application.openModal,
  );
  return openModal === modal;
}

export function useToggleModal(modal: ApplicationModal): () => void {
  const open = useModalOpen(modal);
  const dispatch = useDispatch<AppDispatch>();
  return useCallback(() => dispatch(setOpenModal(open ? null : modal)), [
    dispatch,
    modal,
    open,
  ]);
}

export function useOpenModal(modal: ApplicationModal): () => void {
  const dispatch = useDispatch<AppDispatch>();
  return useCallback(() => dispatch(setOpenModal(modal)), [dispatch, modal]);
}

export function useCloseModals(): () => void {
  const dispatch = useDispatch<AppDispatch>();
  return useCallback(() => dispatch(setOpenModal(null)), [dispatch]);
}

export function useToggleSettingsMenu(): () => void {
  return useToggleModal(ApplicationModal.SETTINGS);
}

export function useToggleV3SettingsMenu(): () => void {
  return useToggleModal(ApplicationModal.SETTINGSV3);
}

export function useShowClaimPopup(): boolean {
  return useModalOpen(ApplicationModal.CLAIM_POPUP);
}

export function useToggleShowClaimPopup(): () => void {
  return useToggleModal(ApplicationModal.CLAIM_POPUP);
}

export function useToggleSelfClaimModal(): () => void {
  return useToggleModal(ApplicationModal.SELF_CLAIM);
}

// returns a function that allows adding a popup
export function useAddPopup(): (
  content: PopupContent,
  key?: string,
  removeAfterMs?: number | null,
) => void {
  const dispatch = useDispatch();

  return useCallback(
    (content: PopupContent, key?: string, removeAfterMs?: number | null) => {
      dispatch(addPopup({ content, key, removeAfterMs }));
    },
    [dispatch],
  );
}

// returns a function that allows removing a popup via its key
export function useRemovePopup(): (key: string) => void {
  const dispatch = useDispatch();
  return useCallback(
    (key: string) => {
      dispatch(removePopup({ key }));
    },
    [dispatch],
  );
}

// get the list of active popups
export function useActivePopups(): AppState['application']['popupList'] {
  const list = useSelector((state: AppState) => state.application.popupList);
  return useMemo(() => list.filter((item) => item.show), [list]);
}

export function useTokenDetails(): {
  tokenDetails: TokenDetail[];
  updateTokenDetails: (data: TokenDetail) => void;
} {
  const tokenDetails = useSelector(
    (state: AppState) => state.application.tokenDetails,
  );
  const dispatch = useDispatch();
  const _updateTokenDetails = useCallback(
    (data: TokenDetail) => {
      dispatch(updateTokenDetails(data));
    },
    [dispatch],
  );
  return { tokenDetails, updateTokenDetails: _updateTokenDetails };
}

export function useBookmarkTokens(): {
  bookmarkTokens: string[];
  addBookmarkToken: (data: string) => void;
  removeBookmarkToken: (data: string) => void;
  updateBookmarkTokens: (data: string[]) => void;
} {
  const bookmarkedTokens = useSelector(
    (state: AppState) => state.application.bookmarkedTokens,
  );
  const dispatch = useDispatch();
  const _addBookmarkToken = useCallback(
    (token: string) => {
      dispatch(addBookMarkToken(token));
    },
    [dispatch],
  );
  const _removeBookmarkToken = useCallback(
    (token: string) => {
      dispatch(removeBookmarkToken(token));
    },
    [dispatch],
  );
  const _updateBookmarkTokens = useCallback(
    (tokens: string[]) => {
      dispatch(updateBookmarkTokens(tokens));
    },
    [dispatch],
  );
  return {
    bookmarkTokens: bookmarkedTokens,
    addBookmarkToken: _addBookmarkToken,
    removeBookmarkToken: _removeBookmarkToken,
    updateBookmarkTokens: _updateBookmarkTokens,
  };
}

export function useBookmarkPairs(): {
  bookmarkPairs: string[];
  addBookmarkPair: (data: string) => void;
  removeBookmarkPair: (data: string) => void;
  updateBookmarkPairs: (data: string[]) => void;
} {
  const bookmarkedPairs = useSelector(
    (state: AppState) => state.application.bookmarkedPairs,
  );
  const dispatch = useDispatch();
  const _addBookmarkPair = useCallback(
    (pair: string) => {
      dispatch(addBookMarkPair(pair));
    },
    [dispatch],
  );
  const _removeBookmarkPair = useCallback(
    (pair: string) => {
      dispatch(removeBookmarkPair(pair));
    },
    [dispatch],
  );
  const _updateBookmarkPairs = useCallback(
    (pairs: string[]) => {
      dispatch(updateBookmarkTokens(pairs));
    },
    [dispatch],
  );
  return {
    bookmarkPairs: bookmarkedPairs,
    addBookmarkPair: _addBookmarkPair,
    removeBookmarkPair: _removeBookmarkPair,
    updateBookmarkPairs: _updateBookmarkPairs,
  };
}

export function useIsV2(): {
  isV2: boolean | undefined;
  updateIsV2: (isV2: boolean) => void;
} {
  const isV2 = useSelector((state: AppState) => state.application.isV2);
  const dispatch = useDispatch();
  const _updateIsV2 = useCallback(
    (isV2: boolean) => {
      dispatch(updateIsV2(isV2));
    },
    [dispatch],
  );
  return { isV2, updateIsV2: _updateIsV2 };
}

export function useIsLpLock(): {
  isLpLock: boolean | undefined;
  updateIsLpLock: (isLpLock: boolean) => void;
} {
  const isLpLock = useSelector((state: AppState) => state.application.isLpLock);
  const dispatch = useDispatch();
  const _updateIsLpLock = useCallback(
    (isLpLock: boolean) => {
      dispatch(updateIsLpLock(isLpLock));
    },
    [dispatch],
  );
  return { isLpLock, updateIsLpLock: _updateIsLpLock };
}

export function useSoulZap() {
  const soulZap = useSelector((state: AppState) => state.application.soulZap);
  return soulZap;
}

export function useOpenNetworkSelection(): {
  openNetworkSelection: boolean;
  setOpenNetworkSelection: (isOpen: boolean) => void;
} {
  const openNetworkSelection = useSelector(
    (state: AppState) => state.application.openNetworkSelection,
  );
  const dispatch = useDispatch();
  const _setOpenNetworkSelection = useCallback(
    (isOpen: boolean) => {
      dispatch(updateOpenNetworkSelection(isOpen));
    },
    [dispatch],
  );
  return {
    openNetworkSelection,
    setOpenNetworkSelection: _setOpenNetworkSelection,
  };
}
