import { CheckOutLink } from './styled';

export function CheckOut({ link }: { link: string }) {
  return (
    <CheckOutLink to={`/farming/${link}`}>
      <span>✨ New farm is available →</span>
    </CheckOutLink>
  );
}
