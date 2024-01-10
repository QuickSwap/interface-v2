import axios from 'axios';
import { ChainId } from '@uniswap/sdk';
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESSES } from 'constants/v3/addresses';
const TEAM_FINANCE_BACKEND_URL = 'https://team-finance-backend-dev-origdfl2wq-uc.a.run.app/api';
const API_KEY = process.env.TEAM_FINANCE_BACKEND_API_KEY ?? 'yolobolo';
const chain_id = ChainId.MATIC;

axios.defaults.baseURL = TEAM_FINANCE_BACKEND_URL
axios.defaults.timeout = 120000
axios.defaults.headers.common.Accept = 'application/json'
axios.defaults.headers.common.Authorization = API_KEY

export const fetchUserV2LiquidityLocks = async (account: string, liquidityTokenList: any) => {
    const addressArray = liquidityTokenList.map((item: any) => item.liquidityToken.address)
    const URL = `/app/allMylocks/${account}`;
    const response = await axios.get(URL);
    return response.data.data.filter((item: any) => {
        return (item.event.chainId == '0x89' && addressArray.includes(item.event.liquidityContractAddress))
    });
}

export const fetchUserV3LiquidityLocks = async (account: string) => {
    const URL = `/app/allMylocks/${account}`;
    const response = await axios.get(URL);
    return response.data.data.filter((item: any) => {
        return (item.event.chainId == '0x89' && item.event.liquidityContractAddress == NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chain_id])
    });
}

export const updateUserLiquidityLock = async (lockContractAddress: string, lockDepositId: number) => {
    const URL = `/app/locks/${lockContractAddress}/${lockDepositId}`;
    return await axios.put(URL, {}, {
        headers: {},
        params: {
            network: 'polygon',
            chainId: '0x89'
        }
    })

}