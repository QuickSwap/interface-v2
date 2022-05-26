import { ethers } from 'ethers';
import { ApproveStrategy } from '../types';

const domainType1 = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'verifyingContract', type: 'address' },
  { name: 'salt', type: 'bytes32' },
];

export class EIP712TypeOneApproveStrategy extends ApproveStrategy {
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
        EIP712Domain: domainType1,
        MetaTransaction: [
          { name: 'nonce', type: 'uint256' },
          { name: 'from', type: 'address' },
          { name: 'functionSignature', type: 'bytes' },
        ],
      },
      domain: {
        name,
        version: '1',
        verifyingContract: this.token.address,
        salt: '0x' + chainId.toString(16).padStart(64, '0'),
      },
      primaryType: 'MetaTransaction',
      message,
    });

    const signedData = await this.library.send('eth_signTypedData_v3', [
      this.account,
      dataToSign,
    ]);

    const { v, r, s } = ethers.utils.splitSignature(signedData);

    // const contractWithSigner = this.contract.connect(this.library.getSigner());
    const response = await this.contract.executeMetaTransaction(
      this.account,
      functionSignature,
      r,
      s,
      v,
    );

    return response;
  }
}
