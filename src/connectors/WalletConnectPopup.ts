import { SUPPORTED_CHAINIDS } from 'constants/index';
import { WalletConnect, WalletConnectConstructorArgs } from './WalletConnect';
import { QrModalOptions } from '@walletconnect/ethereum-provider/dist/types/types';

export class WalletConnectPopup extends WalletConnect {
  constructor({
    actions,
    onError,
    qrcode = true,
    qrModalOptions,
  }: Omit<WalletConnectConstructorArgs, 'options'> & {
    qrcode?: boolean;
    qrModalOptions?: QrModalOptions;
  }) {
    super({
      actions,
      options: {
        showQrModal: qrcode,
        chains: SUPPORTED_CHAINIDS,
        projectId: process.env.REACT_APP_WALLETCONNECT_PROJECT_ID ?? '',
        qrModalOptions,
      },
      onError,
    });
  }

  activate(chainId?: number) {
    return super.activate(chainId);
  }
}
