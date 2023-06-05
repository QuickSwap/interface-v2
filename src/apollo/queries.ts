import gql from 'graphql-tag';

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
