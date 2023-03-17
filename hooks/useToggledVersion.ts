import { useRouter } from 'next/router';

export enum Version {
  v1 = 'v1',
  v2 = 'v2',
}

export const DEFAULT_VERSION: Version = Version.v2;

export default function useToggledVersion(): Version {
  const { query } = useRouter();
  if (!query.use || typeof query.use !== 'string') return Version.v2;
  if (query.use.toLowerCase() === 'v1') return Version.v1;
  return DEFAULT_VERSION;
}
