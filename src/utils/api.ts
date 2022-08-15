export async function fetchEternalFarmAPR() {
  const apiURL =
    process.env.REACT_APP_V3_FARMS_API_BASE_URL + '/api/APR/eternalFarmings/';

  try {
    return await fetch(apiURL).then((v) => v.json());
  } catch (error) {
    return {};
  }
}

export async function fetchLimitFarmAPR() {
  const apiURL =
    process.env.REACT_APP_V3_FARMS_API_BASE_URL + '/api/APR/limitFarmings/';

  try {
    return await fetch(apiURL).then((v) => v.json());
  } catch (error) {
    return {};
  }
}

export async function fetchLimitFarmTVL() {
  const apiURL =
    process.env.REACT_APP_V3_FARMS_API_BASE_URL + '/api/TVL/limitFarmings/';

  try {
    return await fetch(apiURL).then((v) => v.json());
  } catch (error) {
    return {};
  }
}
