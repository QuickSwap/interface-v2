import gql from 'graphql-tag';

export const TOKEN_PRICES_V2 = (tokens: string[], blockNumber?: number) => {
  let tokenString = `[`;
  tokens.map((address) => {
    return (tokenString += `"${address.toLowerCase()}",`);
  });
  tokenString += ']';
  const queryString =
    `query tokens {
      tokens(where: {id_in: ${tokenString}},` +
    (blockNumber ? `block: {number: ${blockNumber}} ,` : ``) +
    ` first: 1000) {
        id
        derivedETH
      }
    }`;

  return gql(queryString);
};

export const GET_LENS_PROFILES = gql`
  query($ownedBy: [EthereumAddress!]) {
    profiles(request: { ownedBy: $ownedBy }) {
      items {
        name
        handle
        ownedBy
        bio
        id
      }
    }
  }
`;
