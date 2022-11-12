import { AbstractConnector } from '@web3-react/abstract-connector';
import { ConnectorUpdate } from '@web3-react/types';

const CHAIN_ID = 137;

interface TrustWalletConnectorArguments {
  supportedChainIds?: number[];
}

export class TrustWalletConnector extends AbstractConnector {
  private provider: any;

  constructor({ supportedChainIds }: TrustWalletConnectorArguments) {
    super({ supportedChainIds });
  }

  public async activate(): Promise<ConnectorUpdate> {
    const ethereum = window.ethereum as any;

    if (ethereum && ethereum.isTrustWallet === true) {
      this.provider = (window as any).ethereum;
    }

    const accounts = await this.provider.request({
      method: 'eth_requestAccounts',
    });

    const account = accounts[0];

    this.provider.on('chainChanged', this.handleChainChanged);
    this.provider.on('accountsChanged', this.handleAccountsChanged);

    return { provider: this.provider, account: account };
  }

  public async getProvider(): Promise<any> {
    return this.provider;
  }

  public async getChainId(): Promise<number> {
    return this.provider.chainId;
  }

  public async getAccount(): Promise<null | string> {
    const accounts = await this.provider.request({
      method: 'eth_requestAccounts',
    });
    return accounts[0];
  }

  public deactivate(): void {
    this.provider.removeListener('chainChanged', this.handleChainChanged);
    this.provider.removeListener('accountsChanged', this.handleAccountsChanged);
  }

  public async close(): Promise<void> {
    this.provider.close();
    this.emitDeactivate();
  }

  private handleChainChanged(chainId: number | string): void {
    this.emitUpdate({ chainId: chainId });
  }

  private handleAccountsChanged(accounts: string[]): void {
    this.emitUpdate({ account: accounts[0] });
  }
}
