import { ConnectorUpdate } from '@web3-react/types';
import { AbstractConnector } from '@web3-react/abstract-connector';
//@ts-ignore
import okxWeb3 from '@okwallet/extension-web3-1.7.0';

interface OKXConnectorArguments {
  chainId: number;
}

export class OKXWalletConnector extends AbstractConnector {
  private readonly chainId: number;

  public arkane: any;

  constructor({ chainId }: OKXConnectorArguments) {
    super({ supportedChainIds: [chainId] });

    this.chainId = chainId;
  }

  public async activate(): Promise<ConnectorUpdate> {
    let okWallet;
    const success = (wallet: any) => {
      // return wallet account information
      console.log(wallet);
    };
    const changed = (wallet: any) => {
      // return wallet account information
      // if there is no wallet is connecting, it will be null
      okWallet = wallet;
    };
    const error = (error: any) => {
      // Error returned when rejected
      console.error(error);
    };
    const uninstall = () => {
      console.log('uninstall');
    };

    const { okxwallet } = window as any;
    await okxWeb3.init({
      success,
      changed,
      error,
      uninstall,
    });

    const accounts = await okxwallet.request({ method: 'eth_requestAccounts' });

    return {
      provider: okxwallet,
      chainId: this.chainId,
      account: accounts[0],
    };
  }

  public async getProvider(): Promise<any> {
    const { okxwallet } = window as any;
    return okxwallet;
  }

  public async getChainId(): Promise<number | string> {
    return this.chainId;
  }

  public async getAccount(): Promise<null | string> {
    const { okxwallet } = window as any;
    return okxwallet
      .request({ method: 'eth_requestAccounts' })
      .then((accounts: any): string => accounts[0]);
  }

  public deactivate(): void {
    okxWeb3.disconnect();
    console.log('deactivate');
  }

  public close(): void {
    okxWeb3.disconnect();
    console.log('disconnected');
  }
}
