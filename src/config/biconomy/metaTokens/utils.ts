import metaTokens from 'config/biconomy/metaTokens';

export function getMatchingMetaToken(token: any) {
  let matchingMetaToken;
  if (token.address) {
    matchingMetaToken = metaTokens.find(
      (t) => t.token.address.toLowerCase() === token.address.toLowerCase(),
    );
  }
  return matchingMetaToken;
}

export function isGaslessEnabledForToken(token: any) {
  return !!getMatchingMetaToken(token);
}
