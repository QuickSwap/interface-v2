import { ChainId } from '@uniswap/sdk'
import MULTICALL_ABI from './abi.json'

const MULTICALL_NETWORKS: { [chainId in ChainId]: string } = {
 
  [ChainId.MUMBAI]: '0x01173890E45aA0f694B68eB89Cb63B295b439FC3',//TODO: CHANGE THIS
  [ChainId.MATIC]: "0x35e4aA226ce52e1E59E5e5Ec24766007bCbE2e7D"
}

export { MULTICALL_ABI, MULTICALL_NETWORKS }
