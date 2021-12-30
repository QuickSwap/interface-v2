import { Token } from '@uniswap/sdk';
import { ethers } from 'ethers';

export class MetaToken {
  token: Token;
  library: undefined | ethers.providers.Web3Provider;
  abi: any;
  contract: undefined | ethers.Contract;
  contractInterface: undefined | ethers.utils.Interface;
  approve: undefined | ((spender: string, chainId: number) => Promise<any>);
  approveStrategy;
  biconomy: any;
  account: undefined | string;

  constructor(
    token: Token,
    abi: any,
    approveStrategy: new (
      contract: ethers.Contract,
      contractInterface: ethers.utils.Interface,
      token: Token,
      library: ethers.providers.Web3Provider,
      account: string,
    ) => ApproveStrategy,
  ) {
    this.token = token;
    this.abi = abi;
    this.approveStrategy = approveStrategy;
  }

  init(library: ethers.providers.Web3Provider, biconomy: any, account: string) {
    this.library = library;
    this.biconomy = biconomy;
    this.account = account;

    this.contract = new ethers.Contract(
      this.token.address,
      this.abi,
      biconomy.getSignerByAddress(account),
    );
    this.contractInterface = new ethers.utils.Interface(this.abi);

    this.approve = new this.approveStrategy(
      this.contract,
      this.contractInterface,
      this.token,
      this.library,
      this.account,
    ).execute;
  }
}

export abstract class ApproveStrategy {
  contract;
  contractInterface;
  token;
  library;
  account;

  constructor(
    contract: ethers.Contract,
    contractInterface: ethers.utils.Interface,
    token: Token,
    library: ethers.providers.Web3Provider,
    account: string,
  ) {
    this.contract = contract;
    this.contractInterface = contractInterface;
    this.token = token;
    this.library = library;
    this.account = account;
  }

  abstract execute(spender: string, chainId: number): Promise<any>;
}
