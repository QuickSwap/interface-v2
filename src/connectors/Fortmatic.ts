import { ChainId } from '@uniswap/sdk';
import { Connector, Actions } from '@web3-react/types';
import invariant from 'tiny-invariant';

export const OVERLAY_READY = 'OVERLAY_READY';

type FormaticSupportedChains = Extract<ChainId, ChainId.MATIC | ChainId.MUMBAI>;

interface FortmaticConnectorArguments {
  apiKey: string;
  chainId: number;
  actions: Actions;
  onError?: (error: Error) => void;
}

const CHAIN_ID_NETWORK_ARGUMENT: {
  readonly [chainId in FormaticSupportedChains]: string | undefined;
} = {
  [ChainId.MUMBAI]: undefined,
  [ChainId.MATIC]: 'mumbai',
};

export class FortmaticConnector extends Connector {
  private readonly apiKey: string;
  private readonly chainId: number;

  public fortmatic: any;

  constructor({
    apiKey,
    chainId,
    actions,
    onError,
  }: FortmaticConnectorArguments) {
    invariant(
      Object.keys(CHAIN_ID_NETWORK_ARGUMENT).includes(chainId.toString()),
      `Unsupported chainId ${chainId}`,
    );
    super(actions, onError);

    this.apiKey = apiKey;
    this.chainId = chainId;
  }

  async activate(chainId: number) {
    if (!this.fortmatic) {
      const { default: Fortmatic } = await import('fortmatic');

      if (this.chainId in CHAIN_ID_NETWORK_ARGUMENT) {
        this.fortmatic = new Fortmatic(this.apiKey);
      } else {
        throw new Error(`Unsupported network ID: ${this.chainId}`);
      }
    }

    const provider = this.fortmatic.getProvider();

    const pollForOverlayReady = new Promise((resolve) => {
      const interval = setInterval(() => {
        if (provider.overlay.overlayReady) {
          clearInterval(interval);
          resolve(OVERLAY_READY);
        }
      }, 200);
    });

    const accounts = await Promise.all([
      provider.enable().then((accounts: string[]) => accounts),
      pollForOverlayReady,
    ]);

    this.actions.update({ chainId, accounts });
  }

  public async getProvider(): Promise<any> {
    return this.fortmatic.getProvider();
  }

  public async getChainId(): Promise<number | string> {
    return this.chainId;
  }

  public async getAccount(): Promise<null | string> {
    return this.fortmatic
      .getProvider()
      .send('eth_accounts')
      .then((accounts: string[]): string => accounts[0]);
  }

  public deactivate(): void {
    console.log('deactivate');
  }

  public async close(): Promise<void> {
    if (super.deactivate) {
      super.deactivate();
    }
    await this.fortmatic.user.logout();
  }
}
