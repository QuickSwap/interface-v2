import { MaxUint256 } from '@ethersproject/constants';
import { TransactionResponse } from '@ethersproject/providers';
import { Trade, TokenAmount, CurrencyAmount, ETHER } from '@uniswap/sdk';
import { useCallback, useMemo } from 'react';
import {
  ROUTER_ADDRESS,
  EIP712_SUPPORTED_TOKENS_DOMAIN_TYPE1,
  EIP712_SUPPORTED_TOKENS_DOMAIN_TYPE2,
  PERMIT_ONLY_SUPPORTED_TOKENS,
  EIP2771_SUPPORTED_TOKENS,
  domainType1,
  domainType2,
  domainType3,
  eip2612PermitType,
} from 'constants/index';
import { useTokenAllowance } from 'data/Allowances';
import { Field } from 'state/swap/actions';
import {
  useTransactionAdder,
  useHasPendingApproval,
} from 'state/transactions/hooks';
import { computeSlippageAdjustedAmounts } from 'utils/prices';
import { calculateGasMargin } from 'utils';
import { useActiveWeb3React } from 'hooks';
import { splitSignature } from '@ethersproject/bytes';
import { useTokenContract } from './useContract';
import getBiconomy from './getBiconomy';
import { useIsGaslessEnabled } from 'state/application/hooks';

export enum ApprovalState {
  UNKNOWN,
  NOT_APPROVED,
  PENDING,
  APPROVED,
}

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function useApproveCallback(
  amountToApprove?: CurrencyAmount,
  spender?: string,
): [ApprovalState, () => Promise<void>] {
  const { account, chainId, library } = useActiveWeb3React();
  if (!chainId) throw new Error('Error');
  if (!library) throw new Error('Error');
  const token =
    amountToApprove instanceof TokenAmount ? amountToApprove.token : undefined;
  const currentAllowance = useTokenAllowance(
    token,
    account ?? undefined,
    spender,
  );
  const pendingApproval = useHasPendingApproval(token?.address, spender);
  const gaslessMode = useIsGaslessEnabled();

  const getWeb3 = getBiconomy(gaslessMode);

  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN;
    if (amountToApprove.currency === ETHER) return ApprovalState.APPROVED;
    // we might not have enough data to know whether or not we need to approve
    if (!currentAllowance) return ApprovalState.UNKNOWN;

    // amountToApprove will be defined if currentAllowance is
    return currentAllowance.lessThan(amountToApprove)
      ? pendingApproval
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED;
  }, [amountToApprove, currentAllowance, pendingApproval, spender]);

  const tokenContract = useTokenContract(token?.address);
  const addTransaction = useTransactionAdder();

  const approve = useCallback(async (): Promise<void> => {
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      console.error('approve was called unnecessarily');
      return;
    }
    if (!token) {
      console.error('no token');
      return;
    }

    if (!tokenContract) {
      console.error('tokenContract is null');
      return;
    }

    if (!amountToApprove) {
      console.error('missing amount to approve');
      return;
    }

    if (!spender) {
      console.error('no spender');
      return;
    }

    if (
      EIP712_SUPPORTED_TOKENS_DOMAIN_TYPE1[token.address.toLowerCase()] &&
      gaslessMode
    ) {
      const metaToken =
        EIP712_SUPPORTED_TOKENS_DOMAIN_TYPE1[token.address.toLowerCase()];
      const bicomony_contract = new getWeb3.eth.Contract(
        metaToken.abi,
        token.address,
      );
      const nonceMethod =
        bicomony_contract.methods.getNonce || bicomony_contract.methods.nonces;
      const biconomy_nonce = await nonceMethod(account).call();
      const res = bicomony_contract.methods
        .approve(spender, MaxUint256.toString())
        .encodeABI();
      const message: any = {};
      const name = await bicomony_contract.methods.name().call();
      message.nonce = parseInt(biconomy_nonce);
      message.from = account;
      message.functionSignature = res;

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
          verifyingContract: token.address,
          salt: '0x' + chainId.toString(16).padStart(64, '0'),
        },
        primaryType: 'MetaTransaction',
        message,
      });
      return library
        .send('eth_signTypedData_v4', [account, dataToSign])
        .then(splitSignature)
        .then(({ v, r, s }) => {
          bicomony_contract.methods
            .executeMetaTransaction(account, res, r, s, v)
            .send({
              from: account,
            })
            .then((response: any) => {
              if (!response.hash) response.hash = response.transactionHash;
              addTransaction(response, {
                summary: 'Approve ' + amountToApprove.currency.symbol,
                approval: { tokenAddress: token.address, spender: spender },
              });
            })
            .catch((error: Error) => {
              console.debug('Failed to approve token', error);
              throw error;
            });
        });
    } else if (
      EIP712_SUPPORTED_TOKENS_DOMAIN_TYPE2[token.address.toLowerCase()] &&
      gaslessMode
    ) {
      const metaToken =
        EIP712_SUPPORTED_TOKENS_DOMAIN_TYPE2[token.address.toLowerCase()];
      const bicomony_contract = new getWeb3.eth.Contract(
        metaToken.abi,
        token.address,
      );
      const nonceMethod =
        bicomony_contract.methods.getNonce || bicomony_contract.methods.nonces;
      const biconomy_nonce = await nonceMethod(account).call();
      const res = bicomony_contract.methods
        .approve(spender, MaxUint256.toString())
        .encodeABI();
      const message: any = {};
      const name = await bicomony_contract.methods.name().call();
      //TODO: Version could come from token config if available. default is 1
      message.nonce = parseInt(biconomy_nonce);
      message.from = account;
      message.functionSignature = res;

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
          name: name,
          version: '1',
          chainId: chainId.toString(), //or Number
          verifyingContract: token.address,
        },
        primaryType: 'MetaTransaction',
        message,
      });
      return library
        .send('eth_signTypedData_v4', [account, dataToSign])
        .then(splitSignature)
        .then(({ v, r, s }) => {
          bicomony_contract.methods
            .executeMetaTransaction(account, res, r, s, v)
            .send({
              from: account,
            })
            .then((response: any) => {
              if (!response.hash) response.hash = response.transactionHash;
              addTransaction(response, {
                summary: 'Approve ' + amountToApprove.currency.symbol,
                approval: { tokenAddress: token.address, spender: spender },
              });
            })
            .catch((error: Error) => {
              console.debug('Failed to approve token', error);
              throw error;
            });
        });
    } else if (
      PERMIT_ONLY_SUPPORTED_TOKENS[token.address.toLowerCase()] &&
      gaslessMode
    ) {
      //Standard EIP2612 permits
      //EIP712 domain type (TYPEHASH) could be different. Permit struct and name could be different. Get from token config!
      const metaToken =
        PERMIT_ONLY_SUPPORTED_TOKENS[token.address.toLowerCase()];
      const bicomony_contract = new getWeb3.eth.Contract(
        metaToken.abi,
        token.address,
      );
      const nonceMethod = bicomony_contract.methods.nonces;
      const biconomy_nonce = await nonceMethod(account).call();
      const name = await bicomony_contract.methods.name().call();
      const deadline = Math.floor(Date.now() / 1000 + 3600);

      const message: any = {};

      message.nonce = parseInt(biconomy_nonce);
      message.owner = account;
      message.spender = spender;
      message.value = MaxUint256.toString();
      message.deadline = deadline.toString();

      //for QUICK
      //remove the version from domainType and domain(data)

      const permitDataToSign = JSON.stringify({
        types: {
          EIP712Domain: domainType3,
          Permit: eip2612PermitType,
        },
        domain: {
          name,
          //version: '1',
          chainId: chainId.toString(), //or Number
          verifyingContract: token.address,
        },
        primaryType: 'Permit',
        message,
      });

      return library
        .send('eth_signTypedData_v4', [account, permitDataToSign])
        .then(splitSignature)
        .then(({ v, r, s }) => {
          bicomony_contract.methods
            .permit(account, spender, message.value, deadline, v, r, s)
            .send({
              from: account,
            })
            .then((response: any) => {
              if (!response.hash) response.hash = response.transactionHash;
              addTransaction(response, {
                summary: 'Approve ' + amountToApprove.currency.symbol,
                approval: { tokenAddress: token.address, spender: spender },
              });
            })
            .catch((error: Error) => {
              console.debug('Failed to approve token', error);
              throw error;
            });
        });
    } else if (
      EIP2771_SUPPORTED_TOKENS[token.address.toLowerCase()] &&
      gaslessMode
    ) {
      const metaToken = EIP2771_SUPPORTED_TOKENS[token.address.toLowerCase()];
      const bicomony_contract = new getWeb3.eth.Contract(
        metaToken.abi,
        token.address,
      );
      return bicomony_contract.methods
        .approve(spender, MaxUint256.toString())
        .send({
          from: account,
          signatureType: 'EIP712_SIGN',
        })
        .then((response: any) => {
          if (!response.hash) response.hash = response.transactionHash;
          addTransaction(response, {
            summary: 'Approve ' + amountToApprove.currency.symbol,
            approval: { tokenAddress: token.address, spender: spender },
          });
        })
        .catch((error: Error) => {
          console.debug('Failed to approve token', error);
          throw error;
        });
    } else {
      let useExact = false;
      const estimatedGas = await tokenContract.estimateGas
        .approve(spender, MaxUint256)
        .catch(() => {
          // general fallback for tokens who restrict approval amounts
          useExact = true;
          return tokenContract.estimateGas.approve(
            spender,
            amountToApprove.raw.toString(),
          );
        });

      return tokenContract
        .approve(
          spender,
          useExact ? amountToApprove.raw.toString() : MaxUint256,
          {
            gasLimit: calculateGasMargin(estimatedGas),
          },
        )
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: 'Approve ' + amountToApprove.currency.symbol,
            approval: { tokenAddress: token.address, spender: spender },
          });
        })
        .catch((error: Error) => {
          console.debug('Failed to approve token', error);
          throw error;
        });
    }
  }, [
    approvalState,
    token,
    tokenContract,
    amountToApprove,
    spender,
    addTransaction,
    chainId,
    gaslessMode,
    library,
    account,
  ]);

  return [approvalState, approve];
}

// wraps useApproveCallback in the context of a swap
export function useApproveCallbackFromTrade(
  trade?: Trade,
  allowedSlippage = 0,
): [ApprovalState, () => Promise<void>] {
  const amountToApprove = useMemo(
    () =>
      trade
        ? computeSlippageAdjustedAmounts(trade, allowedSlippage)[Field.INPUT]
        : undefined,
    [trade, allowedSlippage],
  );

  return useApproveCallback(amountToApprove, ROUTER_ADDRESS);
}
