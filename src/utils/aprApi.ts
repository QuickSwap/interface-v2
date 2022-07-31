export async function fetchPoolsAPR() {
  // const apiURL = 'https://api.algebra.finance/api/APR/pools/'

  // try {
  //     return await fetch(apiURL).then(v => v.json())

  // } catch (error: any) {
  //     return {}
  // }

  return {
    '0xd54664d1ef73f2a5d3d194e87230ec40500fe619': 20,
  };
}

export async function fetchEternalFarmAPR() {
  // const apiURL = 'https://api.algebra.finance/api/APR/eternalFarmings/'

  // try {
  //     return await fetch(apiURL).then(v => v.json())

  // } catch (error: any) {
  //     return {}
  // }

  return {
    '0x55dc5b743a752ba1ab84395a15feae0be5be99d1': 50,
  };
}
