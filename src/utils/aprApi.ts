export async function fetchPoolsAPR() {
  return fetchAPI(process.env.REACT_APP_POOL_APR);
}

export async function fetchEternalFarmAPR() {
  return fetchAPI(process.env.REACT_APP_POOL_FARMING_APR);
}

async function fetchAPI(url: string | undefined) {
  try {
    if (url) {
      return await fetch(url).then((v) => v.json());
    }
  } catch (error) {
    return {};
  }
}
