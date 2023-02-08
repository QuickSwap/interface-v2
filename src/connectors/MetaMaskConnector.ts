import { AbstractConnectorArguments, ConnectorUpdate } from '@web3-react/types';
import { AbstractConnector } from '@web3-react/abstract-connector';
import warning from 'tiny-warning';

type SendReturnResult = { result: any };
type SendReturn = any;

type Send = (
  method: string,
  params?: any[],
) => Promise<SendReturnResult | SendReturn>;
type SendOld = ({
  method,
}: {
  method: string;
}) => Promise<SendReturnResult | SendReturn>;

declare const __DEV__: boolean;

type WindowEthereumMetamask = Window['ethereum'] & {
  isMetaMask?: boolean;
  isBraveWallet?: boolean;
  isAvalanche?: boolean;
  isKuCoinWallet?: boolean;
  isPortal?: boolean;
  isTokenPocket?: boolean;
  isTokenary?: boolean;
  isBitKeep?: boolean;
  providers?: Array<WindowEthereumMetamask>;
  _events?: any;
  _state?: any;
};

function parseSendReturn(sendReturn: SendReturnResult | SendReturn): any {
  return sendReturn.hasOwnProperty('result') ? sendReturn.result : sendReturn;
}

export function getMetaMaskInjectedProvider(): Window['ethereum'] {
  const getMetaMask = (ethereum: WindowEthereumMetamask) => {
    const isMetaMask = !!ethereum?.isMetaMask;
    if (!isMetaMask) return;
    // Brave tries to make itself look like MetaMask
    // Could also try RPC `web3_clientVersion` if following is unreliable
    if (ethereum.isBraveWallet && !ethereum._events && !ethereum._state) return;
    if (ethereum.isAvalanche) return;
    if (ethereum.isKuCoinWallet) return;
    if (ethereum.isPortal) return;
    if (ethereum.isTokenPocket) return;
    if (ethereum.isTokenary) return;
    if (ethereum.isBitKeep) return;
    return window.ethereum;
  };

  const injectedProviderExist =
    typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';

  // No injected providers exist.
  if (!injectedProviderExist) {
    return;
  }

  const ethereum = window.ethereum as WindowEthereumMetamask;

  const ethereumMetamask = getMetaMask(ethereum);

  if (ethereumMetamask) {
    return ethereumMetamask;
  }

  return ethereum.providers?.find(getMetaMask);
}

export class NoEthereumProviderError extends Error {
  public constructor() {
    super();
    this.name = this.constructor.name;
    this.message = 'No Ethereum provider was found on this.provider.';
  }
}

export class UserRejectedRequestError extends Error {
  public constructor() {
    super();
    this.name = this.constructor.name;
    this.message = 'The user rejected the request.';
  }
}

export class MetaMaskConnector extends AbstractConnector {
  provider: Window['ethereum'];

  constructor(kwargs: AbstractConnectorArguments) {
    super(kwargs);

    this.handleNetworkChanged = this.handleNetworkChanged.bind(this);
    this.handleChainChanged = this.handleChainChanged.bind(this);
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  private handleChainChanged(chainId: string | number): void {
    if (__DEV__) {
      console.log("Handling 'chainChanged' event with payload", chainId);
    }
    this.emitUpdate({ chainId, provider: this.provider });
  }

  private handleAccountsChanged(accounts: string[]): void {
    if (__DEV__) {
      console.log("Handling 'accountsChanged' event with payload", accounts);
    }
    if (accounts.length === 0) {
      this.emitDeactivate();
    } else {
      this.emitUpdate({ account: accounts[0] });
    }
  }

  private handleClose(code: number, reason: string): void {
    if (__DEV__) {
      console.log("Handling 'close' event with payload", code, reason);
    }
    this.emitDeactivate();
  }

  private handleNetworkChanged(networkId: string | number): void {
    if (__DEV__) {
      console.log("Handling 'networkChanged' event with payload", networkId);
    }
    this.emitUpdate({ chainId: networkId, provider: this.provider });
  }

  public async activate(): Promise<ConnectorUpdate> {
    this.provider = getMetaMaskInjectedProvider();

    if (!this.provider) {
      throw new NoEthereumProviderError();
    }

    if (this.provider.on) {
      this.provider.on('chainChanged', this.handleChainChanged);
      this.provider.on('accountsChanged', this.handleAccountsChanged);
      this.provider.on('close', this.handleClose);
      this.provider.on('networkChanged', this.handleNetworkChanged);
    }

    if ((this.provider as any).isMetaMask) {
      (this.provider as any).autoRefreshOnNetworkChange = false;
    }

    // try to activate + get account via eth_requestAccounts
    let account;
    try {
      account = await (this.provider.send as Send)('eth_requestAccounts').then(
        (sendReturn) => parseSendReturn(sendReturn)[0],
      );
    } catch (error) {
      if ((error as any).code === 4001) {
        throw new UserRejectedRequestError();
      }
      warning(
        false,
        'eth_requestAccounts was unsuccessful, falling back to enable',
      );
    }

    // if unsuccessful, try enable
    if (!account) {
      // if enable is successful but doesn't return accounts, fall back to getAccount (not happy i have to do this...)
      account = await this.provider
        .enable()
        .then((sendReturn) => sendReturn && parseSendReturn(sendReturn)[0]);
    }

    return { provider: this.provider, ...(account ? { account } : {}) };
  }

  public async getProvider(): Promise<any> {
    return this.provider;
  }

  public async getChainId(): Promise<number | string> {
    if (!this.provider) {
      throw new NoEthereumProviderError();
    }

    let chainId;
    try {
      chainId = await (this.provider.send as Send)('eth_chainId').then(
        parseSendReturn,
      );
    } catch {
      warning(
        false,
        'eth_chainId was unsuccessful, falling back to net_version',
      );
    }

    if (!chainId) {
      try {
        chainId = await (this.provider.send as Send)('net_version').then(
          parseSendReturn,
        );
      } catch {
        warning(
          false,
          'net_version was unsuccessful, falling back to net version v2',
        );
      }
    }

    if (!chainId) {
      try {
        chainId = parseSendReturn(
          ((this.provider.send as unknown) as SendOld)({
            method: 'net_version',
          }),
        );
      } catch {
        warning(
          false,
          'net_version v2 was unsuccessful, falling back to manual matches and static properties',
        );
      }
    }

    if (!chainId) {
      if ((this.provider as any).isDapper) {
        chainId = parseSendReturn(
          (this.provider as any).cachedResults.net_version,
        );
      } else {
        chainId =
          (this.provider as any).chainId ||
          (this.provider as any).netVersion ||
          (this.provider as any).networkVersion ||
          (this.provider as any)._chainId;
      }
    }

    return chainId;
  }

  public async getAccount(): Promise<null | string> {
    if (!this.provider) {
      throw new NoEthereumProviderError();
    }

    let account;
    try {
      account = await (this.provider.send as Send)('eth_accounts').then(
        (sendReturn) => parseSendReturn(sendReturn)[0],
      );
    } catch {
      warning(false, 'eth_accounts was unsuccessful, falling back to enable');
    }

    if (!account) {
      try {
        account = await this.provider
          .enable()
          .then((sendReturn) => parseSendReturn(sendReturn)[0]);
      } catch {
        warning(
          false,
          'enable was unsuccessful, falling back to eth_accounts v2',
        );
      }
    }

    if (!account) {
      account = parseSendReturn(
        ((this.provider.send as unknown) as SendOld)({
          method: 'eth_accounts',
        }),
      )[0];
    }

    return account;
  }

  public deactivate() {
    if (this.provider && this.provider.removeListener) {
      this.provider.removeListener('chainChanged', this.handleChainChanged);
      this.provider.removeListener(
        'accountsChanged',
        this.handleAccountsChanged,
      );
      this.provider.removeListener('close', this.handleClose);
      this.provider.removeListener('networkChanged', this.handleNetworkChanged);
    }
  }

  public async isAuthorized(): Promise<boolean> {
    if (!this.provider) {
      return false;
    }

    try {
      return await (this.provider.send as Send)('eth_accounts').then(
        (sendReturn) => {
          if (parseSendReturn(sendReturn).length > 0) {
            return true;
          } else {
            return false;
          }
        },
      );
    } catch {
      return false;
    }
  }
}
