import { AbstractConnector } from '@web3-react/abstract-connector';
import { ConnectorUpdate } from '@web3-react/types';

const CHAIN_ID = 137;

interface WalletConnectorArguments {
  supportedChainIds?: number[];
}

type WindowEthereumPhantom = Window['ethereum'] & {
  isPhantom?: boolean;
  providers?: Array<WindowEthereumPhantom>;
};

type WindowPhantom = Window & {
  trustWallet?: WindowEthereumPhantom;
};

export function getPhantomWalletInjectedProvider(): Window['ethereum'] {
  const isPhantomWallet = (ethereum?: WindowEthereumPhantom) => {
    // Identify if Phantom Wallet injected provider is present.
    const trustWallet = !!ethereum?.isPhantom;

    return trustWallet;
  };

  const injectedProviderExist =
    typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';

  // No injected providers exist.
  if (!injectedProviderExist) {
    return;
  }

  const ethereum = window.ethereum as WindowEthereumPhantom;

  // Phantom Wallet was injected into window.ethereum.
  if (isPhantomWallet(ethereum)) {
    return window.ethereum;
  }

  // Phantom Wallet provider might be replaced by another
  // injected provider, check the providers array.
  if (ethereum?.providers) {
    return ethereum.providers.find(isPhantomWallet);
  }

  // In some cases injected providers can replace window.ethereum
  // without updating the providers array. In those instances the Phantom Wallet
  // can be installed and its provider instance can be retrieved by
  // looking at the global `trustwallet` object.
  return (window as WindowPhantom).trustWallet;
}

export class PhantomWalletConnector extends AbstractConnector {
  private provider: any;

  constructor({ supportedChainIds }: WalletConnectorArguments) {
    super({ supportedChainIds });

    this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
    this.handleChainChanged = this.handleChainChanged.bind(this);
    this.handleDisconnect = this.handleDisconnect.bind(this);
  }

  public async activate(): Promise<ConnectorUpdate> {
    this.provider = getPhantomWalletInjectedProvider();

    const accounts = await this.provider.request({
      method: 'eth_requestAccounts',
    });

    const account = accounts[0];

    this.provider.addListener('chainChanged', this.handleChainChanged);
    this.provider.addListener('accountsChanged', this.handleAccountsChanged);
    this.provider.addListener('disconnect', this.handleDisconnect);

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
    this.provider.removeListener('disconnect', this.handleDisconnect);
  }

  public async close(): Promise<void> {
    this.emitDeactivate();
  }

  private handleChainChanged(chainId: number | string): void {
    this.emitUpdate({ chainId: chainId });
  }

  private handleDisconnect() {
    this.close();
  }

  private handleAccountsChanged(accounts: string[]): void {
    if (accounts.length === 0) {
      this.close();
    } else {
      this.emitUpdate({ account: accounts[0] });
    }
  }
}
