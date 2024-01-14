import { SUPPORTED_CHAINIDS } from 'constants/index';
import { WalletConnect, WalletConnectConstructorArgs } from './WalletConnect';
import { QrModalOptions } from '@walletconnect/ethereum-provider/dist/types/EthereumProvider';

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
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '',
        qrModalOptions,
      },
      onError,
    });
  }

  activate(chainId?: number) {
    return super.activate(chainId);
  }
}
