export const getIsInjected = () => Boolean(window.ethereum);

type NonMetaMaskFlag =
  | 'isRabby'
  | 'isBraveWallet'
  | 'isTrustWallet'
  | 'isLedgerConnect'
  | 'isBlockWallet'
  | 'isCypherD'
  | 'isBitKeep'
  | 'isPhantom';
const allNonMetamaskFlags: NonMetaMaskFlag[] = [
  'isRabby',
  'isBraveWallet',
  'isTrustWallet',
  'isLedgerConnect',
  'isBlockWallet',
  'isCypherD',
  'isBitKeep',
  'isPhantom',
];
export const getIsMetaMaskWallet = () => {
  const windowAsAny = window as any;
  return Boolean(
    windowAsAny.ethereum?.isMetaMask &&
      !allNonMetamaskFlags.some((flag) => windowAsAny.ethereum?.[flag]),
  );
};

export const getIsCoinbaseWallet = () => {
  const windowAsAny = window as any;
  return Boolean(windowAsAny.ethereum?.isCoinbaseWallet);
};
