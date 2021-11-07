import gql from 'graphql-tag'
import { BUNDLE_ID, FACTORY_ADDRESS } from 'constants/index'

export const SUBGRAPH_HEALTH = gql`
  query health {
    indexingStatusForCurrentVersion(subgraphName: "sameepsi/quickswap06") {
      synced
      health
      chains {
        chainHeadBlock {
          number
        }
        latestBlock {
          number
        }
      }
    }
  }
`

export const TOKEN_CHART = gql`
  query tokenDayDatas($tokenAddr: String!) {
    tokenDayDatas(first: 1, orderBy: date, orderDirection: desc, where: { token: $tokenAddr }) {
      id
      date
      priceUSD
      totalLiquidityToken
      totalLiquidityUSD
      totalLiquidityETH
      dailyVolumeETH
      dailyVolumeToken
      dailyVolumeUSD
      
    }
  }
`

const PairFields = `
  fragment PairFields on Pair {
    id
    trackedReserveETH
    volumeUSD
    reserveUSD
    totalSupply
    token0 {
      symbol
      id
    }
    token1 {
      symbol
      id
    }
  }
`

export const PAIRS_CURRENT = () => {
  const queryString = `
  query pairs {
    pairs(first: 200, orderBy: reserveUSD, orderDirection: desc) {
      id
    }
  }`
  return gql(queryString)
}

export const PAIRS_BULK = (pairs) => {
  let pairsString = `[`
  pairs.map((pair) => {
    return (pairsString += `"${pair.toLowerCase()}"`)
  })
  pairsString += ']'
  let queryString = `
  ${PairFields}
  query pairs {
    pairs(first: 1000, where: { id_in: ${pairsString} }, orderBy: trackedReserveETH, orderDirection: desc) {
      ...PairFields
    }
  }
  `
  return gql(queryString)
}

export const PAIRS_BULK1 = gql`
  ${PairFields}
  query pairs($allPairs: [Bytes]!) {
    pairs(first: 500, where: { id_in: $allPairs }, orderBy: trackedReserveETH, orderDirection: desc) {
      ...PairFields
    }
  }
`

const TokenFields = `
  fragment TokenFields on Token {
    id
    name
    symbol
    derivedETH
    tradeVolume
    tradeVolumeUSD
    untrackedVolumeUSD
    totalLiquidity
  }
`

export const TOKENS_CURRENT = () => {
  const queryString = `
  ${TokenFields}
  query tokens {
    tokens(first: 500, orderBy: tradeVolumeUSD, orderDirection: desc) {
      ...TokenFields
    }
  }
`
  return gql(queryString)
}

export const TOKENS_DYNAMIC = (block) => {
  const queryString = `
    ${TokenFields}
    query tokens {
      tokens(block: {number: ${block}} first: 200, orderBy: tradeVolumeUSD, orderDirection: desc) {
        ...TokenFields
      }
    }
  `
  return gql(queryString)
}

export const TOKEN_DATA = (tokenAddress, block) => {
  const queryString = `
    ${TokenFields}
    query tokens {
      tokens(${block ? `block : {number: ${block}}` : ``} where: {id:"${tokenAddress}"}) {
        ...TokenFields
      }
      pairs0: pairs(where: {token0: "${tokenAddress}"}, first: 50, orderBy: reserveUSD, orderDirection: desc){
        id
      }
      pairs1: pairs(where: {token1: "${tokenAddress}"}, first: 50, orderBy: reserveUSD, orderDirection: desc){
        id
      }
    }
  `
  return gql(queryString)
}

export const TOKEN_DATA1 = (tokenAddress, tokenAddress1) => {
  const queryString = `
    ${TokenFields}
    query tokens {
      pairs0: pairs(where: {token0: "${tokenAddress}", token1: "${tokenAddress1}"}){
        id
      }
      pairs1: pairs(where: {token0: "${tokenAddress}", token1_not: "${tokenAddress1}"}, first: 2, orderBy: reserveUSD, orderDirection: desc){
        id
      }
      pairs2: pairs(where: {token1: "${tokenAddress}", token0_not: "${tokenAddress1}"}, first: 2, orderBy: reserveUSD, orderDirection: desc){
        id
      }
      pairs3: pairs(where: {token0: "${tokenAddress1}", token1_not: "${tokenAddress}"}, first: 2, orderBy: reserveUSD, orderDirection: desc){
        id
      }
      pairs4: pairs(where: {token1: "${tokenAddress1}", token0_not: "${tokenAddress}"}, first: 2, orderBy: reserveUSD, orderDirection: desc){
        id
      }
    }
  `
  return gql(queryString)
}

export const PAIR_DATA = (pairAddress, block) => {
  const queryString = `
    ${PairFields}
    query pairs {
      pairs(${block ? `block: {number: ${block}}` : ``} where: { id: "${pairAddress}"} ) {
        ...PairFields
      }
    }`
  return gql(queryString)
}

export const ETH_PRICE = (block) => {
  const queryString = block
    ? `
    query bundles {
      bundles(where: { id: ${BUNDLE_ID} } block: {number: ${block}}) {
        id
        ethPrice
      }
    }
  `
    : ` query bundles {
      bundles(where: { id: ${BUNDLE_ID} }) {
        id
        ethPrice
      }
    }
  `
  return gql(queryString)
}

export const PAIRS_HISTORICAL_BULK = (block, pairs) => {
  let pairsString = `[`
  pairs.map((pair) => {
    return (pairsString += `"${pair.toLowerCase()}"`)
  })
  pairsString += ']'
  let queryString = `
  query pairs {
    pairs(first: 100, where: {id_in: ${pairsString}}, block: {number: ${block}}, orderBy: trackedReserveETH, orderDirection: desc) {
      id
      reserveUSD
      trackedReserveETH
      volumeUSD
      untrackedVolumeUSD
      totalSupply
    }
  }
  `
  return gql(queryString)
}

export const GLOBAL_DATA = (block) => {
  const queryString = ` query uniswapFactories {
      uniswapFactories(
       ${block ? `block: { number: ${block}}` : ``} 
       where: { id: "${FACTORY_ADDRESS}" }) {
        id
        totalVolumeUSD
        totalVolumeETH
        untrackedVolumeUSD
        totalLiquidityUSD
        totalLiquidityETH
        txCount
        pairCount
      }
    }`
  return gql(queryString)
}

export const GET_BLOCK = gql`
  query blocks($timestampFrom: Int!, $timestampTo: Int!) {
    blocks(
      first: 1
      orderBy: timestamp
      orderDirection: asc
      where: { timestamp_gt: $timestampFrom, timestamp_lt: $timestampTo }
    ) {
      id
      number
      timestamp
    }
  }
`

export const GET_BLOCKS = (timestamps) => {
  let queryString = 'query blocks {'
  queryString += timestamps.map((timestamp) => {
    return `t${timestamp}:blocks(first: 1, orderBy: timestamp, orderDirection: desc, where: { timestamp_gt: ${timestamp}, timestamp_lt: ${
      timestamp + 600
    } }) {
      number
    }`
  })
  queryString += '}'
  return gql(queryString)
}
