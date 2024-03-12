import { useMutation } from '@tanstack/react-query';

export const useSubscribeNewsletter = () => {
  return useMutation(async (email: string) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_LEADERBOARD_APP_URL}/utils/sendgrid-contact`,
        {
          method: 'POST',
          body: JSON.stringify({ email }),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!res.ok) {
        return { error: 'Error' };
      }
      const data = await res.json();
      return data;
    } catch (e) {
      return { error: e.message };
    }
  });
};
