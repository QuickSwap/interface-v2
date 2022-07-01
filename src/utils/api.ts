export async function fetchEternalFarmAPR() {
  const apiURL = 'https://api.algebra.finance/api/APR/eternalFarmings/';

  try {
    return await fetch(apiURL).then((v) => v.json());
  } catch (error) {
    return {};
  }
}

export async function fetchLimitFarmAPR() {
  const apiURL = 'https://api.algebra.finance/api/APR/limitFarmings/';

  try {
    return await fetch(apiURL).then((v) => v.json());
  } catch (error) {
    return {};
  }
}

export async function fetchLimitFarmTVL() {
  const apiURL = 'https://api.algebra.finance/api/TVL/limitFarmings/';

  try {
    return await fetch(apiURL).then((v) => v.json());
  } catch (error) {
    return {};
  }
}
