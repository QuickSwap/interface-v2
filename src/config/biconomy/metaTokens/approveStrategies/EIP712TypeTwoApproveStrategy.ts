import { ethers } from 'ethers';
import { ApproveStrategy } from '../types';

export const domainType2 = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' },
];

interface IEIP712TypeTwoApproveStrategyFactoryConfig {
  version?: string;
}

export function EIP712TypeTwoApproveStrategyFactory(
  config?: IEIP712TypeTwoApproveStrategyFactoryConfig,
) {
  return class EIP712TypeTwoApproveStrategy extends ApproveStrategy {
    async execute(spender: string, chainId: number) {
      const nonceMethod = this.contract.getNonce || this.contract.nonces;
      const nonce = parseInt(await nonceMethod(this.account));

      const functionSignature = this.contractInterface.encodeFunctionData(
        'approve',
        [spender, ethers.constants.MaxUint256.toString()],
      );

      const name = await this.contract.name();

      const message = {
        name,
        nonce,
        functionSignature,
        from: this.account,
      };

      const dataToSign = JSON.stringify({
        types: {
          EIP712Domain: domainType2,
          MetaTransaction: [
            { name: 'nonce', type: 'uint256' },
            { name: 'from', type: 'address' },
            { name: 'functionSignature', type: 'bytes' },
          ],
        },
        domain: {
          name,
          version: config?.version || '1',
          chainId: chainId.toString(), //or Number
          verifyingContract: this.token.address,
        },
        primaryType: 'MetaTransaction',
        message,
      });

      const signedData = await this.library.send('eth_signTypedData_v3', [
        this.account,
        dataToSign,
      ]);

      const { v, r, s } = ethers.utils.splitSignature(signedData);

      const response = await this.contract.executeMetaTransaction(
        this.account,
        functionSignature,
        r,
        s,
        v,
      );

      return response;
    }
  };
}
