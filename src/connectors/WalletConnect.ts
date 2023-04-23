import {
  WalletConnect,
  WalletConnectConstructorArgs,
} from '@web3-react/walletconnect';
import { IQRCodeModalOptions } from '@walletconnect/types';
import { rpcMap } from './index';

export class WalletConnectPopup extends WalletConnect {
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
      options: { qrcode, rpc: rpcMap, qrcodeModalOptions },
      onError,
    });
  }

  activate(chainId?: number) {
    return super.activate(chainId);
  }
}
