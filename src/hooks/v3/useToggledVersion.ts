import { useRouter } from 'next/router';

export enum Version {
  v2 = 'V2',
  v3 = 'V3',
}

export const DEFAULT_VERSION: Version = Version.v3;

export default function useToggledVersion(): Version {
  const { query } = useRouter();
  if (typeof query.use !== 'string') {
    return DEFAULT_VERSION;
  }
  switch (query.use.toLowerCase()) {
    case 'v2':
      return Version.v2;
    case 'v3':
      return Version.v3;
    default:
      return Version.v3;
  }
}
