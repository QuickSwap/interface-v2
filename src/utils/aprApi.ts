export async function fetchPoolsAPR() {
  return fetchAPI(process.env.REACT_APP_POOL_APR_URL);
}

export async function fetchEternalFarmAPR() {
  return fetchAPI(process.env.REACT_APP_V3_APR_API_BASE_URL);
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
