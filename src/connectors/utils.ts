export const getIsInjected = () => Boolean(window.ethereum);

type NonMetaMaskFlag =
  | 'isBraveWallet'
  | 'isTrustWallet'
  | 'isLedgerConnect'
  | 'isBlockWallet'
  | 'isCypherD'
  | 'isBitKeep'
  | 'isPhantom';
const allNonMetamaskFlags: NonMetaMaskFlag[] = [
  'isBraveWallet',
  'isTrustWallet',
  'isLedgerConnect',
  'isBlockWallet',
  'isCypherD',
  'isBitKeep',
  'isPhantom',
];
export const getIsMetaMaskWallet = () => {
  const { ethereum } = window as any;

  return Boolean(
    ethereum &&
      ethereum.isMetaMask &&
      (ethereum.detected && ethereum.detected.length > 0
        ? ethereum.detected.find(
            (provider: any) =>
              provider &&
              provider.isMetaMask &&
              !provider.detected &&
              !allNonMetamaskFlags.some((flag) => provider[flag]),
          )
        : ethereum.providers && ethereum.providers.length > 0
        ? ethereum.providers.find(
            (provider: any) =>
              provider &&
              provider.isMetaMask &&
              !provider.providers &&
              !allNonMetamaskFlags.some((flag) => provider[flag]),
          )
        : !allNonMetamaskFlags.some((flag) => ethereum[flag])),
  );
};

export const getIsCoinbaseWallet = () => {
  const windowAsAny = window as any;
  return Boolean(windowAsAny.ethereum?.isCoinbaseWallet);
};

export const getIsTrustWallet = () => {
  const windowAsAny = window as any;
  return Boolean(windowAsAny.trustWallet);
};

export const getIsBitKeepWallet = () => {
  const windowAsAny = window as any;
  return Boolean(windowAsAny.bitkeep && windowAsAny.bitkeep.ethereum);
};
