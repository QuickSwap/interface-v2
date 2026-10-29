import { Web3ModalOptions } from '@web3modal/ethers5/react';
import oathLogo from 'assets/images/oath-wallet.svg';

// A native iOS wallet: Web3Modal uses its existing WalletConnect provider for
// desktop QR pairing and app handoff. Oath does not inject a browser provider.
export const oathWallet: NonNullable<
  Web3ModalOptions['customWallets']
>[number] = {
  id: 'oath-wallet',
  name: 'Oath Wallet',
  homepage: 'https://oathwallet.org',
  image_url: oathLogo,
  mobile_link: 'oathwallet://',
  app_store: 'https://apps.apple.com/app/id6780187283',
};
