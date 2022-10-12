export async function fetchEternalFarmAPR() {
  const apiURL =
    process.env.REACT_APP_V3_APR_API_BASE_URL + '/APR/eternalFarmings/';

  try {
    return await fetch(apiURL).then((v) => v.json());
  } catch (error) {
    return {};
  }
}

export async function fetchPoolsAPR() {
  const apiURL = process.env.REACT_APP_V3_APR_API_BASE_URL + '/APR/pools/';

  try {
    return await fetch(apiURL).then((v) => v.json());
  } catch (error) {
    return {};
  }
}

export async function fetchEternalFarmTVL() {
  const apiURL =
    process.env.REACT_APP_V3_APR_API_BASE_URL + '/TVL/eternalFarmings/';

  try {
    return await fetch(apiURL).then((v) => v.json());
  } catch (error) {
    return {};
  }
}

export async function fetchLimitFarmAPR() {
  const apiURL =
    process.env.REACT_APP_V3_APR_API_BASE_URL + '/APR/limitFarmings/';

  try {
    return await fetch(apiURL).then((v) => v.json());
  } catch (error) {
    return {};
  }
}

export async function fetchLimitFarmTVL() {
  const apiURL =
    process.env.REACT_APP_V3_APR_API_BASE_URL + '/TVL/limitFarmings/';

  try {
    return await fetch(apiURL).then((v) => v.json());
  } catch (error) {
    return {};
  }
}
