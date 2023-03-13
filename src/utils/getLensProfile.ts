import { lensClient } from 'apollo/client';
import { GET_LENS_PROFILES } from 'apollo/queries';
import { LensProfile } from 'models/interfaces/lens';

function chunkArray(arr: string[], chunkSize = 50) {
  const resultArray = [];
  for (let i = 0, len = arr.length; i < len; i += chunkSize)
    resultArray.push(arr.slice(i, i + chunkSize));
  return resultArray;
}

export const getLensProfiles = async (
  addressArray: string[],
): Promise<Array<LensProfile | undefined> | undefined> => {
  // We can only query 50 profile at a time form lens,
  // divide array of address in chunks of 50 address
  const chunkedAddressArray = chunkArray(addressArray, 50);
  try {
    // For each chunk of 50 address query lens
    // We don't require to throw error even if any query fails, we will simply display address in that case
    const result = await Promise.allSettled(
      chunkedAddressArray.map((e) => {
        return lensClient.query({
          query: GET_LENS_PROFILES,
          variables: {
            ownedBy: e,
          },
          fetchPolicy: 'network-only',
        });
      }),
    );

    const fetchedProfiles = result
      .filter((e) => e.status === 'fulfilled')
      .map((e: any) => e.value.data.profiles.items)
      .flat();

    const mappedAddress = addressArray.map((addr) => {
      return fetchedProfiles.find(
        (profile) => profile.ownedBy.toLowerCase() === addr.toLowerCase(),
      );
    });
    return mappedAddress;
  } catch (e) {
    console.error('Error: getLensProfile : ', e);
  }
};
