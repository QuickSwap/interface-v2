import { ChainId } from '@uniswap/sdk';
import { getConfig } from 'config/index';

const getAPIURL = (chainId: ChainId, url: string) => {
  const apiBaseURL = process.env.REACT_APP_V3_APR_API_BASE_URL;
  const config = getConfig(chainId);
  const aprAPINetwork = config['aprAPINetwork'];
  const networkKey = aprAPINetwork ? `?network=${aprAPINetwork}` : '';
  const apiURL = `${apiBaseURL}${url}${networkKey}`;
  return apiURL;
};

export async function fetchEternalFarmAPR(chainId: ChainId) {
  const apiURL = getAPIURL(chainId, '/APR/eternalFarmings/');

  try {
    return await fetch(apiURL).then((v) => v.json());
  } catch (error) {
    return {};
  }
}

export async function fetchPoolsAPR(chainId: ChainId) {
  const apiURL = getAPIURL(chainId, '/APR/pools/');

  try {
    return await fetch(apiURL).then((v) => v.json());
  } catch (error) {
    return {};
  }
}

export async function fetchEternalFarmTVL(chainId: ChainId) {
  const apiURL = getAPIURL(chainId, '/TVL/eternalFarmings/');

  try {
    return await fetch(apiURL).then((v) => v.json());
  } catch (error) {
    return {};
  }
}

export async function fetchLimitFarmAPR(chainId: ChainId) {
  const apiURL = getAPIURL(chainId, '/APR/limitFarmings/');

  try {
    return await fetch(apiURL).then((v) => v.json());
  } catch (error) {
    return {};
  }
}

export async function fetchLimitFarmTVL(chainId: ChainId) {
  const apiURL = getAPIURL(chainId, '/TVL/limitFarmings/');

  try {
    return await fetch(apiURL).then((v) => v.json());
  } catch (error) {
    return {};
  }
}
