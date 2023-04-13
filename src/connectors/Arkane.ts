import invariant from 'tiny-invariant';
import { ChainId } from '@uniswap/sdk';
import { Arkane } from '@arkane-network/web3-arkane-provider';
import { ArkaneConnect, SecretType } from '@arkane-network/arkane-connect';
import Web3 from 'web3';
import { Actions, Connector, Provider } from '@web3-react/types';

type ArkaneSupportedChains = Extract<ChainId, ChainId.MATIC | ChainId.MUMBAI>;

const CHAIN_ID_NETWORK_ARGUMENT: {
  readonly [chainId in ArkaneSupportedChains]: string | undefined;
} = {
  [ChainId.MUMBAI]: 'mumbai',
  [ChainId.MATIC]: 'matic',
};

interface ArkaneConnectorArguments {
  clientID: string;
  chainId: number;
  actions: Actions;
  onError?: (error: Error) => void;
}

export class ArkaneConnector extends Connector {
  private readonly clientID: string;
  private readonly chainId: number;

  public arkane: any;

  constructor({
    clientID,
    chainId,
    actions,
    onError,
  }: ArkaneConnectorArguments) {
    invariant(
      Object.keys(CHAIN_ID_NETWORK_ARGUMENT).includes(chainId.toString()),
      `Unsupported chainId ${chainId}`,
    );
    super(actions, onError);

    this.clientID = clientID;
    this.chainId = chainId;
  }

  public async activate(chainId: number) {
    if (!this.arkane) {
      this.arkane = new ArkaneConnect(this.clientID);
    }

    const options = {
      clientId: this.clientID,
      secretType: SecretType.MATIC,
      signMethod: 'POPUP',
      skipAuthentication: false,
    };
    const arkaneProvider = await Arkane.createArkaneProviderEngine(options);
    this.customProvider = arkaneProvider;
    const web3 = new Web3(arkaneProvider as any);
    const accounts = await web3.eth.getAccounts();

    this.actions.update({ chainId, accounts });
  }

  public deactivate(): void {
    if (super.deactivate) {
      super.deactivate();
    }
    this.arkane.logout();
  }
}
