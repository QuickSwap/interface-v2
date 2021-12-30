import { ethers } from 'ethers';
import { ApproveStrategy } from '../types';

export const permitDomainType = [
  { name: 'name', type: 'string' },
  //{ name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' },
];

export const eip2612PermitType = [
  { name: 'owner', type: 'address' },
  { name: 'spender', type: 'address' },
  { name: 'value', type: 'uint256' },
  { name: 'nonce', type: 'uint256' },
  { name: 'deadline', type: 'uint256' },
];

export class EIP2771ApproveStrategy extends ApproveStrategy {
  async execute(spender: string, chainId: number) {
    const nonceMethod = this.contract.nonces;
    const nonce = parseInt(await nonceMethod(this.account));
    const deadline = Math.floor(Date.now() / 1000 + 3600);
    const name = await this.contract.name();

    const { data } = await this.contract.approve(
      spender,
      ethers.constants.MaxUint256.toString(),
    );

    const txParams = {
      data: data,
      to: this.contract.address,
      from: this.account,
      // gasLimit: gasLimit, // optional
      signatureType: 'EIP712_SIGN',
    };

    const response = await this.contract.send('eth_sendTransaction', [
      txParams,
    ]);

    return response;
  }
}
