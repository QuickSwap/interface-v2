export const getIsInjected = () => Boolean(window.ethereum);

// When using Brave browser, `isMetaMask` is set to true when using the built-in wallet
// This variable should be true only when using the MetaMask extension
// https://wallet-docs.brave.com/ethereum/wallet-detection#compatability-with-metamask
type NonMetaMaskFlag =
  | 'isRabby'
  | 'isBraveWallet'
  | 'isTrustWallet'
  | 'isLedgerConnect';
const allNonMetamaskFlags: NonMetaMaskFlag[] = [
  'isRabby',
  'isBraveWallet',
  'isTrustWallet',
  'isLedgerConnect',
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
