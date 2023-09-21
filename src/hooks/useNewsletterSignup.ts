import { useMutation } from '@tanstack/react-query';

export const useSubscribeNewsletter = (formId?: string) => {
  return useMutation(async (input: any) => {
    const inputBody = {
      ...input,
      api_key: process.env.REACT_APP_CONVERTKIT_API_KEY,
    };

    const res = await fetch(
      `${process.env.REACT_APP_CONVERTKIT_API_URL}/forms/${formId}/subscribe`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputBody),
      },
    );
    const data = await res.json();
    return data;
  });
};
