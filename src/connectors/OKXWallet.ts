import { ConnectorUpdate } from '@web3-react/types';
import { InjectedConnector } from '@web3-react/injected-connector';
//@ts-ignore
import okWeb3 from '@okwallet/extension-web3-1.7.0';

interface OKXConnectorArguments {
  chainId: number;
}

export class OKXWalletConnector extends InjectedConnector {
  private readonly chainId: number;

  constructor({ chainId }: OKXConnectorArguments) {
    super({ supportedChainIds: [chainId] });

    this.chainId = chainId;
  }

  public async activate(): Promise<ConnectorUpdate> {
    const { okxwallet } = window as any;

    const accounts = await okxwallet.request({ method: 'eth_requestAccounts' });
    const provider = await super.getProvider();

    await okWeb3.init();

    return {
      provider,
      chainId: this.chainId,
      account: accounts[0],
    };
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
    okWeb3.disconnect();
  }

  public close(): void {
    okWeb3.disconnect();
  }
}
