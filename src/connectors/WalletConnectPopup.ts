import { SUPPORTED_CHAINIDS } from 'constants/index';
import { WalletConnect, WalletConnectConstructorArgs } from './WalletConnect';
import { rpcMap } from 'constants/providers';
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
        rpcMap,
        chains: SUPPORTED_CHAINIDS,
        projectId: 'a6cc11517a10f6f12953fd67b1eb67e7',
        qrModalOptions,
      },
      onError,
    });
  }

  activate(chainId?: number) {
    return super.activate(chainId);
  }
}
