import {
  CreateTRPCReact,
  createTRPCReact,
  httpBatchLink,
} from '@trpc/react-query';

import { AppRouter } from '@soulsolidity/soul-zap-trpc-client';

export const SoulZapApiClient: CreateTRPCReact<
  AppRouter,
  any,
  null
> = createTRPCReact<AppRouter>();

export const createSoulZapApiClient = (apiUrl?: string) => {
  return SoulZapApiClient.createClient({
    links: [
      httpBatchLink({
        url: apiUrl || 'http://localhost:3001',
      }),
    ],
  });
};
