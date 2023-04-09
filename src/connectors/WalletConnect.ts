import {
  WalletConnect,
  WalletConnectConstructorArgs,
} from '@web3-react/walletconnect';
import { IQRCodeModalOptions } from '@walletconnect/types';
import { rpcMap } from './index';

// Avoid testing for the best URL by only passing a single URL per chain.
// Otherwise, WC will not initialize until all URLs have been tested (see getBestUrl in web3-react).
const RPC_URLS_WITHOUT_FALLBACKS = Object.entries(rpcMap).reduce(
  (map, [chainId, url]) => ({
    ...map,
    [chainId]: url,
  }),
  {},
);

export class WalletConnectPopup extends WalletConnect {
  ANALYTICS_EVENT = 'Wallet Connect QR Scan';
  constructor({
    actions,
    onError,
    qrcode = true,
    qrcodeModalOptions,
  }: Omit<WalletConnectConstructorArgs, 'options'> & {
    qrcode?: boolean;
    qrcodeModalOptions?: IQRCodeModalOptions;
  }) {
    super({
      actions,
      options: { qrcode, rpc: RPC_URLS_WITHOUT_FALLBACKS, qrcodeModalOptions },
      onError,
    });
  }

  activate(chainId?: number) {
    return super.activate(chainId);
  }
}
