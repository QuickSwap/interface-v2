import {
  WalletConnect,
  WalletConnectConstructorArgs,
} from '@web3-react/walletconnect';
import { rpcMap } from 'constants/providers';

export class WalletConnectPopup extends WalletConnect {
  constructor({
    actions,
    onError,
    qrcode = true,
    qrcodeModalOptions,
  }: Omit<WalletConnectConstructorArgs, 'options'> & {
    qrcode?: boolean;
    qrcodeModalOptions?: any;
  }) {
    super({
      actions,
      options: { qrcode, rpc: rpcMap, qrcodeModalOptions },
      onError,
    });
  }

  activate(chainId?: number) {
    return super.activate(chainId);
  }
}
